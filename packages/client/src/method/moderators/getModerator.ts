import API from "../../API"
import Moderator, { ModeratorData } from "../../class/Moderator"
import Resource from "../../Resource"

type GetModeratorsBulkResponse = {
	moderators: ModeratorData[],
}

const ModeratorResource = new Resource<string, Moderator, API>(async (moderatorIds, api) => {
	const { data } = await api.request<GetModeratorsBulkResponse>({
		url: "/bulk/moderators",
		method: "POST",
		data: { moderatorIds },
	})

	const moderators = {} as Record<string, Moderator>
	for (const moderatorData of data.moderators) {
		moderators[moderatorData.id] = new Moderator(moderatorData)
	}
	return moderators
})

async function getModerator(api: API, moderatorId: string, allowCache?: boolean): Promise<Moderator | null> {
	return await ModeratorResource.request(api, moderatorId, moderatorId, !allowCache) ?? null
}

export default getModerator