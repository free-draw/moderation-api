import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ReportModel, { ReportDocument } from "../../model/Report"

const ReportNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find report with specified id",
	StatusCodes.NOT_FOUND
)

type GetReportRequest = FastifyRequest<{
	Params: {
		reportId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/reports/:reportId",
		method: "GET",

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
						report: { $ref: "Report" },
					},
					required: [
						"report",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("reports/get"),
		], { relation: "and" }),

		handler: async function(request: GetReportRequest) {
			const report = await ReportModel.findById(request.params.reportId) as ReportDocument
			if (!report) throw new ReportNotFoundError()

			return {
				report: report.serialize(),
			}
		} as RouteHandlerMethod,
	})
}