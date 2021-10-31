import Moderator, { ModeratorData } from "../../class/Moderator"
import API from "../../API"

type UpdateModeratorResponse = {
	moderator: ModeratorData,
}

async function updateModerator(api: API, moderatorId: string, options: {
	name?: string,
	permissions?: string,
	active?: boolean,
}) {
	const { data } = await api.request<UpdateModeratorResponse>({
		url: `/moderators/${moderatorId}`,
		method: "PATCH",
		data: options,
	})

	return new Moderator(data.moderator)
}

export default updateModerator