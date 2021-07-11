const enumerate = require("../util/enumerate")

const ActionType = enumerate("ActionType", [
	"BAN",
	"MUTE",
	"DRAWBAN",
	"WARN",
])

module.exports = ActionType