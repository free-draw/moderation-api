import { Schema, model, EnforceDocument, Model } from "mongoose"
import App from "../App"
import LogTypeData from "../types/enum/data/LogTypeData"
import LogType from "../types/enum/LogType"
import Log from "../types/schema/Log"
import Ref from "../types/util/Ref"
import getDocumentId from "../util/getDocumentId"
import { ModeratorDocument } from "./Moderator"

type LogDocumentData = Ref<Omit<Log, "id">, "moderator">
type LogDocument = EnforceDocument<LogDocumentData, {
	serialize(this: LogDocument): Log,
}, {}>

const LogSchema = new Schema<LogDocumentData>({
	time: { type: Date, default: () => new Date(), required: true },
	type: { type: String, enum: Object.keys(LogType), required: true },
	data: { type: Schema.Types.Mixed },
	moderator: { type: Schema.Types.ObjectId, ref: "Moderator", required: true },
})

LogSchema.index({ time: -1 })
LogSchema.index({ time: -1, type: 1 })
LogSchema.index({ time: -1, moderator: 1 })
LogSchema.index({ time: -1, type: 1, moderator: 1 })

LogSchema.static("push", async function(
	moderator: ModeratorDocument | Schema.Types.ObjectId,
	type: LogType,
	data?: any
): Promise<LogDocument> {
	const log = await this.create({
		time: new Date(),
		moderator: getDocumentId<Schema.Types.ObjectId>(moderator).toString(),
		type,
		data,
	}) as LogDocument

	App.publish("log", log.serialize())

	return log
})

LogSchema.method("serialize", function(this: LogDocument): Log {
	return {
		id: this._id.toString(),
		time: this.time,
		type: this.type,
		moderator: getDocumentId<Schema.Types.ObjectId>(this.moderator).toString(),
		data: this.data,
	}
})

interface LogModel extends Model<LogDocument> {
	push<E extends LogType>(moderator: ModeratorDocument | Schema.Types.ObjectId, type: E, data: LogTypeData[E]): Promise<LogDocument>,
}

export default model("Log", LogSchema) as LogModel
export { LogDocument }