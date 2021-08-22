const { OK, BAD_REQUEST } = require("../util/statusCodes")
const PaginatedCursor = require("../util/PaginatedCursor")
const clearUndefinedFields = require("../util/clearUndefinedFields")

const Log = require("../models/Log")

const NavigationAction = require("../enum/NavigationAction")
const LogType = require("../enum/LogType")
const SortDirection = require("../enum/SortDirection")

async function LogsService(fastify) {
	fastify.addSchema({
		$id: "#Log",
		type: "object",
		properties: {
			time: { type: "string", format: "date-time" },
			type: { type: "string", enum: Object.keys(LogType) },
			source: { type: "string" },
			data: { type: "object" },
		},
		required: [
			"time",
			"type",
		],
	})

	fastify.route({
		method: "GET",
		path: "/",

		config: {
			auth: true,
			permissions: "logs/get",
		},

		schema: {
			query: {
				type: "object",
				properties: {
					cursor: { type: "string" },
					type: { type: "string", enum: Object.keys(LogType) },
					source: { type: "string" },
					direction: { type: "string", enum: Object.keys(SortDirection) },
					after: { type: "string", format: "date-time" },
					before: { type: "string", format: "date-time" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						nextPageCursor: { type: "string" },
						previousPageCursor: { type: "string" },
						index: { type: "number" },
						logs: { type: "array", items: { $ref: "#Log" } },
					},
				},
			},
		},

		async handler(request) {
			const {
				cursor: cursorToken,
				type, source, direction, after, before, size,
			} = request.query

			let cursor
			let cursorAction

			if (cursorToken) {
				try {
					const cursorData = fastify.jwt.verify(cursorToken)
					cursor = new PaginatedCursor(Log, cursorData.data)
					cursorAction = NavigationAction[cursorData.action]
				} catch {
					throw {
						statusCode: BAD_REQUEST,
						message: "Invalid cursor token",
					}
				}
			} else {
				cursor = PaginatedCursor.create(Log, {
					pageSize: size ?? 50,
					sortProperty: "time",
					sortDirection: direction ?? SortDirection.DESCENDING,
					filter: clearUndefinedFields({
						type,
						source,
						time: after || before ? clearUndefinedFields({
							$gt: after ? new Date(after) : undefined,
							$lt: before ? new Date(before) : undefined,
						}) : undefined,
					}),
				})
				cursorAction = NavigationAction.NEXT
			}

			let logs
			if (cursorAction === NavigationAction.NEXT) {
				logs = await cursor.next()
			} else if (cursorAction === NavigationAction.PREVIOUS) {
				logs = await cursor.previous()
			}

			const cursorData = cursor.serialize()
			const nextPageCursor = fastify.jwt.sign({ action: NavigationAction.NEXT, data: cursorData })
			const previousPageCursor = fastify.jwt.sign({ action: NavigationAction.PREVIOUS, data: cursorData })

			return {
				index: cursor.state.pageIndex,
				nextPageCursor,
				previousPageCursor,
				logs,
			}
		},
	})
}

LogsService.autoPrefix = "/logs"

module.exports = LogsService