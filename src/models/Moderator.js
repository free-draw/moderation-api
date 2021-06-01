const mongoose = require("mongoose")

const AccountType = require("../enum/AccountType")

const ModeratorSchema = new mongoose.Schema({
	name: String,
	enabled: { type: Boolean, default: true },
	accounts: [
		{
			type: { type: String, enum: Object.keys(AccountType), index: true },
			id: { type: mongoose.Schema.Types.Mixed, index: true },
		},
	],
	permissions: [ String ],
}, {
	collection: "moderators",
})

ModeratorSchema.virtual("id").get(function() {
	return this._id.toString()
})

ModeratorSchema.statics.findByAccount = function(accountType, accountId) {
	return this.findOne({
		accounts: {
			$elemMatch: {
				type: accountType,
				id: accountId,
			},
		},
	}).exec()
}

ModeratorSchema.statics.get = function(actorId) {
	return this.findById(actorId).populate("accounts").exec()
}

ModeratorSchema.methods.serialize = function() {
	return {
		id: this.id,
		name: this.name,
		enabled: this.enabled,
		accounts: this.accounts,
	}
}

module.exports = mongoose.model("Moderator", ModeratorSchema)