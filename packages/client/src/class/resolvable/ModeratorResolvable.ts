import Resolvable from "../../type/interface/Resolvable"
import Moderator from "../Moderator"
import API from "../../API"
import getModerator from "../../method/moderators/getModerator"

class ModeratorResolvable implements Resolvable<Moderator> {
	public id: string

	constructor(id: string) {
		this.id = id
	}

	public async resolve(api: API, allowCache?: boolean): Promise<Moderator> {
		const moderator = await getModerator(api, this.id, allowCache)
		if (!moderator) throw new Error("Moderator not found")

		return moderator
	}
}

export default ModeratorResolvable