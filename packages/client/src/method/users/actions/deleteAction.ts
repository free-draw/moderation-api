import Action, { ActionData } from "../../../class/Action"
import API from "../../../API"

type DeleteActionResponse = {
	action: ActionData,
}

async function deleteAction(api: API, userId: number, actionId: string): Promise<Action> {
	const { data } = await api.request<DeleteActionResponse>({
		url: `/users/${userId}/actions/${actionId}`,
		method: "DELETE",
	})

	return new Action(data.action)
}

export default deleteAction