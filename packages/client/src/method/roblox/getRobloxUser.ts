import API from "../../API"
import Resource from "../../Resource"
import RobloxUser from "../../type/RobloxUser"

type GetRobloxUsersRequest = {
	userIds: number[],
	excludeBannedUsers?: boolean,
}

type GetRobloxUsersResponse = {
	data: RobloxUser[],
}

const RobloxUserResource = new Resource<number, RobloxUser, API>(async (requestedUsers, api) => {
	const { data } = await api.request<GetRobloxUsersResponse>({
		url: "/roblox/users",
		method: "POST",
		data: {
			userIds: Object.values(requestedUsers),
		} as GetRobloxUsersRequest,
	})

	const users = {} as { [key: string]: RobloxUser }
	for (const user of data.data) {
		users[user.id.toString()] = user
	}
	return users
})

function getRobloxUser(api: API, id: number, ignoreCache?: boolean): Promise<RobloxUser> {
	return RobloxUserResource.request(api, id, id.toString(), ignoreCache)
}

export default getRobloxUser