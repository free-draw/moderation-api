import ModeratorResolvable from "../../class/resolvable/ModeratorResolvable"
import API from "../../API"

type CreateModeratorResponse = {
	moderatorId: string,
}

async function createModerator(api: API, options: {
	name: string,
	permissions?: string[],
}): Promise<ModeratorResolvable> {
	const { data } = await api.request<CreateModeratorResponse>({
		url: "/moderators",
		method: "POST",
		data: options,
	})

	return new ModeratorResolvable(data.moderatorId)
}

export default createModerator