import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import AccountPlatform from "../types/enum/AccountPlatform"
import ModeratorAccount from "../types/schema/ModeratorAccount"

const AccountParseError = createError(
	"ACCOUNT_PARSE",
	"Unable to parse account string",
	StatusCodes.BAD_REQUEST
)

const AccountInvalidPlatformError = createError(
	"ACCOUNT_INVALID_PLATFORM",
	"Invalid platform specified",
	StatusCodes.BAD_REQUEST
)

const validPlatforms = Object.keys(AccountPlatform)

function parseAccountId(platform: AccountPlatform.DISCORD, id: string): string
function parseAccountId(platform: AccountPlatform.ROBLOX, id: string): number
function parseAccountId(platform: AccountPlatform, id: string): string | number
function parseAccountId(platform: AccountPlatform, id: string): string | number {
	switch (platform) {
		case AccountPlatform.ROBLOX:
			return parseInt(id)
		case AccountPlatform.DISCORD:
			return id
	}
}

function parseAccount(data: string): ModeratorAccount {
	const match = /^(\w+)\/(\w+)$/.exec(data)
	if (!match) throw new AccountParseError()

	const [ matchPlatform, matchId ] = match.slice(1)
	if (!validPlatforms.includes(matchPlatform)) throw new AccountInvalidPlatformError()

	const platform = matchPlatform as AccountPlatform
	const id = parseAccountId(platform, matchId)

	return { platform, id }
}

export default parseAccount
export { parseAccountId }