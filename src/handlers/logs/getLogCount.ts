import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import LogModel from "../../model/Log"
import LogType from "../../types/enum/LogType"
import TimeSpan from "../../types/enum/TimeSpan"

type GetLogCountRequest = FastifyRequest<{
	Querystring: {
		type: LogType,
		span: TimeSpan,
		moderator?: string,
	},
}>

type GetLogCountFilter = {
	type: LogType,
	time: { $gt: Date },
	moderator?: string,
}

function getTimeRange(span: TimeSpan): { from: Date, to: Date } {
	const from = new Date()
	const to = new Date()

	switch (span) {
		case TimeSpan.DAY:
			from.setDate(from.getDate() - 1)
			break
		case TimeSpan.WEEK:
			from.setDate(from.getDate() - 7)
			break
		case TimeSpan.MONTH:
			from.setDate(from.getDate() - 30)
			break
		case TimeSpan.YEAR:
			from.setDate(from.getDate() - 365)
			break
	}

	return { from, to }
}

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/logs/count",
		method: "GET",

		schema: {
			querystring: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(LogType) },
					span: { type: "string", enum: Object.keys(TimeSpan) },
					moderator: { type: "string" },
				},
				required: [
					"type",
					"span",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						count: { type: "number" },
					},
					required: [
						"count",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("logs/get/count"),
		]),

		handler: async function(request: GetLogCountRequest) {
			const { type, span, moderator } = request.query

			const { from, to } = getTimeRange(span)
			const filter = {
				type,
				time: { $gt: from, $lt: to },
			} as GetLogCountFilter
			if (moderator) filter.moderator = moderator
			const count = await LogModel.countDocuments(filter)

			return { count }
		} as RouteHandlerMethod,
	})
}