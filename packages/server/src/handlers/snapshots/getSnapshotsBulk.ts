import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify"
import { StatusCodes } from "http-status-codes"
import { JSONSchema } from "json-schema-typed"
import authIdentity from "../../auth/authIdentity"
import authPermissions from "../../auth/authPermissions"
import authToken from "../../auth/authToken"
import SnapshotModel, { SnapshotDocument } from "../../model/Snapshot"

type GetSnapshotsBulkRequest = FastifyRequest<{
	Body: {
		snapshotIds: string[],
	},
}>

export default async function(fastify: FastifyInstance) {
	fastify.route({
		url: "/bulk/snapshots",
		method: "POST",

		schema: {
			body: {
				type: "object",
				properties: {
					snapshotIds: {
						type: "array",
						items: { type: "string" },
					},
				},
				required: [
					"snapshotIds",
				],
				additionalProperties: false,
			} as JSONSchema,

			response: {
				[StatusCodes.OK]: {
					type: "object",
					properties: {
						snapshots: {
							type: "array",
							items: { $ref: "Snapshot" },
						},
					},
					required: [
						"snapshots",
					],
					additionalProperties: false,
				} as JSONSchema,
			},
		},

		preValidation: fastify.auth([
			authToken(),
			authIdentity(),
			authPermissions("snapshots/get/bulk"),
		], { relation: "and" }),

		handler: async function(request: GetSnapshotsBulkRequest) {
			const snapshots = await SnapshotModel.find({
				_id: { $in: request.body.snapshotIds }
			}) as SnapshotDocument[]

			return {
				snapshots: snapshots.map(snapshot => snapshot.serialize()),
			}
		} as RouteHandlerMethod,
	})
}