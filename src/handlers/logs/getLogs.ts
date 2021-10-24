import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import LogModel, { LogDocument } from "../../model/Log"
import LogType from "../../types/enum/LogType"
import NavigationDirection from "../../types/enum/NavigationDirection"
import SortDirection from "../../types/enum/SortDirection"
import PaginatedCursor, { PaginatedCursorData } from "../../util/class/PaginatedCursor"
import clearUndefinedFields from "../../util/clearUndefinedFields"

const LogCursorInvalidError = createError(
	"LOG_CURSOR_INVALID",
	"Failed to parse cursor",
	StatusCodes.BAD_REQUEST
)

type GetLogsRequest = FastifyRequest<{
	Querystring: {
		cursor?: string,
		type?: LogType,
		source?: string,
		direction?: SortDirection,
		after?: string,
		before?: string,
		size?: string,
	},
}>

type CursorData = {
	direction: NavigationDirection,
	data: PaginatedCursorData,
}

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/logs",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					cursor: { type: "string" },
					type: { type: "string", enum: Object.keys(LogType) },
					source: { type: "string" },
					direction: { type: "string", enum: Object.keys(SortDirection) },
					after: { type: "string", format: "date-time" },
					before: { type: "string", format: "date-time" },
					size: { type: "string" },
					identity: { type: "string" },
				},
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						nextPageCursor: { type: "string" },
						previousPageCursor: { type: "string" },
						index: { type: "integer" },
						logs: {
							type: "array",
							items: { $ref: "Log" },
						},
					},
					required: [
						"nextPageCursor",
						"previousPageCursor",
						"index",
						"logs",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("logs/get"),
		], { relation: "and" }),

		handler: async function(request: GetLogsRequest) {
			const query = request.query

			let cursor: PaginatedCursor<typeof LogModel, LogDocument>
			let direction: NavigationDirection

			if (query.cursor) {
				try {
					const data = fastify.jwt.verify(query.cursor) as CursorData
					cursor = PaginatedCursor.from(LogModel, data.data)
					direction = data.direction
				} catch {
					throw new LogCursorInvalidError()
				}
			} else {
				cursor = new PaginatedCursor(LogModel, {
					pageSize: query.size ? parseInt(query.size) : 50,
					sortProperty: "time",
					sortDirection: query.direction ?? SortDirection.DESCENDING,
					filter: clearUndefinedFields({
						type: query.type,
						source: query.source,
						time: query.before || query.after ? clearUndefinedFields({
							$lt: query.before ? new Date(query.before) : undefined,
							$gt: query.after ? new Date(query.after) : undefined,
						}) : undefined,
					}),
				})
				direction = NavigationDirection.NEXT
			}

			let logs: LogDocument[]
			switch (direction) {
				case NavigationDirection.NEXT:
					logs = await cursor.next()
					break

				case NavigationDirection.PREVIOUS:
					logs = await cursor.previous()
					break
			}

			const data = cursor.serialize()
			const nextPageCursor = fastify.jwt.sign({ direction: NavigationDirection.NEXT, data } as CursorData)
			const previousPageCursor = fastify.jwt.sign({ direction: NavigationDirection.PREVIOUS, data } as CursorData)

			return {
				index: cursor.state.pageIndex,
				nextPageCursor,
				previousPageCursor,
				logs,
			}
		} as RouteHandlerMethod,
	})
}