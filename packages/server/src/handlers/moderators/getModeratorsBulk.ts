import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ModeratorModel, { ModeratorDocument } from "../../model/Moderator"

type GetModeratorsBulkRequest = FastifyRequest<{
	Body: {
		moderatorIds: string[],
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/bulk/moderators",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					moderatorIds: {
						type: "array",
						items: { type: "string" },
					},
				},
				required: [
					"moderatorIds",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						moderators: {
							type: "array",
							items: { $ref: "Moderator" },
						},
					},
					required: [
						"moderators",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("moderators/get/bulk"),
		], { relation: "and" }),

		handler: async function(request: GetModeratorsBulkRequest) {
			const moderators = await ModeratorModel.find({
				_id: { $in: request.body.moderatorIds },
			}) as ModeratorDocument[]

			return {
				moderators: moderators.map(moderator => moderator.serialize()),
			}
		} as RouteHandlerMethod,
	})
}