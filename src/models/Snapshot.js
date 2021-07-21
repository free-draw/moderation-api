const mongoose = require("mongoose")

const SnapshotLogType = require("../enum/SnapshotLogType")

const SnapshotSchema = new mongoose.Schema({
	players: [
		{
			userId: Number,
			position: {
				x: Number,
				y: Number,
			},
		},
	],
	logs: [
		{
			source: Number,
			type: { type: String, enum: Object.keys(SnapshotLogType) },
			data: mongoose.Schema.Types.Mixed,
		},
	],
	canvas: [
		{
			userId: Number,
			data: Buffer,
		},
	],
}, {
	collection: "snapshots",
})

SnapshotSchema.virtual("id").get(function() {
	return this._id.toString()
})

SnapshotSchema.methods.serialize = function() {
	return {
		players: this.players,
		logs: this.logs,
		canvas: this.canvas.map((collector) => {
			return {
				userId: collector.userId,
				data: collector.data.toString("base64"),
			}
		}),
	}
}

module.exports = mongoose.model("Snapshot", SnapshotSchema)