import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import SnapshotModel, { SnapshotDocument } from "../../model/Snapshot"

const SnapshotNotFoundError = createError(
	"NOT_FOUND",
	"Couldn't find snapshot with specified id",
	StatusCodes.NOT_FOUND
)

type GetSnapshotRequest = FastifyRequest<{
	Params: {
		snapshotId: string,
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/snapshots/:snapshotId",
		method: "GET",

		schema: {
			params: {
				type: "object",
				properties: {
					snapshotId: { type: "string" },
				},
				required: [
					"snapshotId",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						snapshot: { $ref: "Snapshot" },
					},
					required: [
						"snapshot",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("snapshots/get"),
		], { relation: "and" }),

		handler: async function(request: GetSnapshotRequest) {
			const snapshot = await SnapshotModel.findById(request.params.snapshotId) as SnapshotDocument
			if (!snapshot) throw new SnapshotNotFoundError()

			return {
				snapshot: snapshot.serialize(),
			}
		} as RouteHandlerMethod,
	})
}