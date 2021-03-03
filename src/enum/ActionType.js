const enumerate = require("../util/enumerate")

const ActionType = enumerate("ActionType", [
	"BAN",
	"MUTE",
	"WARN",
])

module.exports = ActionType