import API from "../../API"
import Action from "../Action"
import Resolvable from "../../type/interface/Resolvable"
import User from "../User"
import UserResolvable from "./UserResolvable"

class ActionResolvable implements Resolvable<Action> {
	public user: User | UserResolvable
	public id: string

	constructor(user: User | UserResolvable, id: string) {
		this.user = user
		this.id = id
	}

	public async resolve(api: API): Promise<Action> {
		let user: User

		if (this.user instanceof User) {
			user = this.user
		} else {
			user = await this.user.resolve(api)
		}

		const action = user.actions.find(action => this.id === action.id)
		if (!action) throw new Error("Unable to find Action")

		return action
	}
}

export default ActionResolvable