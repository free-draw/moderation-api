import API from "../../API"
import Token from "../../type/Token"

type GetTokenResponse = Token

async function getToken(api: API): Promise<Token> {
	const { data } = await api.request<GetTokenResponse>({
		url: "/auth/token",
		method: "GET"
	})

	return data
}

export default getToken