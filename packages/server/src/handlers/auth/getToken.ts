import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authToken from "../../auth/authToken"
import TokenType from "../../types/enum/TokenType"

type GetTokenRequest = FastifyRequest<{}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/auth/token",
		method: "GET",

		schema: {
			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						type: { type: "number", enum: Object.keys(TokenType) },
						id: { type: "string" },
						tag: { type: "string" },
						time: { type: "integer" },
					},
					required: [
						"type",
					],
					additionalProperties: false,
				} as JSONSchema,
			}
		},

		preValidation: fastify.auth([
			authToken(),
		], { relation: "and" }),

		handler: async function(request: GetTokenRequest) {
			return request.token
		} as RouteHandlerMethod,
	})
}