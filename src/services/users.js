const { OK, CREATED, NOT_FOUND } = require("../util/statusCodes")

const User = require("../models/User")
const Log = require("../models/Log")

const ActionType = require("../enum/ActionType")
const LogType = require("../enum/LogType")

async function UsersService(fastify) {
	const redis = fastify.redis

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
			notes: { type: "string" },
			snapshot: { type: "string" },
			report: { type: "string" },
			
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

		config: {
			require: {
				auth: true,
				permissions: "users/get/id",
			},
		},

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
			const user = await User.get(request.params.userId)

			return {
				user: user.serialize(),
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/",

		config: {
			require: {
				auth: true,
				permissions: "users/get/id/bulk",
			},
		},

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
		path: "/:userId/actions",

		config: {
			require: {
				auth: true,
				permissions: "users/actions/create",
			},
		},

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
				required: [
					"type",
					"data",
					"reason",
					"snapshot",
				],
			},

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						actionId: { type: "string" },
					},
				},
			}
		},

		async handler(request, reply) {
			const user = await User.get(request.params.userId)

			const action = user.issueAction(request.body)
			await user.save()

			redis.publish("actionCreate", JSON.stringify({
				userId: user.id,
				action: action.serialize(),
			}))
			await Log.create({
				type: LogType.CREATE_ACTION,
				identity: request.identity,
				data: {
					userId: user.id,
					action: action.serialize(),
				},
			})

			reply.status(CREATED)
			return {
				actionId: action.id,
			}
		},
	})

	fastify.route({
		method: "DELETE",
		path: "/:userId/action/:actionId",

		config: {
			require: {
				auth: true,
				permissions: "users/actions/delete/id",
			},
		},

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
						discardedActions: { type: "array", items: { $ref: "#Action" } },
					},
				},
			},
		},

		async handler(request) {
			const user = await User.get(request.params.userId)
			const filteredActions = user.filterActions(action => action.id === request.params.actionId)

			if (filteredActions.length > 0) {
				await user.save()

				for (let index = 0; index < filteredActions.length; index++) {
					const action = filteredActions[index]

					redis.publish("actionDelete", JSON.stringify({
						userId: user.id,
						action: action.serialize(),
					}))
					await Log.create({
						type: LogType.DISCARD_ACTION_BY_ID,
						identity: request.identity,
						data: {
							userId: user.id,
							action: action.serialize(),
						},
					})
				}

				return {
					discardedActions: filteredActions.map(action => action.serialize())
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

		config: {
			auth: true,
			permissions: "users/actions/delete/type",
		},

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
						discardedActions: { type: "array", items: { $ref: "#Action" } },
					},
				},
			},
		},

		async handler(request) {
			const user = await User.get(request.params.userId)
			const filteredActions = user.filterActions(action => action.type === request.params.actionType)

			if (filteredActions.length > 0) {
				await user.save()

				for (let index = 0; index < filteredActions.length; index++) {
					const action = filteredActions[index]

					redis.publish("actionDelete", JSON.stringify({
						userId: user.id,
						action: action.serialize(),
					}))
					await Log.create({
						type: LogType.DISCARD_ACTION_BY_TYPE,
						identity: request.identity,
						data: {
							type: request.params.actionType,
							userId: user.id,
							actionId: action.serialize(),
						},
					})
				}

				return {
					discardedActions: filteredActions.map(action => action.serialize())
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