const mongoose = require("mongoose")
const getObjectId = require("../util/getObjectId")

const LogType = require("../enum/LogType")

const LogSchema = new mongoose.Schema({
	time: { type: Date, default: Date.now, index: true },
	type: { type: String, enum: Object.keys(LogType) },
	source: { type: mongoose.Types.ObjectId, ref: "Moderator" },
	data: Object,
}, {
	collection: "logs",
})

LogSchema.virtual("id").get(function() {
	return this._id.toString()
})

LogSchema.methods.serialize = function() {
	return {
		time: this.time,
		type: this.type,
		identity: getObjectId(this.identity),
		data: this.data,
	}
}

module.exports = mongoose.model("Log", LogSchema)