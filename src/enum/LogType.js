const enumerate = require("../util/enumerate")

const LogType = enumerate("LogType", [
	// Actions
	"CREATE_ACTION",
	"DISCARD_ACTION_BY_ID",
	"DISCARD_ACTION_BY_TYPE",

	// Moderators
	"CREATE_MODERATOR",
	"DELETE_MODERATOR",
	"CREATE_MODERATOR_ACCOUNT",
	"DELETE_MODERATOR_ACCOUNT",

	// Snapshots
	"CREATE_SNAPSHOT",
])

module.exports = LogType