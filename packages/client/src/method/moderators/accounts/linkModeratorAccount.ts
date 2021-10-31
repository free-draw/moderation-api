import Moderator, { ModeratorData } from "../../../class/Moderator"
import ModeratorAccount, { ModeratorAccountData } from "../../../class/ModeratorAccount"
import API from "../../../API"

type LinkModeratorAccountResponse = {
	moderator: ModeratorData,
	account: ModeratorAccountData,
}

async function linkModeratorAccount(api: API, moderatorId: string, account: ModeratorAccount | ModeratorAccountData) {
	const { data } = await api.request<LinkModeratorAccountResponse>({
		url: `/moderators/${moderatorId}/accounts`,
		method: "POST",
		data: account,
	})

	return new Moderator(data.moderator)
}

export default linkModeratorAccount