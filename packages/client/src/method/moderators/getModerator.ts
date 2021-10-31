import API from "../../API"
import Moderator, { ModeratorData } from "../../class/Moderator"

type GetModeratorResponse = {
	moderator: ModeratorData,
}

async function getModerator(api: API, moderatorId: string): Promise<Moderator> {
	const { data } = await api.request<GetModeratorResponse>({
		url: `/moderators/${moderatorId}`,
		method: "GET",
	})

	return new Moderator(data.moderator)
}

export default getModerator