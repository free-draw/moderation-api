const { OK, CREATED, NOT_FOUND } = require("../util/statusCodes")

const User = require("../models/User")
const Log = require("../models/Log")

const ActionType = require("../enum/ActionType")
const LogType = require("../enum/LogType")

async function UsersService(fastify) {
	fastify.addSchema({
		$id: "#Action",
		type: "object",
		properties: {
			id: { type: "string" },
			type: { type: "string", enum: Object.keys(ActionType) },
			data: { type: "object" },
			expiry: { type: "string", format: "date-time" },
			active: { type: "boolean" },

			reason: { type: "string" },
			attachments: { type: "array", items: { type: "string" } },
			
			timestamp: { type: "string", format: "date-time" },
		},
	})

	fastify.addSchema({
		$id: "#User",
		type: "object",
		properties: {
			userId: { type: "integer" },
			actions: { type: "array", items: { $ref: "#Action" } },
			history: { type: "array", items: { $ref: "#Action" } },
		},
	})

	fastify.route({
		method: "GET",
		path: "/:userId",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "integer" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						user: { $ref: "#User" },
					},
				},
			},
		},

		async handler(request) {
			let user = await User.get(request.params.userId)

			return {
				user: user.serialize(),
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/",

		schema: {
			body: {
				type: "array",
				items: { type: "integer" },
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						users: { type: "array", items: { $ref: "#User" } },
					},
				},
			},
		},

		async handler(request) {
			return {
				users: await Promise.all(
					request.body.map(userId => User.get(userId).then(user => user.serialize())),
				)
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/:userId",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "integer" },
				},
			},

			body: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(ActionType) },
					data: { type: "object" },
					expiry: { type: "string", format: "date-time" },
					reason: { type: "string" },
					notes: { type: "string" },
					snapshot: { type: "string" },
				},
			},

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
				},
			}
		},

		async handler(request, reply) {
			let user = await User.get(request.params.userId)

			let action = user.issueAction(request.body)
			await user.save()

			await Log.create({
				type: LogType.CREATE_ACTION,
				identity: request.identity,
				userId: user.id,
				action: action.serialize(),
			})

			reply.status(CREATED)
			return {
				id: action.id,
			}
		},
	})

	fastify.route({
		method: "DELETE",
		path: "/:userId/action/:actionId",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "integer" },
					actionId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						discarded: { type: "array", items: { $ref: "#Action" } },
					},
				},
			},
		},

		async handler(request) {
			let user = await User.get(request.params.userId)
			let filteredActions = user.filterActions(action => action.id === request.params.actionId)

			if (filteredActions.length > 0) {
				await user.save()

				for (let index = 0; index < filteredActions.length; index++) {
					let action = filteredActions[index]

					await Log.create({
						type: LogType.DISCARD_ACTION_BY_ID,
						identity: request.identity,
						data: {
							userId: user.id,
							actionId: action.id,
						},
					})
				}

				return {
					discarded: filteredActions.map(action => action.serialize())
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find action with provided ID",
				}
			}
		},
	})

	fastify.route({
		method: "DELETE",
		path: "/:userId/type/:actionType",

		schema: {
			params: {
				type: "object",
				properties: {
					userId: { type: "integer" },
					actionType: { type: "string", enum: Object.keys(ActionType) },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						discarded: { type: "array", items: { $ref: "#Action" } },
					},
				},
			},
		},

		async handler(request) {
			let user = await User.get(request.params.userId)
			let filteredActions = user.filterActions(action => action.type === request.params.actionType)

			if (filteredActions.length > 0) {
				await user.save()

				for (let index = 0; index < filteredActions.length; index++) {
					let action = filteredActions[index]

					await Log.create({
						type: LogType.DISCARD_ACTION_BY_TYPE,
						identity: request.identity,
						data: {
							type: request.params.actionType,
							userId: user.id,
							actionId: action.id,
						},
					})
				}

				return {
					discarded: filteredActions.map(action => action.serialize())
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find any actions with provided type",
				}
			}
		},
	})
}

UsersService.autoPrefix = "/users"

module.exports = UsersService