import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import TokenType from "../../types/enum/TokenType"
import Token from "../../types/Token"

type SignModeratorTokenRequest = FastifyRequest<{
	Querystring: {
		id?: string,
		tag?: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/auth/token/moderator",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					tag: { type: "string" },
					id: { type: "string" },
					identity: { type: "string" },
				},
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
					required: [
						"token",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("auth/token/moderator"),
		], { relation: "and" }),

		handler: async function(request: SignModeratorTokenRequest) {
			const token = fastify.jwt.sign({
				type: TokenType.USER,
				id: request.query.id,
				tag: request.query.tag,
			} as Token)

			return { token }
		} as RouteHandlerMethod,
	})
}