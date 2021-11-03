import Action, { ActionData, ActionOptions } from "../../../class/Action"
import UserResolvable from "../../../class/resolvable/UserResolvable"
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

	return new Action(new UserResolvable(userId), data.action)
}

export default createAction