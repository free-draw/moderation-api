import { FastifyRequest } from "fastify"
import { FastifyAuthFunction } from "fastify-auth"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import Moderator, { ModeratorDocument } from "../model/Moderator"
import AccountPlatform from "../types/enum/AccountPlatform"
import TokenType from "../types/enum/TokenType"
import parseAccount from "../util/parseAccount"

const IdentitySetForbiddenError = createError(
	"IDENTITY_SET_FORBIDDEN",
	"Authorized token is not allowed to set identity",
	StatusCodes.FORBIDDEN
)

const IdentitySetInvalidAccountError = createError(
	"IDENTITY_SET_INVALID_ACCOUNT",
	"Can't find account for provided identity",
	StatusCodes.BAD_REQUEST
)

const IdentityBadTokenError = createError(
	"IDENTITY_BAD_TOKEN",
	"Token appears corrupt; re-authenticate and try again",
	StatusCodes.BAD_REQUEST
)

const IdentityDisabledAccountError = createError(
	"IDENTITY_DISABLED_ACCOUNT",
	"Specified account is disabled",
	StatusCodes.FORBIDDEN
)

type AuthIdentityRequest = FastifyRequest<{
	Querystring: {
		identity?: string,
	},
}>

function authIdentity(): FastifyAuthFunction {
	return async function(request: AuthIdentityRequest) {
		const token = request.token

		let identity: ModeratorDocument | undefined

		if (request.query.identity) {
			if (token.type !== TokenType.SERVER) throw new IdentitySetForbiddenError()

			const account = parseAccount(request.query.identity)
			const moderator = await Moderator.findByAccount(account.platform, account.id)
			if (!moderator) throw new IdentitySetInvalidAccountError()

			identity = moderator
		} else if (token.type === TokenType.USER) {
			const id = token.id as string | number // If token.type is USER, id will always be present
			const account = await Moderator.findById(id)

			if (!account) throw new IdentityBadTokenError()

			identity = account
		}

		if (identity && !identity.active) throw new IdentityDisabledAccountError()

		request.identity = identity
	} as FastifyAuthFunction
}

export default authIdentity