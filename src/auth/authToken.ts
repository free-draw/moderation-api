import { FastifyRequest } from "fastify"
import { FastifyAuthFunction } from "fastify-auth"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import TokenType from "../types/enum/TokenType"
import Token from "../types/Token"

const TokenMissingError = createError(
	"TOKEN_MISSING",
	"Request must include either Authorization header or token cookie",
	StatusCodes.BAD_REQUEST
)

const TokenInvalidAuthHeaderError = createError(
	"TOKEN_INVALID_AUTH_HEADER",
	"Invalid authorization header",
	StatusCodes.BAD_REQUEST
)

const TokenInvalidAuthHeaderSchemeError = createError(
	"TOKEN_INVALID_AUTH_HEADER_SCHEME",
	"Authorization header scheme must be Bearer",
	StatusCodes.BAD_REQUEST
)

const TokenInvalidError = createError(
	"TOKEN_INVALID_TOKEN",
	"Invalid token",
	StatusCodes.UNAUTHORIZED
)

const TokenMismatchingTypeError = createError(
	"TOKEN_MISMATCHING_TYPE",
	"Token type is mispatching from what is required for this method",
	StatusCodes.FORBIDDEN
)

function authToken(requireTokenType?: TokenType): FastifyAuthFunction {
	return async function(request: FastifyRequest): Promise<void> {
		const header = request.headers.authorization
		const cookie = request.cookies.token as string | undefined

		let token

		if (header) {
			const match = /^(\w+) (.+)$/.exec(header)

			if (!match) {
				throw new TokenInvalidAuthHeaderError()
			}

			if (match[1] !== "Bearer") {
				throw new TokenInvalidAuthHeaderSchemeError()
			}

			token = match[2]
		} else if (cookie) {
			token = cookie
		} else {
			throw new TokenMissingError()
		}

		let tokenData: Token

		try {
			tokenData = request.server.jwt.verify(token)
		} catch {
			throw new TokenInvalidError()
		}

		if (requireTokenType && tokenData.type !== requireTokenType) {
			throw new TokenMismatchingTypeError()
		}

		request.token = tokenData
	} as FastifyAuthFunction
}

export default authToken