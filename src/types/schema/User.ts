import { JSONSchema } from "json-schema-typed"
import Action from "./Action"

type User = {
	id: number,
	actions: Action[],
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

export default User
export { User, UserSchema }