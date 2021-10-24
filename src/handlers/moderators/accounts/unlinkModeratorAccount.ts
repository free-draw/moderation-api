import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
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
import ModeratorAccount from "../../../types/schema/ModeratorAccount"
import { parseAccountId } from "../../../util/parseAccount"

const ModeratorNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find moderator with specified id",
	StatusCodes.NOT_FOUND
)

type UnlinkModeratorAccountRequest = FastifyRequest<{
	Params: {
		moderatorId: string,
		accountPlatform: string,
		accountId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators/:moderatorId/accounts/:accountPlatform/:accountId",
		method: "DELETE",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
					accountPlatform: { type: "string", enum: Object.keys(AccountPlatform) },
					accountId: { type: "string" },
				},
				required: [
					"moderatorId",
					"accountPlatform",
					"accountId",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
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
			authPermissions("moderators/accounts/unlink"),
		], { relation: "and" }),

		handler: async function(request: UnlinkModeratorAccountRequest) {
			const accountPlatform = request.params.accountPlatform as AccountPlatform
			const accountId = parseAccountId(accountPlatform, request.params.accountId)

			const moderator = await ModeratorModel.findById(request.params.moderatorId) as ModeratorDocument
			if (!moderator) throw new ModeratorNotFoundError()
			moderator.accounts = moderator.accounts.filter(account => !(account.platform === accountPlatform && account.id === accountId))
			await moderator.save()

			const account = {
				platform: accountPlatform,
				id: accountId,
			} as ModeratorAccount

			if (request.identity) {
				LogModel.push(request.identity, LogType.UNLINK_MODERATOR_ACCOUNT, {
					moderatorId: moderator._id.toString(),
					account,
				})
			}

			return {
				moderator: moderator.serialize(),
				account,
			}
		} as RouteHandlerMethod,
	})
}