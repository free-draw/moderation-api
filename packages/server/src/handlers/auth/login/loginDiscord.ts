import axios from "axios"
import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import { URLSearchParams } from "url"
import ModeratorModel, { ModeratorDocument } from "../../../model/Moderator"
import AccountPlatform from "../../../types/enum/AccountPlatform"
import TokenType from "../../../types/enum/TokenType"
import env from "../../../util/option/env"

const LoginDiscordUnknownError = createError(
	"LOGIN_DISCORD_UNKNOWN",
	"Discord user is not registered in database",
	StatusCodes.UNAUTHORIZED
)

const LoginAccountDisabledError = createError(
	"LOGIN_ACCOUNT_DISABLED",
	"Account is disabled",
	StatusCodes.FORBIDDEN
)

type AccessToken = {
	accessToken: string,
	refreshToken: string,
	duration: number,
	scope: string,
	accessTokenType: string,
}

async function getAccessToken(code: string): Promise<AccessToken> {
	const params = new URLSearchParams({
		client_id: env.discordClientId,
		client_secret: env.discordClientSecret,
		grant_type: "authorization_code",
		code: code,
		redirect_uri: env.discordRedirectUrl,
	})

	const { data } = await axios.post<{
		access_token: string,
		refresh_token: string,
		expires_in: number,
		scope: string,
		token_type: string,
	}>("https://discord.com/api/oauth2/token", params, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	})

	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		duration: data.expires_in,
		scope: data.scope,
		accessTokenType: data.token_type,
	}
}

type LoginDiscordRequest = FastifyRequest<{
	Querystring: {
		code: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/auth/login/discord",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					code: { type: "string" },
				},
				requireD: [
					"code",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						token: { type: "string" },
						type: { type: "string" },
					},
					required: [
						"token",
						"type",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		handler: async function(request: LoginDiscordRequest, reply: FastifyReply) {
			const { accessToken, accessTokenType } = await getAccessToken(request.query.code)

			const response = await axios.get<{
				id: string,
			}>("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${accessTokenType} ${accessToken}`,
				},
			})

			const moderator = await ModeratorModel.findByAccount(AccountPlatform.DISCORD, response.data.id) as ModeratorDocument
			if (!moderator) throw new LoginDiscordUnknownError()
			if (!moderator.active) throw new LoginAccountDisabledError()

			const token = fastify.jwt.sign({
				type: TokenType.USER,
				id: moderator._id.toString(),
				tag: "login",
			})

			reply.cookie("token", token, { path: "/" })
			reply.redirect("/")

			return {
				token,
				type: "Bearer",
			}
		} as RouteHandlerMethod,
	})
}