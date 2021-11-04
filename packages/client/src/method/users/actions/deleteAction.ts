import ActionResolvable from "../../../class/resolvable/ActionResolvable"
import UserResolvable from "../../../class/resolvable/UserResolvable"
import API from "../../../API"

type DeleteActionResponse = {
	actionId: string,
}

async function deleteAction(api: API, userId: number, actionId: string): Promise<ActionResolvable> {
	const { data } = await api.request<DeleteActionResponse>({
		url: `/users/${userId}/actions/${actionId}`,
		method: "DELETE",
	})

	return new ActionResolvable(new UserResolvable(userId), data.actionId)
}

export default deleteAction