import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ModeratorModel, { ModeratorDocument } from "../../model/Moderator"
import parseAccount from "../../util/parseAccount"

const ModeratorNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find moderator with specified search parameters",
	StatusCodes.NOT_FOUND
)

type FindModeratorRequest = FastifyRequest<{
	Querystring: {
		account: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/moderators",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					account: { type: "string" },
					identity: { type: "string" },
				},
				required: [
					"account",
				],
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
				},
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("moderators/get/find"),
		], { relation: "and" }),

		handler: async function(request: FindModeratorRequest) {
			const account = parseAccount(request.query.account)
			const moderator = await ModeratorModel.findByAccount(account.platform, account.id) as ModeratorDocument
			if (!moderator) throw new ModeratorNotFoundError()

			return {
				moderator: moderator.serialize(),
			}
		} as RouteHandlerMethod,
	})
}