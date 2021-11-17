import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ReportModel, { ReportDocument } from "../../model/Report"

type GetReportsBulkRequest = FastifyRequest<{
	Body: {
		reportIds: string[],
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/bulk/reports",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					reportIds: {
						type: "array",
						items: { type: "string" },
					},
				},
				required: [
					"reportIds",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						reports: {
							type: "array",
							items: { $ref: "Report" },
						},
					},
					required: [
						"reports",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("reports/get/bulk"),
		], { relation: "and" }),

		handler: async function(request: GetReportsBulkRequest) {
			const reports = await ReportModel.find({
				_id: { $in: request.body.reportIds },
			}) as ReportDocument[]

			return {
				reports: reports.map(report => report.serialize()),
			}
		} as RouteHandlerMethod,
	})
}