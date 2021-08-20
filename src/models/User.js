const mongoose = require("mongoose")

const ActionType = require("../enum/ActionType")

const ActionSchema = new mongoose.Schema({
	type: { type: String, enum: Object.keys(ActionType) },
	data: Object,
	expiry: Date,

	reason: String,
	notes: String,
	snapshot: { type: mongoose.Types.ObjectId, ref: "Snapshot" },
	report: { type: mongoose.Types.ObjectId, ref: "Report" },
	moderator: { type: mongoose.Types.ObjectId, ref: "Moderator" },

	timestamp: { type: Date, default: Date.now },
})

ActionSchema.virtual("id").get(function() {
	return this._id.toString()
})

ActionSchema.methods.serialize = function() {
	return {
		id: this.id,

		type: this.type,
		data: this.data,
		expiry: this.expiry,

		reason: this.reason,
		notes: this.notes,
		snapshot: getObjectId(this.snapshot),
		report: getObjectId(this.report),
		moderator: getObjectId(this.moderator),

		timestamp: this.timestamp,
	}
}

ActionSchema.methods.isExpired = function() {
	if (this.expiry) {
		return Date.now() > this.expiry.getTime()
	} else {
		return false
	}
}

const UserSchema = new mongoose.Schema({
	_id: Number,
	actions: [ ActionSchema ],
	history: [ ActionSchema ],
}, {
	collection: "users",
})

UserSchema.post("init", function() {
	const activeActions = this.actions.filter(action => !action.isExpired())
	const expiredActions = this.actions.filter(action => action.isExpired())

	this.actions = activeActions
	this.history = [ ...this.history ].concat(expiredActions)
})

UserSchema.virtual("id").get(function() {
	return this._id
})

UserSchema.statics.get = async function(userId) {
	const user = await this.findById(userId)

	if (user) {
		return user
	} else {
		return new this({ _id: userId })
	}
}

UserSchema.methods.filterActions = function(filter) {
	const filteredActions = this.actions.filter(action => filter(action))
	const unfilteredActions = this.actions.filter(action => !filter(action))

	this.actions = unfilteredActions
	this.history = this.history.concat(filteredActions)

	return filteredActions
}

UserSchema.methods.issueAction = function(data) {
	const action = this.actions.create({
		type: data.type,
		data: data.data,
		expiry: data.expiry,

		reason: data.reason,
		notes: data.notes,
		snapshot: data.snapshot,
		report: data.report,
		moderator: data.moderator,
	})

	this.actions.push(action)

	return action
}

UserSchema.methods.serialize = function() {
	return {
		userId: this._id,
		actions: this.actions.map(action => action.serialize()),
		history: this.history.map(action => action.serialize()),
	}
}

module.exports = mongoose.model("User", UserSchema)