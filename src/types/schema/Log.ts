import { JSONSchema } from "json-schema-typed"
import LogType from "../enum/LogType"
import ObjectId from "../ObjectId"

type Log = {
	id: string,
	time: Date,
	type: LogType,
	data?: any,
	moderator: ObjectId,
}

const LogSchema = {
	$id: "Log",
	type: "object",
	properties: {
		time: { type: "string", format: "date-time" },
		type: { type: "string", enum: Object.keys(LogType) },
		data: {},
		moderator: { type: "string" },
	},
	required: [
		"time",
		"type",
		"moderator",
	],
	additionalProperties: false,
} as JSONSchema

export default Log
export { Log, LogSchema }