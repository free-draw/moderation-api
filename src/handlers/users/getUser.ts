import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import UserModel from "../../model/User"

type GetUserRequest = FastifyRequest<{
	Params: {
		userId: string,
	},
}>

export default async (fastify: FastifyInstance) => {
	fastify.route({
		url: "/users/:userId",
		method: "GET",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "string" },
				},
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						user: { $ref: "User" },
					},
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("users/get"),
		], { relation: "and" }),

		handler: async function(request: GetUserRequest) {
			const user = await UserModel.get(request.params.userId)

			return {
				user: user.serialize(),
			}
		} as RouteHandlerMethod,
	})
}