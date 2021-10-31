import Action, { ActionData } from "../../../class/Action"
import API from "../../../API"
import { ActionType } from "../../.."

type DeleteActionsBulkResponse = {
	actions: ActionData[],
}

async function deleteActionsBulk(api: API, userId: number, options: {
	type?: ActionType,
}): Promise<Action[]> {
	const { data } = await api.request<DeleteActionsBulkResponse>({
		url: `/users/${userId}/actions`,
		method: "DELETE",
		params: options,
	})

	return data.actions.map(actionData => new Action(actionData))
}

export default deleteActionsBulk