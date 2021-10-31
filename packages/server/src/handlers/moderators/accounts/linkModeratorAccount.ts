import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../../auth/authIdentity"
import authPermissions from "../../../auth/authPermissions"
import authToken from "../../../auth/authToken"
import LogModel from "../../../model/Log"
import ModeratorModel, { ModeratorDocument } from "../../../model/Moderator"
import AccountPlatform from "../../../types/enum/AccountPlatform"
import LogType from "../../../types/enum/LogType"

const ModeratorNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find moderator with specified id",
	StatusCodes.NOT_FOUND
)

type LinkModeratorAccountRequest = FastifyRequest<{
	Params: {
		moderatorId: string,
	},

	Body: {
		platform: AccountPlatform,
		id: string | number,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators/:moderatorId/accounts",
		method: "POST",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
				required: [
					"moderatorId"
				],
				additionalProperties: false,
			} as JSONSchema,

			body: {
				type: "object",
				properties: {
					platform: { type: "string", enum: Object.keys(AccountPlatform) },
					id: { type: [ "string", "number" ] },
				},
				required: [
					"platform",
					"id",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.CREATED]: {
					type: "object",
					properties: {
						moderator: { $ref: "Moderator" },
						account: { $ref: "ModeratorAccount" },
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
			authPermissions("moderators/accounts/link"),
		], { relation: "and" }),

		handler: async function(request: LinkModeratorAccountRequest, reply: FastifyReply) {
			const moderator = await ModeratorModel.findById(request.params.moderatorId) as ModeratorDocument
			if (!moderator) throw new ModeratorNotFoundError()
			moderator.accounts.push(request.body)
			await moderator.save()

			if (request.identity) {
				await LogModel.push(request.identity, LogType.LINK_MODERATOR_ACCOUNT, {
					moderatorId: moderator._id.toString(),
					account: request.body,
				})
			}

			reply.status(StatusCodes.CREATED)
			return {
				moderator: moderator.serialize(),
				account: request.body,
			}
		} as RouteHandlerMethod,
	})
}