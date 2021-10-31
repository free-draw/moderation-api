import { FastifyInstance, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ReportModel, { ReportDocument } from "../../model/Report"
import ReportStatus from "../../types/enum/ReportStatus"

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/reports",
		method: "GET",

		schema: {
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
			authPermissions("reports/get/pending"),
		], { relation: "and" }),

		handler: async function() {
			const reports = await ReportModel.find({ status: ReportStatus.PENDING }) as ReportDocument[]

			return {
				reports: reports.map(report => report.serialize()),
			}
		} as RouteHandlerMethod,
	})
}