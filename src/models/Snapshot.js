const mongoose = require("mongoose")

const SnapshotSchema = new mongoose.Schema({
	players: [ { id: Number, name: String } ],
	logs: [ { player: Number, message: String } ],
	canvas: [ { player: Number, data: Buffer } ]
}, {
	collection: "snapshots",
})

SnapshotSchema.methods.serialize = function() {
	return {
		players: this.players,
		logs: this.logs,
		canvas: this.canvas.map((collector) => {
			return {
				player: collector.player,
				data: collector.data.toString("base64"),
			}
		}),
	}
}

module.exports = mongoose.model("Snapshot", SnapshotSchema)