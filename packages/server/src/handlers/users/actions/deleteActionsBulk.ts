import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import App from "../../../App"
import authIdentity from "../../../auth/authIdentity"
import authPermissions from "../../../auth/authPermissions"
import authToken from "../../../auth/authToken"
import LogModel from "../../../model/Log"
import UserModel from "../../../model/User"
import ActionType from "../../../types/enum/ActionType"
import LogType from "../../../types/enum/LogType"

type DeleteActionsBulkRequest = FastifyRequest<{
	Params: {
		userId: string,
	},

	Querystring: {
		type?: ActionType,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/users/:userId/actions",
		method: "DELETE",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "string" },
				},
				required: [
					"userId",
				],
				additionalProperties: false,
			} as JSONSchema,

			querystring: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(ActionType) },
					identity: { type: "string" },
				},
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						actionIds: {
							type: "array",
							items: { type: "string" },
						},
					},
					required: [
						"actionIds",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("users/actions/delete/bulk"),
		], { relation: "and" }),

		handler: async function(request: DeleteActionsBulkRequest) {
			const user = await UserModel.get(request.params.userId)

			const actions = user.actions.filter((action) => {
				if (!action.active) return false

				const type = request.query.type
				if (type && action.type !== type) return false

				return true
			})
			actions.forEach(action => action.active = false)

			await user.save()

			actions.forEach((action) => {
				App.publish("actionDelete", {
					userId: user._id,
					action: action.serialize(),
				})
			})

			if (request.identity) {
				await LogModel.push(request.identity, LogType.DELETE_ACTIONS_BULK, {
					userId: user._id,
					actions: actions.map(action => action.serialize()),
				})
			}

			return {
				actionIds: actions.map(action => action._id.toString()),
			}
		} as RouteHandlerMethod,
	})
}