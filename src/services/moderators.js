const { OK, CREATED, NOT_FOUND } = require("../util/statusCodes")
const parseAccount = require("../util/parseAccount")

const AccountType = require("../enum/AccountType")
const LogType = require("../enum/LogType")

const Moderator = require("../models/Moderator")
const Log = require("../models/Log")

async function ModeratorsService(fastify) {
	fastify.addSchema({
		$id: "#Moderator",
		type: "object",
		properties: {
			id: { type: "string" },
			name: { type: "string" },
			active: { type: "boolean" },
			accounts: { type: "array", items: { $ref: "#ModeratorAccount" } },
		},
		required: [
			"id",
			"name",
			"active",
			"accounts",
		],
	})

	fastify.addSchema({
		$id: "#ModeratorAccount",
		type: "object",
		properties: {
			type: { type: "string" },
			id: { oneOf: [ { type: "string" }, { type: "number" } ] },
		},
		required: [
			"type",
			"id",
		],
	})

	fastify.route({
		method: "GET",
		path: "/:moderatorId",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
					},
				},
			},
		},

		async handler(request) {
			let moderator = await Moderator.findById(request.params.moderatorId)
			
			if (moderator) {
				return {
					moderator: moderator.serialize(),
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find moderator with ID",
				}
			}
		},
	})

	fastify.route({
		method: "GET",
		path: "/:accountType/:accountId",

		schema: {
			params: {
				type: "object",
				properties: {
					accountType: { type: "string", enum: Object.keys(AccountType) },
					accountId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
					},
				},
			},
		},

		async handler(request) {
			let [ accountType, accountId ] = parseAccount(request.params.accountType, request.params.accountId)
			let moderator = await Moderator.findByAccount(accountType, accountId)

			if (moderator) {
				return {
					moderator: moderator.serialize(),
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find account with type and ID",
				}
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/",

		schema: {
			body: {
				type: "object",
				properties: {
					name: { type: "string" },
				},
			},

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
					},
				},
			},
		},
		
		async handler(request, reply) {
			let moderator = new Moderator({
				name: request.body.name,
			})

			await moderator.save()
			await Log.create({
				type: LogType.CREATE_MODERATOR,
				identity: request.identity,
				moderator: moderator.serialize(),
			})

			reply.status(CREATED)
			return {
				moderator: moderator.serialize(),
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/:moderatorId/accounts",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
			},

			body: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(AccountType) },
					id: { type: "string" },
				},
				required: [
					"type",
					"id",
				],
			},

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
						account: { $ref: "#ModeratorAccount" },
					},
				},
			},
		},

		async handler(request, reply) {
			let moderator = await Moderator.findById(request.params.moderatorId)

			if (moderator) {
				const [ accountType, accountId ] = parseAccount(request.body.type, request.body.id)

				const account = {
					type: accountType,
					id: accountId,
				}

				moderator.accounts.push(account)
				await moderator.save()

				await Log.create({
					type: LogType.CREATE_MODERATOR_ACCOUNT,
					identity: request.identity,
					moderator: moderator.serialize(),
					account: account,
				})

				reply.status(CREATED)
				return {
					moderator: moderator.serialize(),
					account: account,
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find moderator with ID"
				}
			}
		},
	})

	fastify.route({
		method: "DELETE",
		path: "/:moderatorId",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
					},
				},
			},
		},

		async handler(request) {
			let moderator = await Moderator.findByIdAndDelete(request.params.moderatorId)

			await Log.create({
				type: LogType.DELETE_MODERATOR,
				identity: request.identity,
				moderator: moderator.serialize(),
			})

			return {
				moderator: moderator.serialize(),
			}
		},
	})

	fastify.route({
		method: "DELETE",
		path: "/:moderatorId/accounts/:accountType/:accountId",

		schema: {
			params: {
				type: "object",
				properties: {
					moderatorId: { type: "string" },
					accountType: { type: "string", enum: Object.keys(AccountType) },
					accountId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						moderator: { $ref: "#Moderator" },
						account: { $ref: "#ModeratorAccount" },
					},
				},
			},
		},

		async handler(request) {
			let moderator = await Moderator.findById(request.params.moderatorId)

			let [ accountType, accountId ] = parseAccount(request.params.accountType, request.params.accountId)
			let accountIndex = moderator.accounts.findIndex(account => account.type === accountType && account.id === accountId)
			
			if (accountIndex !== -1) {
				let account = moderator.accounts[accountIndex]
				moderator.accounts.splice(accountIndex)

				await moderator.save()
				await Log.create({
					type: LogType.DELETE_MODERATOR_ACCOUNT,
					identity: request.identity,
					moderator: moderator.serialize(),
					account: account,
				})

				return {
					moderator: moderator.serialize(),
					account: account,
				}
			}
		},
	})
}

ModeratorsService.autoPrefix = "/moderators"

module.exports = ModeratorsService