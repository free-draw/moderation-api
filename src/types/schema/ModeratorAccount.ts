import { JSONSchema } from "json-schema-typed"
import AccountPlatform from "../enum/AccountPlatform"

type ModeratorAccountData = {
	platform: AccountPlatform,
	id: string | number,
}

const ModeratorAccountSchema = {
	$id: "ModeratorAccount",
	type: "object",
	properties: {
		platform: { type: "string", enum: Object.keys(AccountPlatform) },
		id: { type: [ "string", "number" ] },
	},
	required: [
		"platform",
		"id",
	],
	additionalProperties: false,
} as JSONSchema

export default ModeratorAccountData
export { ModeratorAccountData, ModeratorAccountSchema }