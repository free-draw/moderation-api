import { JSONSchema } from "json-schema-typed"
import ReportStatus from "../enum/ReportStatus"
import ObjectId from "../ObjectId"
import UserId from "../UserId"

type Report = {
	id: ObjectId,
	status: ReportStatus,
	target: UserId,
	from: UserId,
	reason: string,
	notes: string,
	snapshot?: ObjectId,
}

const ReportSchema = {
	$id: "Report",
	type: "object",
	properties: {
		id: { type: "string" },
		status: { type: "string", enum: Object.keys(ReportStatus) },
		target: { type: "integer" },
		from: { type: "integer" },
		reason: { type: "string" },
		notes: { type: "string" },
		snapshot: { type: "string" },
	},
	required: [
		"id",
		"status",
		"target",
		"from",
		"reason",
		"notes",
	],
	additionalProperties: false,
} as JSONSchema

export default Report
export { Report, ReportSchema }