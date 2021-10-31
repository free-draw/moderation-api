import API from "../../API"
import User, { UserData } from "../../class/User"

type GetUserResponse = {
	user: UserData,
}

async function getUser(api: API, id: number): Promise<User> {
	const { data } = await api.request<GetUserResponse>({
		url: `/users/${id}`,
		method: "GET",
	})

	return new User(data.user)
}

export default getUser