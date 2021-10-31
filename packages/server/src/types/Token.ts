import TokenType from "./enum/TokenType"

type Token = {
	type: TokenType,
	id?: string,
	tag?: string,
	t?: number,
}

type ServerToken = Token & { type: TokenType.SERVER }
type UserToken = Token & { type: TokenType.USER, id: string }

export default Token
export { ServerToken, UserToken }