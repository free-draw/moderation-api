import API from "../../API"
import AccountPlatform from "../../enum/AccountPlatform"
import findModerator from "../../method/moderators/findModerator"
import ModeratorAccount from "../ModeratorAccount"
import Resolvable from "../../type/interface/Resolvable"

class ModeratorAccountResolvable implements Resolvable<ModeratorAccount> {
	public platform: AccountPlatform
	public id: string | number

	constructor(type: AccountPlatform, id: string | number) {
		this.platform = type
		this.id = id
	}

	public async resolve(api: API): Promise<ModeratorAccount> {

		const moderator = await findModerator(api, {
			account: {
				platform: this.platform,
				id: this.id,
			},
		})

		const account = moderator.accounts.find(account => account.platform === this.platform && account.id === this.id)
		if (!account) throw new Error("Unable to find ModeratorAccount")

		return account
	}
}

export default ModeratorAccountResolvable