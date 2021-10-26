import { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import App from "../../App"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import ReportModel, { ReportDocument } from "../../model/Report"
import UserId from "../../types/UserId"

type CreateReportRequest = FastifyRequest<{
	Body: {
		target: UserId,
		from: UserId,
		reason: string,
		notes?: string,
		snapshot?: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/reports",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					target: { type: "integer" },
					from: { type: "integer" },
					reason: { type: "string" },
					notes: { type: "string" },
					snapshot: { type: "string" },
				},
				required: [
					"target",
					"from",
					"reason",
					"snapshot",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.CREATED]: {
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
			authPermissions("reports/create"),
		], { relation: "and" }),

		handler: async function(request: CreateReportRequest, reply: FastifyReply) {
			const report = await ReportModel.create(request.body) as ReportDocument

			App.publish("reportCreate", {
				report: report.serialize(),
			})

			reply.status(StatusCodes.CREATED)
			return {
				reportId: report._id.toString(),
			}
		} as RouteHandlerMethod,
	})
}