import API from "../../API"
import Resource from "../../Resource"
import RobloxUser from "../../type/RobloxUser"

type RequestedRobloxUser = RobloxUser & {
	requestedUsername: string,
}

type GetRobloxUsernamesRequest = {
	usernames: string[],
	excludeBannedUsers?: boolean,
}

type GetRobloxUsernamesResponse = {
	data: RequestedRobloxUser[],
}

const RobloxUsernameResource = new Resource<string, RobloxUser, API>(async (requestedUsernames, api) => {
	const { data } = await api.request<GetRobloxUsernamesResponse>({
		url: "/roblox/usernames",
		method: "POST",
		data: {
			usernames: Object.values(requestedUsernames),
		} as GetRobloxUsernamesRequest,
	})

	const users = {} as { [key: string]: RequestedRobloxUser }
	for (const user of data.data) {
		users[user.requestedUsername] = user
	}
	return users
})

function getRobloxUsername(api: API, username: string, ignoreCache?: boolean) {
	username = username.toLowerCase()
	return RobloxUsernameResource.request(api, username, username, ignoreCache)
}

export default getRobloxUsername