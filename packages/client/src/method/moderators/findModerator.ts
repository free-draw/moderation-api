import Moderator, { ModeratorData } from "../../class/Moderator"
import ModeratorAccount, { ModeratorAccountData } from "../../class/ModeratorAccount"
import API from "../../API"

type FindModeratorResponse = {
	moderator: ModeratorData
}

async function findModerator(api: API, options: {
	account?: ModeratorAccount | ModeratorAccountData,
}) {
	const params = {} as Record<string, string>
	if (options.account) params.account = `${options.account.platform}/${options.account.id}`

	const { data } = await api.request<FindModeratorResponse>({
		url: "/moderators",
		method: "GET",
		params,
	})

	return new Moderator(data.moderator)
}

export default findModerator