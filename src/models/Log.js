const mongoose = require("mongoose")

const LogType = require("../enum/LogType")

const LogSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now, index: true },
	type: { type: String, enum: Object.keys(LogType) },
	identity: { type: mongoose.Types.ObjectId, ref: "Moderator" },
	data: Object,
}, {
	collection: "logs",
})

LogSchema.virtual("id").get(function() {
	return this._id.toString()
})

LogSchema.methods.serialize = function() {
	return {
		timestamp: this.timestamp,
		type: this.type,
		identity: this.identity.toString(),
		data: this.data,
	}
}

module.exports = mongoose.model("Log", LogSchema)