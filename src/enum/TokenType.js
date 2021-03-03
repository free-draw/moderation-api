const enumerate = require("../util/enumerate")

const TokenType = enumerate("TokenType", [
	"SERVER",
	"USER",
])

module.exports = TokenType