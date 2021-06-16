const plugin = require("fastify-plugin")

const { BAD_REQUEST, FORBIDDEN } = require("../util/statusCodes")
const parseAccount = require("../util/parseAccount")

const AccountType = require("../enum/AccountType")
const TokenType = require("../enum/TokenType")

const Moderator = require("../models/Moderator")

async function IdentifyPlugin(fastify) {
	fastify.decorateRequest("identity", null)

	fastify.addHook("preValidation", async (request) => {
		const token = request.token
		
		if (token) {
			if (request.query.identity) {
				if (token.type !== TokenType.SERVER) {
					throw {
						statusCode: FORBIDDEN,
						message: "Authorized token is not allowed to set identity",
					}
				}
	
				const [ match, matchAccountType, matchAccountId ] = /^(\w+)\/(\w+)$/.exec(request.query.identity) ?? []
	
				if (!match) {
					throw {
						statusCode: BAD_REQUEST,
						message: "Invalid format for identity parameter",
					}
				}
	
				if (!AccountType[matchAccountType]) {
					throw {
						statusCode: BAD_REQUEST,
						message: "Unknown account type",
					}
				}
	
				const [ accountType, accountId ] = parseAccount(matchAccountType, matchAccountId)
				const moderator = await Moderator.findByAccount(accountType, accountId)
	
				if (!moderator) {
					throw {
						statusCode: BAD_REQUEST,
						message: "Can't find account for provided identity",
					}
				}
	
				request.identity = moderator
			} else {
				if (token.type === TokenType.USER) {
					const moderator = await Moderator.findById(token.id)
	
					if (!moderator) {
						throw {
							statusCode: BAD_REQUEST,
							message: "Unknown moderator with provided ID",
						}
					}
	
					if (!moderator.enabled) {
						throw {
							statusCode: FORBIDDEN,
							message: "Moderator status is no longer enabled",
						}
					}
	
					request.identity = moderator
				}
			}
		}
	})
}

module.exports = plugin(IdentifyPlugin, {
	name: "plugin-identify",
	dependencies: [ "plugin-auth" ],
})