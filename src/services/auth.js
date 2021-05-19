const { OK } = require("../util/statusCodes")

const TokenType = require("../enum/TokenType")

async function AuthService(fastify) {
	// TODO: This is temporary
	fastify.log.info({
		token: fastify.jwt.sign({ type: "SERVER", time: Date.now() }),
	})

	fastify.route({
		method: "GET",
		path: "/me",

		schema: {
			response: {
				[OK]: {
					type: "object",
					properties: {
						type: { type: "string", enum: Object.keys(TokenType) },
						id: { type: "string" },
					},
				},
			},
		},

		async handler(request) {
			return request.token
		},
	})
}

AuthService.autoPrefix = "/auth"

module.exports = AuthService