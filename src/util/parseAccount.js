const AccountType = require("../enum/AccountType")

function parseAccount(accountType, accountId) {
	if (accountType === AccountType.ROBLOX) {
		accountId = parseInt(accountId)
	}
	
	return [ accountType, accountId ]
}

module.exports = parseAccount