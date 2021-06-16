const { OK, CREATED, NOT_FOUND } = require("../util/statusCodes")

const Snapshot = require("../models/Snapshot")
const Log = require("../models/Log")

const LogType = require("../enum/LogType")

async function SnapshotsService(fastify) {
	fastify.addSchema({
		$id: "#Snapshot",
		type: "object",
		properties: {
			players: {
				type: "array",
				items: { type: "number" },
			},
			logs: {
				type: "array",
				items: {
					type: "object",
					properties: {
						userId: { type: "number" },
						message: { type: "string" },
					},
					required: [
						"userId",
						"message",
					],
				},
			},
			canvas: {
				type: "array",
				items: {
					type: "object",
					properties: {
						userId: { type: "number" },
						data: {
							type: "string",
							media: { binaryEncoding: "base64" },
						},
					},
					required: [
						"userId",
						"data",
					],
				},
			},
		},
		required: [
			"players",
			"logs",
			"canvas",
		],
	})

	fastify.route({
		method: "GET",
		path: "/:snapshotId",

		config: {
			auth: true,
			permissions: "snapshots/get/id",
		},

		schema: {
			params: {
				type: "object",
				properties: {
					snapshotId: { type: "string" },
				},
			},

			response: {
				[OK]: {
					type: "object",
					properties: {
						snapshot: { $ref: "#Snapshot" },
					},
				},
			},
		},

		async handler(request) {
			const snapshot = await Snapshot.findById(request.params.snapshotId)

			if (snapshot) {
				return {
					snapshot: snapshot.serialize(),
				}
			} else {
				throw {
					statusCode: NOT_FOUND,
					message: "Can't find snapshot with ID",
				}
			}
		},
	})

	fastify.route({
		method: "POST",
		path: "/",

		config: {
			auth: true,
			permissions: "snapshots/create",
		},

		schema: {
			body: { $ref: "#Snapshot" },

			response: {
				[CREATED]: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
				},
			},
		},

		async handler(request) {
			const players = request.body.players
			const logs = request.body.logs
			const canvas = request.body.canvas.map((collector) => {
				return {
					userId: collector.userId,
					data: Buffer.from(collector.data, "base64"),
				}
			})

			const snapshot = await Snapshot.create({ players, logs, canvas })

			await Log.create({
				type: LogType.CREATE_SNAPSHOT,
				identity: request.identity,
				data: {
					snapshotId: snapshot.id,
				},
			})

			return {
				snapshotId: snapshot.id,
			}
		},
	})
}

SnapshotsService.autoPrefix = "/snapshots"

module.exports = SnapshotsService