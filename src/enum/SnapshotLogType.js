const enumerate = require("../util/enumerate")

const SnapshotLogType = enumerate("SnapshotLogType", [
	"JOIN",
	"LEAVE",
	"CHAT",
	"COMMAND",
])

module.exports = SnapshotLogType