import { JSONSchema } from "json-schema-typed"
import ObjectId from "../ObjectId"
import ModeratorAccountData from "./ModeratorAccount"

type ModeratorData = {
	id: ObjectId,
	name: string,
	active: boolean,
	accounts: ModeratorAccountData[],
	permissions: string[],
}

const ModeratorSchema = {
	$id: "Moderator",
	type: "object",
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		active: { type: "boolean" },
		accounts: {
			type: "array",
			items: { $ref: "ModeratorAccount" },
		},
		permissions: {
			type: "array",
			items: { type: "string" },
		},
	},
	required: [
		"id",
		"name",
		"active",
		"accounts",
		"permissions",
	],
	additionalProperties: false,
} as JSONSchema

export default ModeratorData
export { ModeratorData, ModeratorSchema }