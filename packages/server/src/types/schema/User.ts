import { JSONSchema } from "json-schema-typed"
import ActionData from "./Action"

type UserData = {
	id: number,
	actions: ActionData[],
}

const UserSchema = {
	$id: "User",
	type: "object",
	properties: {
		id: { type: "integer" },
		actions: {
			type: "array",
			items: { $ref: "Action" },
		},
	},
	required: [
		"id",
		"actions",
	],
	additionalProperties: false,
} as JSONSchema

export default UserData
export { UserData, UserSchema }