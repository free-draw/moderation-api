import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import LogModel from "../../model/Log"
import ModeratorModel from "../../model/Moderator"
import LogType from "../../types/enum/LogType"
import Permission from "../../types/Permission"

const ModeratorNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find moderator with specified id",
	StatusCodes.NOT_FOUND
)

type UpdateModeratorRequest = FastifyRequest<{
	Params: {
		moderatorId: string,
	},

	Body: {
		name?: string,
		permissions?: Permission[],
		active?: boolean,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators/:moderatorId",
		method: "PATCH",

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

			body: {
				type: "object",
				properties: {
					name: { type: "string" },
					permissions: {
						type: "array",
						items: { type: "string" },
					},
					active: { type: "boolean" },
				},
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "Moderator" },
					},
					required: [
						"moderator",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("moderators/update"),
		], { relation: "and" }),

		handler: async function(request: UpdateModeratorRequest) {
			const { name, permissions, active } = request.body

			const moderator = await ModeratorModel.findById(request.params.moderatorId)
			if (!moderator) throw new ModeratorNotFoundError()

			if (name) moderator.name = name
			if (permissions) moderator.permissions = permissions
			if (active) moderator.active = active

			await moderator.save()

			if (request.identity) {
				LogModel.push(request.identity, LogType.UPDATE_MODERATOR, {
					moderatorId: moderator._id.toString(),
					name, permissions, active,
				})
			}

			return {
				moderator: moderator.serialize(),
			}
		} as RouteHandlerMethod,
	})
}