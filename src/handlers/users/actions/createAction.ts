import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import App from "../../../App"
import authIdentity from "../../../auth/authIdentity"
import authPermissions from "../../../auth/authPermissions"
import authToken from "../../../auth/authToken"
import LogModel from "../../../model/Log"
import UserModel, { UserDocument } from "../../../model/User"
import ActionType from "../../../types/enum/ActionType"
import LogType from "../../../types/enum/LogType"
import ObjectId from "../../../types/ObjectId"

type CreateActionRequest = FastifyRequest<{
	Params: {
		userId: string,
	},

	Body: {
		type: string,
		reason: string,
		notes?: string,
		snapshot?: ObjectId,
		report?: ObjectId,
		expiry?: Date | number,
		duration?: number,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/users/:userId/actions",
		method: "POST",

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

			body: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(ActionType) },
					reason: { type: "string" },
					notes: { type: "string" },
					snapshot: { type: "string" },
					expiry: {
						oneOf: [
							{ type: "integer" },
							{ type: "string", format: "date-time" },
						],
					},
					duration: { type: "integer" },
				},
				required: [
					"type",
					"reason",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.CREATED]: {
					type: "object",
					properties: {
						action: { $ref: "Action" },
					},
					required: [
						"action",
					],
					additionalProperties: false,
				},
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("users/actions/create"),
		], { relation: "and" }),

		handler: async function(request: CreateActionRequest, reply: FastifyReply) {
			const user = await UserModel.get(request.params.userId)
			const action = user.createAction(request.body)
			await user.save()

			if (request.identity) {
				await LogModel.push(request.identity, LogType.CREATE_ACTION, {
					userId: user._id,
					actionId: action._id.toString(),
				})
			}

			App.publish("actionCreate", {
				userId: user._id,
				action: action.serialize(),
			})

			reply.status(StatusCodes.CREATED)
			return {
				action: action.serialize(),
			}
		} as RouteHandlerMethod,
	})
}