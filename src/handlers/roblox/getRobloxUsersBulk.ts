import axios from "axios"
import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import UserId from "../../types/UserId"

type GetRobloxUsersBulkRequest = FastifyRequest<{
	Body: {
		userIds: UserId[],
		excludeBannedUsers?: boolean,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/roblox/users",
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
				required: [
					"userIds",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						data: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "integer" },
									name: { type: "string" },
									displayName: { type: "string" },
								},
								required: [
									"id",
									"name",
									"displayName",
								],
								additionalProperties: false,
							},
						},
					},
					required: [
						"data",
					],
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("roblox/get/user/bulk"),
		], { relation: "and" }),

		handler: async function(request: GetRobloxUsersBulkRequest) {
			const response = await axios.post<{
				data: {
					id: UserId,
					name: string,
					displayName: string,
				}[],
			}>("https://users.roblox.com/v1/users", request.body)

			return response.data
		} as RouteHandlerMethod,
	})
}