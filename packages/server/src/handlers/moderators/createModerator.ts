import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import LogModel from "../../model/Log"
import ModeratorModel, { ModeratorDocument } from "../../model/Moderator"
import LogType from "../../types/enum/LogType"
import Permission from "../../types/Permission"
import ModeratorAccount from "../../types/schema/ModeratorAccount"

type CreateModeratorRequest = FastifyRequest<{
	Body: {
		name: string,
		accounts?: ModeratorAccount[],
		permissions?: Permission[],
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					name: { type: "string" },
					accounts: {
						type: "array",
						items: { $ref: "ModeratorAccount" },
					},
					permissions: {
						type: "array",
						items: { type: "string" },
					},
				},
				required: [
					"name",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.CREATED]: {
					type: "object",
					properties: {
						moderatorId: { type: "string" },
					},
					required: [
						"moderatorId",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("moderators/create"),
		], { relation: "and" }),

		handler: async function(request: CreateModeratorRequest, reply: FastifyReply) {
			const moderator = await ModeratorModel.create(request.body) as ModeratorDocument

			if (request.identity) {
				await LogModel.push(request.identity, LogType.CREATE_MODERATOR, {
					moderatorId: moderator._id.toString(),
				})
			}

			reply.status(StatusCodes.CREATED)
			return {
				moderatorId: moderator._id.toString(),
			}
		} as RouteHandlerMethod,
	})
}