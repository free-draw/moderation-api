import axios from "axios"
import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"

type GetRobloxUsernamesBulkRequest = FastifyRequest<{
	Body: {
		usernames: string[],
		excludeBannedUsers?: boolean,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/roblox/usernames",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					usernames: {
						type: "array",
						items: { type: "string" },
					},
					excludeBannedUsers: { type: "boolean" },
				},
				required: [
					"usernames",
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
									requestedUsername: { type: "string" },
									id: { type: "integer" },
									name: { type: "string" },
									displayName: { type: "string" },
								},
								required: [
									"requestedUsername",
									"id",
									"name",
									"displayName",
								],
							},
						},
					},
					required: [
						"data",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("roblox/get/username/bulk"),
		]),

		handler: async function(request: GetRobloxUsernamesBulkRequest) {
			const response = await axios.post<{
				data: {
					requestedUsername: string,
					id: number,
					name: string,
					displayName: string,
				}[],
			}>("https://users.roblox.com/v1/usernames/users", request.body)

			return response.data
		} as RouteHandlerMethod,
	})
}