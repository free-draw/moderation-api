import API from "../../API"
import User, { UserData } from "../../class/User"

type GetUserResponse = {
	user: UserData,
}

async function getUser(api: API, userId: number): Promise<User> {
	const { data } = await api.request<GetUserResponse>({
		url: `/users/${userId}`,
		method: "GET",
	})

	return new User(data.user)
}

export default getUser