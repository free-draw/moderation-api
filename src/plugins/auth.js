const plugin = require("fastify-plugin")
const TokenType = require("../enum/TokenType")

const { BAD_REQUEST, UNAUTHORIZED } = require("../util/statusCodes")

const AUTHORIZATION_REGEX = /^(\w+) (.+)$/

async function AuthPlugin(fastify) {
	fastify.decorateRequest("token", null)

	console.log(fastify.jwt.sign({ type: TokenType.USER, id: "60b5ff480d25a7001359d7bb" }))

	fastify.addHook("preValidation", async (request) => {
		if (request.context.config.auth) {
			const authorization = request.headers.authorization
			const cookie = request.cookies.token

			let token

			if (authorization) {
				const match = AUTHORIZATION_REGEX.exec(authorization)

				if (!match) {
					throw {
						statusCode: BAD_REQUEST,
						message: "Invalid Authorization header",
					}
				}

				if (match[1] !== "Bearer") {
					throw {
						statusCode: BAD_REQUEST,
						message: "Authorization scheme must be Bearer",
					}
				}

				token = match[2]
			} else if (cookie) {
				token = cookie
			} else {
				throw {
					statusCode: BAD_REQUEST,
					message: "Request must include either Authorization header or token cookie",
				}
			}

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
		}
	})
}

module.exports = plugin(AuthPlugin, {
	name: "plugin-auth",
})