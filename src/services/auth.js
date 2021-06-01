const axios = require("axios")
const { OK, FORBIDDEN } = require("../util/statusCodes")

const Moderator = require("../models/Moderator")

const TokenType = require("../enum/TokenType")
const AccountType = require("../enum/AccountType")

async function AuthService(fastify) {
	fastify.route({
		method: "GET",
		path: "/me",

		preValidation: [
			fastify.createPermissionValidator("auth/me"),
		],

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

		schema: {
			query: {
				type: "object",
				properties: {
					access_token: { type: "string" },
					token_type: { const: "Bearer" },
					expires_in: { type: "number" },
					scope: { const: "identify" },
					state: { type: "string" },
				},
				required: [
					"access_token",
					"token_type",
					"expires_in",
					"scope",
				],
			},
		},

		async handler(request, reply) {
			const response = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${request.query.token_type} ${request.query.access_token}`,
				},
			})

			const user = response.data
			const moderator = await Moderator.findByAccount(AccountType.DISCORD, user.id)

			if (moderator) {
				const token = fastify.jwt.sign({ type: TokenType.USER, id: moderator.id })

				reply.cookie("token", token)
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
}

AuthService.autoPrefix = "/auth"

module.exports = AuthService