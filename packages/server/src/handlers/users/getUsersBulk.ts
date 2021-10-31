import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import UserModel from "../../model/User"

type GetUsersBulkRequest = FastifyRequest<{
	Body: {
		userIds: number[],
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/users",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					userIds: {
						type: "array",
						items: { type: "integer" },
					},
				},
				userIds: [
					"users",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						users: {
							type: "array",
							items: { $ref: "User" },
						},
					},
					required: [
						"users",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("users/get/bulk"),
		], { relation: "and" }),

		handler: async function(request: GetUsersBulkRequest) {
			const users = await Promise.all(request.body.userIds.map(id => UserModel.get(id)))

			return {
				users: users.map(user => user.serialize()),
			}
		} as RouteHandlerMethod,
	})
}