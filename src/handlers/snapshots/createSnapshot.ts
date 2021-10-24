import { FastifyInstance, FastifyRequest, FastifyReply, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import SnapshotModel, { SnapshotDocument } from "../../model/Snapshot"
import Snapshot from "../../types/schema/Snapshot"

type CreateSnapshotRequest = FastifyRequest<{
	Body: Omit<Snapshot, "id">,
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/snapshots",
		method: "POST",

		schema: {
			body: { $ref: "Snapshot" } as JSONSchema,

			response: {
				[StatusCodes.CREATED]: {
					type: "object",
					properties: {
						snapshotId: { type: "string" },
					},
					required: [
						"snapshotId",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("snapshots/create"),
		], { relation: "and" }),

		handler: async function(request: CreateSnapshotRequest, reply: FastifyReply) {
			const snapshot = await SnapshotModel.create({
				players: request.body.players,
				logs: request.body.logs,
				canvas: request.body.canvas.map(({ userId, data }) => {
					return {
						userId,
						data: Buffer.from(data as string, "base64"),
					}
				}),
			}) as SnapshotDocument

			reply.status(StatusCodes.CREATED)
			return {
				snapshotId: snapshot._id.toString(),
			}
		} as RouteHandlerMethod,
	})
}