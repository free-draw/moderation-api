import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ModeratorModel, { ModeratorDocument } from "../../model/Moderator"

const ModeratorNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find moderator with specified id",
	StatusCodes.NOT_FOUND
)

type GetModeratorRequest = FastifyRequest<{
	Params: {
		moderatorId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators/:moderatorId",
		method: "GET",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
				required: [
					"moderatorId",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "Moderator" },
					},
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("moderators/get"),
		], { relation: "and" }),

		handler: async function(request: GetModeratorRequest) {
			const moderator = await ModeratorModel.findById(request.params.moderatorId) as ModeratorDocument
			if (!moderator) throw new ModeratorNotFoundError()

			return {
				moderator: moderator.serialize()
			}
		} as RouteHandlerMethod,
	})
}