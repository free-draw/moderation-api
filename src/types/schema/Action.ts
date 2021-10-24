import { JSONSchema } from "json-schema-typed"
import ActionType from "../enum/ActionType"
import ObjectId from "../ObjectId"

type Action = {
	id: ObjectId,
	active: boolean,
	created: Date,
	type: ActionType,
	expiry?: Date,
	reason: string,
	notes?: string,
	snapshot?: ObjectId,
	report?: ObjectId,
	moderator?: ObjectId,
}

type ActionOptions = {
	type: string,
	reason: string,
	notes?: string,
	snapshot?: ObjectId,
	report?: ObjectId,
	expiry?: Date | string | number,
	duration?: number,
}

const ActionSchema = {
	$id: "Action",
	type: "object",
	properties: {
		id: { type: "string" },
		active: { type: "boolean" },
		created: { type: "string", format: "date-time" },
		expiry: { type: "string", format: "date-time" },
		type: { type: "string", enum: Object.keys(ActionType) },
		reason: { type: "string" },
		notes: { type: "string" },
		snapshot: { type: "string" },
		report: { type: "string" },
		moderator: { type: "string" },
	},
	required: [
		"id",
		"active",
		"created",
		"type",
		"reason",
	],
	additionalProperties: false,
} as JSONSchema

export default Action
export { Action, ActionOptions, ActionSchema }