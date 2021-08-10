const axios = require("axios")
const { OK, TEMPORARY_REDIRECT, FORBIDDEN, NOT_FOUND } = require("../util/statusCodes")

const Moderator = require("../models/Moderator")

const TokenType = require("../enum/TokenType")
const AccountType = require("../enum/AccountType")

async function getAccessToken(code) {
	const params = new URLSearchParams({
		client_id: process.env.DISCORD_CLIENT_ID,
		client_secret: process.env.DISCORD_CLIENT_SECRET,
		grant_type: "authorization_code",
		code: code,
		redirect_uri: process.env.DISCORD_REDIRECT_URL,
	})

	const { data } = await axios.post("https://discord.com/api/oauth2/token", params, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	})

	return {
		token: data.access_token,
		duration: data.expires_in,
		refreshToken: data.refresh_token,
		scope: data.scope,
		tokenType: data.token_type,
	}
}

async function AuthService(fastify) {
	fastify.route({
		method: "GET",
		path: "/me",

		config: {
			auth: true,
			permissions: [],
		},

		schema: {
			response: {
				[OK]: {
					type: "object",
					properties: {
						type: { type: "string", enum: Object.keys(TokenType) },
						id: { type: "string" },
					},
				},
			},
		},

		async handler(request) {
			return request.token
		},
	})

	fastify.route({
		method: "GET",
		path: "/discord",

		config: {},

		schema: {
			query: {
				type: "object",
				properties: {
					code: { type: "string" },
				},
				required: [
					"code",
				],
			},
		},

		async handler(request, reply) {
			const { tokenType, token } = await getAccessToken(request.query.code)

			const response = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${tokenType} ${token}`,
				},
			})

			const user = response.data
			const moderator = await Moderator.findByAccount(AccountType.DISCORD, user.id)

			if (moderator) {
				const token = fastify.jwt.sign({
					type: TokenType.USER,
					id: moderator.id,
					tag: "login",
					time: Date.now(),
				})

				reply.cookie("token", token, { path: "/" })
				reply.redirect("/")

				return { token, tokenType: "Bearer" }
			} else {
				throw {
					statusCode: FORBIDDEN,
					message: "Discord user is not registered in database",
				}
			}
		},
	})

	fastify.route({
		method: "GET",
		path: "/redirect/discord",

		config: {},

		async handler(_, reply) {
			const url = new URL("https://discord.com/oauth2/authorize")
			url.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID)
			url.searchParams.set("redirect_uri", process.env.DISCORD_REDIRECT_URL)
			url.searchParams.set("scope", "identify")
			url.searchParams.set("response_type", "code")

			reply.status(TEMPORARY_REDIRECT)
			reply.header("Location", url.toString())
			reply.send(url.toString())
		},
	})

	fastify.route({
		method: "POST",
		path: "/create/server",

		config: {
			auth: true,
			permissions: "auth/create/server",
		},

		schema: {
			body: {
				type: "object",
				properties: {
					tag: { type: "string" },
				},
				required: [
					"tag",
				],
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
				},
			},
		},

		async handler(request) {
			return {
				token: fastify.jwt.sign({
					type: TokenType.SERVER,
					tag: request.body.tag,
					time: Date.now(),
				}),
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/create/moderator/:moderatorId",

		config: {
			auth: true,
			permissions: "auth/create/moderator",
		},

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
			},

			body: {
				type: "object",
				properties: {
					tag: { type: "string" },
				},
				required: [
					"tag",
				],
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
				},
			},
		},

		async handler(request) {
			const moderator = await Moderator.findById(request.params.moderatorId)

			if (moderator) {
				return {
					token: fastify.jwt.sign({
						type: TokenType.USER,
						id: moderator.id,
						tag: request.body.tag,
						time: Date.now(),
					}),
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: `Can't find moderator with id ${request.params.id}`,
				}
			}
		},
	})
}

AuthService.autoPrefix = "/auth"

module.exports = AuthService