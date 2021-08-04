const mongoose = require("mongoose")

const User = require("./User")

const ReportResult = require("../enum/ReportResult")

const ReportSchema = new mongoose.Schema({
	result: { type: String, enum: Object.keys(ReportResult), default: ReportResult.PENDING, index: true },
	targetUserId: Number,
	fromUserId: Number,
	reason: String,
	notes: String,
	snapshot: { type: mongoose.Types.ObjectId, ref: "Snapshot" },
}, {
	collection: "reports",
	timestamps: true,
})

ReportSchema.virtual("id").get(function() {
	return this._id.toString()
})

ReportSchema.methods.accept = async function({ type, reason, duration, moderator }) {
	const user = await User.get(this.targetUserId)

	let expiry
	if (duration) {
		expiry = new Date()
		expiry.setSeconds(expiry.getSeconds() + duration)
	}

	user.issueAction({
		type,
		expiry,

		reason: reason ?? this.reason,
		notes: this.notes,
		snapshot: this.snapshot,
		report: this.id,
		moderator,
	})

	await user.save()

	this.result = ReportResult.ACCEPTED
	await this.save()
}

ReportSchema.methods.decline = async function() {
	this.result = ReportResult.DECLINED
	await this.save()
}

ReportSchema.methods.serialize = function() {
	return {
		id: this.id,
		targetUserId: this.targetUserId,
		fromUserId: this.fromUserId,
		reason: this.reason,
		notes: this.notes,
		snapshot: this.snapshot.toString(),
	}
}

module.exports = mongoose.model("Report", ReportSchema)