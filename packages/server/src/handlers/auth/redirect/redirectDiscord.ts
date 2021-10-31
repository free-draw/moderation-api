import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import { URL } from "url"
import env from "../../../util/option/env"

type RedirectDiscordRequest = FastifyRequest<{}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/auth/redirect/discord",
		method: "GET",

		schema: {
			response: {
				[StatusCodes.TEMPORARY_REDIRECT]: {
					type: "object",
					properties: {
						url: { type: "string" },
					},
					required: [
						"url",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		handler: async function(_request: RedirectDiscordRequest, reply: FastifyReply) {
			const url = new URL("https://discord.com/oauth2/authorize")
			url.searchParams.set("client_id", env.discordClientId)
			url.searchParams.set("redirect_uri", env.discordRedirectUrl)
			url.searchParams.set("scope", "identify")
			url.searchParams.set("response_type", "code")

			reply.redirect(StatusCodes.TEMPORARY_REDIRECT, url.toString())
			return { url: url.toString() }
		} as RouteHandlerMethod,
	})
}