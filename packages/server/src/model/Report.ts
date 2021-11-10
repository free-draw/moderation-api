import { Schema, model, EnforceDocument, Types } from "mongoose"
import ReportStatus from "../types/enum/ReportStatus"
import { ActionOptions } from "../types/schema/Action"
import ReportData from "../types/schema/Report"
import { RefOptional } from "../types/util/Ref"
import getDocumentId from "../util/getDocumentId"
import ObjectId from "../types/ObjectId"
import User, { ActionDocument } from "./User"

type ReportDocumentData = RefOptional<Omit<ReportData, "id">, "snapshot">
type ReportDocument = EnforceDocument<ReportDocumentData, {
	accept(this: ReportDocument, actionOptions: ActionOptions, identity?: ObjectId): Promise<ActionDocument>,
	decline(this: ReportDocument): void,
	serialize(this: ReportDocument): ReportData,
}, {}>

const ReportSchema = new Schema<ReportDocumentData>({
	status: { type: String, enum: Object.keys(ReportStatus), default: ReportStatus.PENDING },
	target: { type: Number, required: true },
	from: { type: Number, required: true },
	reason: { type: String, required: true },
	notes: { type: String, required: true },
	snapshot: { type: Schema.Types.ObjectId, ref: "Snapshot" }
}, {
	collection: "reports",
})

ReportSchema.index({ status: 1 })

ReportSchema.method("accept", async function(this: ReportDocument, options: ActionOptions, identity?: ObjectId): Promise<ActionDocument> {
	this.status = ReportStatus.ACCEPTED

	const user = await User.get(this.target)
	const action = user.createAction({
		...options,
		report: this._id.toString(),
	}, identity)
	await user.save()

	return action
})

ReportSchema.method("decline", async function(this: ReportDocument): Promise<void> {
	this.status = ReportStatus.DECLINED
})

ReportSchema.method("serialize", function(this: ReportDocument): ReportData {
	return {
		id: this._id.toString(),
		status: this.status,
		target: this.target,
		from: this.from,
		reason: this.reason,
		notes: this.notes,
		snapshot: getDocumentId<Types.ObjectId | undefined>(this.snapshot)?.toString(),
	}
})

export default model("Report", ReportSchema)
export { ReportDocument }