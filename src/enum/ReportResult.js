const enumerate = require("../util/enumerate")

const ReportResult = enumerate("ReportResult", [
	"PENDING",
	"ACCEPTED",
	"DECLINED",
])

module.exports = ReportResult