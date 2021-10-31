import { JSONSchema } from "json-schema-typed"
import ObjectId from "../ObjectId"
import SnapshotLogType from "../enum/SnapshotLogType"
import UserId from "../UserId"

type SnapshotPlayerData = {
	userId: UserId,
	position: {
		x: number,
		y: number,
	},
}

type SnapshotLogData = {
	userId: UserId,
	type: SnapshotLogType,
	data: any,
}

type SnapshotCanvasData = {
	userId: UserId,
	data: string | Buffer,
}

type SnapshotData = {
	id: ObjectId,
	players: SnapshotPlayerData[],
	logs: SnapshotLogData[],
	canvas: SnapshotCanvasData[],
}

const SnapshotSchema = {
	$id: "Snapshot",
	type: "object",
	properties: {
		players: {
			type: "array",
			items: {
				type: "object",
				properties: {
					userId: { type: "integer" },
					position: {
						type: "object",
						properties: {
							x: { type: "number" },
							y: { type: "number" },
						},
						required: [
							"x",
							"y",
						],
					},
				},
				required: [
					"userId",
					"position",
				],
				additionalProperties: false,
			},
		},
		logs: {
			type: "array",
			items: {
				type: "object",
				properties: {
					userId: { type: "integer" },
					type: { type: "string", enum: Object.keys(SnapshotLogType) },
					data: {},
				},
				required: [
					"userId",
					"type",
				],
				additionalProperties: false,
			},
		},
		canvas: {
			type: "array",
			items: {
				type: "object",
				properties: {
					userId: { type: "integer" },
					data: { type: "string", contentEncoding: "base64" },
				},
				required: [
					"userId",
					"data",
				],
				additionalProperties: false,
			},
		},
	},
	required: [
		"players",
		"logs",
		"canvas",
	],
	additionalProperties: false,
} as JSONSchema

export default SnapshotData
export { SnapshotData, SnapshotSchema }