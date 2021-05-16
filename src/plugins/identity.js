const plugin = require("fastify-plugin")

const { BAD_REQUEST, FORBIDDEN } = require("../util/statusCodes")
const parseAccount = require("../util/parseAccount")

const AccountType = require("../enum/AccountType")
const TokenType = require("../enum/TokenType")

const Moderator = require("../models/Moderator")

const MODERATOR_ACCOUNT_REGEX = /^(\w+)\/(\w+)$/

async function IdentifyPlugin(fastify) {
	fastify.decorateRequest("identity", null)

	fastify.addHook("preValidation", async (request) => {
		let token = request.token
		
		if (!token) {
			fastify.error("auth must be added before identify")
		}

		if (request.query.identity) {
			if (token.type !== TokenType.SERVER) {
				throw {
					statusCode: FORBIDDEN,
					message: "Authorized token is not allowed to set identity",
				}
			}

			let [ match, matchAccountType, matchAccountId ] = MODERATOR_ACCOUNT_REGEX.exec(request.query.identity) ?? []

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
			let moderator = await Moderator.findByAccount(accountType, accountId)

			if (!moderator) {
				throw {
					statusCode: BAD_REQUEST,
					message: "Can't find account for provided identity",
				}
			}

			request.identity = moderator
		} else {
			if (token.type === TokenType.USER) {
				let moderator = await Moderator.findById(token.id)

				if (!moderator) {
					throw {
						statusCode: FORBIDDEN,
						message: "Unknown moderator with provided ID",
					}
				}

				if (!moderator.active) {
					throw {
						statusCode: FORBIDDEN,
						message: "Moderator status is no longer active",
					}
				}

				request.identity = moderator
			}
		}
	})
}

module.exports = plugin(IdentifyPlugin, {
	name: "plugin-identify",
	dependencies: [ "plugin-auth" ],
})