import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import App from "../../../App"
import authIdentity from "../../../auth/authIdentity"
import authPermissions from "../../../auth/authPermissions"
import authToken from "../../../auth/authToken"
import LogModel from "../../../model/Log"
import UserModel from "../../../model/User"
import LogType from "../../../types/enum/LogType"

const ActionNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find action with specified id",
	StatusCodes.NOT_FOUND
)

type DeleteActionRequest = FastifyRequest<{
	Params: {
		userId: string,
		actionId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/users/:userId/actions/:actionId",
		method: "DELETE",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "string" },
					actionId: { type: "string" },
				},
				required: [
					"userId",
					"actionId",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						action: { $ref: "Action" },
					},
					required: [
						"action",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("users/actions/delete"),
		], { relation: "and" }),

		handler: async function(request: DeleteActionRequest) {
			const user = await UserModel.get(request.params.userId)
			const action = user.actions.find(findAction => findAction._id.toString() === request.params.actionId)
			if (!action) throw new ActionNotFoundError()
			action.active = false
			await user.save()

			if (request.identity) {
				await LogModel.push(request.identity, LogType.DELETE_ACTION, {
					userId: user._id,
					action: action.serialize(),
				})
			}

			App.publish("actionDelete", {
				userId: user._id,
				action: action.serialize(),
			})

			return {
				action: action.serialize(),
			}
		} as RouteHandlerMethod,
	})
}