import API from "../../API"
import User, { UserData } from "../../class/User"

type GetUsersBulkRequest = number[]

type GetUsersBulkResponse = {
	users: UserData[],
}

async function getUsersBulk(api: API, userIds: number[]): Promise<User[]> {
	const { data } = await api.request<GetUsersBulkResponse>({
		url: "/users",
		method: "POST",
		data: userIds as GetUsersBulkRequest,
	})

	return data.users.map((userData) => new User(userData))
}

export default getUsersBulk