import API from "../../API"

type SignServerTokenResponse = {
	token: string,
}

async function signServerToken(api: API, tag?: string): Promise<string> {
	const { data } = await api.request<SignServerTokenResponse>({
		url: "/auth/token/server",
		method: "GET",
		params: { tag },
	})

	return data.token
}

export default signServerToken