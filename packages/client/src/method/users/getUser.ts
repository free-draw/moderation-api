import API from "../../API"
import User, { UserData } from "../../class/User"
import Resource from "../../Resource"

type GetUsersBulkResponse = {
	users: UserData[],
}

const UserResource = new Resource<number, User, API>(async (userIds, api) => {
	const { data } = await api.request<GetUsersBulkResponse>({
		url: "/bulk/users",
		method: "POST",
		data: {
			userIds: Object.values(userIds),
		},
	})

	const users = {} as Record<number, User>
	for (const userData of data.users) {
		users[userData.id] = new User(userData)
	}
	return users
})

async function getUser(api: API, userId: number, allowCache?: boolean): Promise<User> {
	return await UserResource.request(api, userId, userId.toString(), !allowCache)
}

export default getUser