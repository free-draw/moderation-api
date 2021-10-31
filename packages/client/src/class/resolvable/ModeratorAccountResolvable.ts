import API from "../../API"
import AccountPlatform from "../../enum/AccountPlatform"
import getModerator from "../../method/moderators/getModerator"
import ModeratorAccount from "../ModeratorAccount"
import Resolvable from "./Resolvable"

class ModeratorAccountResolvable implements Resolvable<ModeratorAccount> {
	public platform: AccountPlatform
	public id: string | number

	constructor(type: AccountPlatform, id: string | number) {
		this.platform = type
		this.id = id
	}

	public async resolve(api: API): Promise<ModeratorAccount | null> {
		const moderator = await getModerator(api, {
			platform: this.platform,
			id: this.id,
		})

		return moderator?.accounts.find(account => account.platform === this.platform && account.id === this.id) ?? null
	}
}

export default ModeratorAccountResolvable