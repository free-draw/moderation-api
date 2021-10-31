import API from "../../API"
import { Moderator, ModeratorData } from "../../class/Moderator"
import { ModeratorAccountData } from "../../class/ModeratorAccount"

type GetModeratorResponse = {
	moderator: ModeratorData,
}

async function getModerator(api: API, id: string | ModeratorAccountData): Promise<Moderator | null> {
	const { data } = await api.request<GetModeratorResponse>({
		url: typeof id === "string" ? `/moderators/${id}` : `/moderators/${id.platform}/${id.id}`,
		method: "GET",
	})

	return new Moderator(data.moderator)
}

export default getModerator