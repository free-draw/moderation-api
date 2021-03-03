const plugin = require("fastify-plugin")

const { BAD_REQUEST, UNAUTHORIZED } = require("../util/statusCodes")

const TOKEN_REGEX = /^(\w+) (.+)$/

async function AuthPlugin(fastify) {
	fastify.decorateRequest("token", null)

	fastify.addHook("preValidation", async (request) => {
		let authorization = request.headers.authorization

		if (authorization) {
			let [ match, tokenType, token ] = TOKEN_REGEX.exec(authorization) ?? []

			if (match && tokenType === "Bearer" && token.length > 0) {
				let tokenData

				try {
					tokenData = fastify.jwt.verify(token)
				} catch {
					throw {
						statusCode: UNAUTHORIZED,
						message: "Invalid Bearer token",
					}
				}

				request.token = tokenData
			} else {
				throw {
					statusCode: BAD_REQUEST,
					message: "Authentication scheme must be Bearer",
				}
			}
		} else {
			throw {
				statusCode: BAD_REQUEST,
				message: "Missing Authorization header",
			}
		}
	})
}

module.exports = plugin(AuthPlugin, {
	name: "plugin-auth",
})