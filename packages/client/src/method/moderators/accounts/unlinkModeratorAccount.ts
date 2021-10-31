import Moderator, { ModeratorData } from "../../../class/Moderator"
import ModeratorAccount, { ModeratorAccountData } from "../../../class/ModeratorAccount"
import API from "../../../API"

type UnlinkModeratorAccountResponse = {
	moderator: ModeratorData,
	account: ModeratorAccountData,
}

async function unlinkModeratorAccount(api: API, moderatorId: string, account: ModeratorAccount | ModeratorAccountData) {
	const { data } = await api.request<UnlinkModeratorAccountResponse>({
		url: `/moderators/${moderatorId}/accounts/${account.platform}/${account.id}`,
		method: "DELETE",
	})

	return new Moderator(data.moderator)
}

export default unlinkModeratorAccount