import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import App from "../../App"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import LogModel from "../../model/Log"
import ReportModel, { ReportDocument } from "../../model/Report"
import LogType from "../../types/enum/LogType"

const ReportNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find report with specified id",
	StatusCodes.NOT_FOUND
)

type DeclineReportRequest = FastifyRequest<{
	Params: {
		reportId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/reports/:reportId/decline",
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

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						reportId: { type: "string" },
					},
					required: [
						"reportId",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("reports/decline"),
		], { relation: "and" }),

		handler: async function(request: DeclineReportRequest) {
			const report = await ReportModel.findById(request.params.reportId) as ReportDocument
			if (!report) throw new ReportNotFoundError()
			report.decline()
			await report.save()

			if (request.identity) {
				await LogModel.push(request.identity, LogType.DECLINE_REPORT, {
					reportId: report._id.toString(),
				})
			}

			App.publish("reportDelete", {
				report: report.serialize(),
			})

			return {
				reportId: report._id.toString(),
			}
		} as RouteHandlerMethod,
	})
}