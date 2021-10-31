import { Schema, model, EnforceDocument } from "mongoose"
import SnapshotLogType from "../types/enum/SnapshotLogType"
import SnapshotData from "../types/schema/Snapshot"

type SnapshotDocumentData = Omit<SnapshotData, "id">
type SnapshotDocument = EnforceDocument<SnapshotDocumentData, {
	serialize(this: SnapshotDocument): SnapshotData,
}, {}>

const SnapshotSchema = new Schema({
	players: {
		type: [
			{
				userId: { type: Number, required: true },
				position: {
					type: {
						x: { type: Number, required: true },
						y: { type: Number, required: true },
					},
					required: true,
				}
			},
		],
		required: true,
	},
	logs: {
		type: [
			{
				userId: { type: Number, required: true },
				type: { type: String, enum: Object.keys(SnapshotLogType), required: true },
				data: { type: Schema.Types.Mixed },
			},
		],
		required: true,
	},
	canvas: {
		type: [
			{
				userId: { type: Number, required: true },
				data: { type: Buffer, required: true },
			},
		],
		required: true,
	},
})

SnapshotSchema.method("serialize", function(this: SnapshotDocument): SnapshotData {
	return {
		id: this._id.toString(),
		players: this.players,
		logs: this.logs,
		canvas: this.canvas.map(({ userId, data }) => {
			return {
				userId,
				data: (data as Buffer).toString("base64"),
			}
		}),
	}
})

export default model("Snapshot", SnapshotSchema)
export { SnapshotDocument }