import Action, { ActionData } from "./Action"

type UserData = {
	id: number,
	actions: ActionData[],
}

class User {
	public id: number
	public actions: Action[]

	constructor(data: UserData) {
		this.id = data.id
		this.actions = data.actions.map(actionData => new Action(actionData))
	}
}

export default User
export { UserData }