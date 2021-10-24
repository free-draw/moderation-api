import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ReportModel, { ReportDocument } from "../../model/Report"
import ActionType from "../../types/enum/ActionType"

const ReportNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find report with specified id",
	StatusCodes.NOT_FOUND
)

type AcceptReportRequest = FastifyRequest<{
	Params: {
		reportId: string,
	},

	Body: {
		type: ActionType,
		reason: string,
		notes?: string,
		expiry?: string,
		duration?: number,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/reports/:reportId/accept",
		method: "POST",

		schema: {
			params: {
				type: "object",
				properties: {
					reportId: { type: "string" },
				},
				required: [
					"reportId",
				],
				additionalProperties: false,
			} as JSONSchema,

			body: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(ActionType) },
					reason: { type: "string" },
					notes: { type: "string" },
					expiry: { type: "string", format: "date-time" },
					duration: { type: "integer" },
				},
				required: [
					"type",
					"reason",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						action: { $ref: "Action" },
						report: { $ref: "Report" },
					},
					required: [
						"action",
						"report",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("reports/accept"),
		], { relation: "and" }),

		handler: async function(request: AcceptReportRequest) {
			const report = await ReportModel.findById(request.params.reportId) as ReportDocument
			if (!report) throw new ReportNotFoundError()
			const action = await report.accept(request.body)
			await report.save()

			return {
				action: action.serialize(),
				report: report.serialize(),
			}
		} as RouteHandlerMethod,
	})
}