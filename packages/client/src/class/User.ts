import Action, { ActionData, ActionOptions } from "./Action"
import API from "../API"
import createAction from "../method/users/actions/createAction"
import ActionType from "../enum/ActionType"
import deleteActionsBulk from "../method/users/actions/deleteActionsBulk"

type UserData = {
	id: number,
	actions: ActionData[],
}

class User {
	public id: number
	public actions: Action[]

	constructor(data: UserData) {
		this.id = data.id
		this.actions = data.actions.map(actionData => new Action(this, actionData))
	}

	public async createAction(api: API, options: ActionOptions): Promise<Action> {
		const action = await createAction(api, this.id, options)
		this.actions = [ ...this.actions, action ]
		return action
	}

	public async deleteActionsBulk(api: API, options: {
		type?: ActionType,
	}): Promise<void> {
		const actionResolvables = await deleteActionsBulk(api, this.id, options)

		this.actions.forEach((action) => {
			if (actionResolvables.find(actionResolvable => actionResolvable.id === action.id)) {
				action.active = false
			}
		})
	}
}

export default User
export { UserData }