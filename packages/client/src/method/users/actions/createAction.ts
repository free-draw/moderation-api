import Action, { ActionData, ActionOptions } from "../../../class/Action"
import API from "../../../API"

type CreateActionResponse = {
	action: ActionData,
}

async function createAction(api: API, userId: number, options: ActionOptions) {
	const { data } = await api.request<CreateActionResponse>({
		url: `/users/${userId}/actions`,
		method: "POST",
		data: options,
	})

	return new Action(data.action)
}

export default createAction