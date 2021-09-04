const { OK, CREATED, BAD_REQUEST, NOT_FOUND } = require("../util/statusCodes")

const Report = require("../models/Report")
const Snapshot = require("../models/Snapshot")
const Log = require("../models/Log")

const ActionType = require("../enum/ActionType")
const LogType = require("../enum/LogType")
const ReportResult = require("../enum/ReportResult")

async function ReportsService(fastify) {
	const redis = fastify.redis

	fastify.addSchema({
		$id: "#Report",
		type: "object",
		properties: {
			id: { type: "string" },
			targetUserId: { type: "number" },
			fromUserId: { type: "number" },
			reason: { type: "string" },
			notes: { type: "string" },
			result: { type: "string", enum: Object.keys(ReportResult) },
			snapshot: { type: "string" },
		},
		required: [
			"targetUserId",
			"fromUserId",
			"reason",
			"snapshot",
		],
	})

	fastify.route({
		method: "GET",
		path: "/",

		config: {
			auth: true,
			permissions: "reports/list",
		},

		schema: {
			response: {
				[OK]: {
					type: "object",
					properties: {
						reports: {
							type: "array",
							items: { $ref: "#Report" },
						},
					},
				},
			},
		},

		async handler() {
			const reports = await Report.find({ result: ReportResult.PENDING })
			return {
				reports: reports.map(report => report.serialize()),
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/",

		config: {
			auth: true,
			permissions: "reports/create",
		},

		schema: {
			body: { $ref: "#Report" },

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						reportId: { type: "string" },
					},
				},
			},
		},

		async handler(request, reply) {
			const snapshot = await Snapshot.findById(request.body.snapshot)

			if (snapshot) {
				const report = await Report.create(request.body)

				redis.publish("reportCreate", JSON.stringify(report.serialize()))

				reply.status(CREATED)
				return {
					reportId: report.id,
				}
			} else {
				throw {
					statusCode: BAD_REQUEST,
					message: "Can't find snapshot with ID",
				}
			}
		},
	})

	fastify.route({
		method: "GET",
		path: "/:reportId",

		config: {
			auth: true,
			permissions: "reports/get/id",
		},

		schema: {
			params: {
				type: "object",
				properties: {
					reportId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						report: { $ref: "#Report" },
					},
				}
			},
		},

		async handler(request) {
			const report = await Report.findById(request.params.reportId)

			if (report) {
				return {
					report: report.serialize(),
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find report with ID",
				}
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/:reportId/accept",

		config: {
			auth: true,
			permissions: "reports/actions/accept",
		},

		schema: {
			params: {
				type: "object",
				properties: {
					reportId: { type: "string" },
				},
			},

			body: {
				type: "object",
				properties: {
					type: { type: "string", enum: Object.keys(ActionType) },
					reason: { type: "string", nullable: true },
					duration: { type: "number", nullable: true },
				},
				required: [
					"type",
				],
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						report: { $ref: "#Report" },
					},
				},
			},
		},

		async handler(request) {
			const report = await Report.findById(request.params.reportId)

			if (report) {
				if (report.result === ReportResult.PENDING) {
					const { type, reason, duration } = request.body

					const action = await report.accept({
						type,
						reason,
						duration,
						moderator: request.identity,
					})

					redis.publish("reportDelete", JSON.stringify(report.serialize()))
					await Log.create({
						type: LogType.ACCEPT_REPORT,
						source: request.identity,
						data: {
							report: report.serialize(),
							action: action.serialize(),
						},
					})

					return {
						report: report.serialize(),
					}
				} else {
					throw {
						statusCode: BAD_REQUEST,
						message: "Report is not pending",
					}
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find report with ID",
				}
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/:reportId/decline",

		config: {
			auth: true,
			permissions: "reports/actions/decline",
		},

		schema: {
			params: {
				type: "object",
				properties: {
					reportId: { type: "string" },
				},
			},
		},

		async handler(request) {
			const report = await Report.findById(request.params.reportId)

			if (report) {
				if (report.result === ReportResult.PENDING) {
					await report.decline()

					redis.publish("reportDelete", JSON.stringify(report.serialize()))
					await Log.create({
						type: LogType.DECLINE_REPORT,
						source: request.identity,
						data: {
							report: report.serialize(),
						},
					})

					return {
						report: report.serialize(),
					}
				} else {
					throw {
						statusCode: BAD_REQUEST,
						message: "Report is not pending",
					}
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find report with ID",
				}
			}
		},
	})
}

ReportsService.autoPrefix = "/reports"

module.exports = ReportsService