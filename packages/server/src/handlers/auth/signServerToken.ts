import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import TokenType from "../../types/enum/TokenType"

type SignServerTokenRequest = FastifyRequest<{
	Querystring: {
		tag?: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/auth/token/server",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					tag: { type: "string" },
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
			authPermissions("auth/token/server"),
		], { relation: "and" }),

		handler: async function(request: SignServerTokenRequest) {
			const token = fastify.jwt.sign({
				type: TokenType.SERVER,
				tag: request.query.tag,
			})

			return { token }
		} as RouteHandlerMethod,
	})
}