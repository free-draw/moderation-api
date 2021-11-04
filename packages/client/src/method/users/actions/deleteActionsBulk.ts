import API from "../../../API"
import ActionType from "../../../enum/ActionType"
import ActionResolvable from "../../../class/resolvable/ActionResolvable"
import UserResolvable from "../../../class/resolvable/UserResolvable"

type DeleteActionsBulkResponse = {
	actionIds: string[],
}

async function deleteActionsBulk(api: API, userId: number, options: {
	type?: ActionType,
}): Promise<ActionResolvable[]> {
	const { data } = await api.request<DeleteActionsBulkResponse>({
		url: `/users/${userId}/actions`,
		method: "DELETE",
		params: options,
	})

	return data.actionIds.map(actionId => new ActionResolvable(new UserResolvable(userId), actionId))
}

export default deleteActionsBulk