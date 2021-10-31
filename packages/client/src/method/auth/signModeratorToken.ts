import API from "../../API"

type SignModeratorTokenResponse = {
	token: string,
}

async function signModeratorToken(api: API, moderatorId: string, tag?: string): Promise<string> {
	const { data } = await api.request<SignModeratorTokenResponse>({
		url: "/auth/token/moderator",
		method: "GET",
		params: { id: moderatorId, tag },
	})

	return data.token
}

export default signModeratorToken