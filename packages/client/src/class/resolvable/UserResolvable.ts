import API from "../../API"
import getUser from "../../method/users/getUser"
import Resolvable from "../../type/interface/Resolvable"
import User from "../User"

class UserResolvable implements Resolvable<User> {
	public id: number

	constructor(id: number) {
		this.id = id
	}

	public async resolve(api: API, allowCache?: boolean): Promise<User> {
		return await getUser(api, this.id, allowCache)
	}
}

export default UserResolvable