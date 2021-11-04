import linkModeratorAccount from "../method/moderators/accounts/linkModeratorAccount"
import unlinkModeratorAccount from "../method/moderators/accounts/unlinkModeratorAccount"
import API from "../API"
import AccountPlatform from "../enum/AccountPlatform"
import Moderator from "./Moderator"
import ModeratorResolvable from "./resolvable/ModeratorResolvable"

type ModeratorAccountData = {
	platform: AccountPlatform,
	id: string | number,
}

class ModeratorAccount {
	public moderator: Moderator | ModeratorResolvable

	public platform: AccountPlatform
	public id: string | number

	constructor(moderator: Moderator | ModeratorResolvable, data: ModeratorAccountData) {
		this.moderator = moderator

		this.platform = data.platform
		this.id = data.id
	}

	public async link(api: API): Promise<void> {
		await linkModeratorAccount(api, this.moderator.id, {
			platform: this.platform,
			id: this.id,
		})

		if (this.moderator instanceof Moderator) {
			this.moderator.accounts = [ ...this.moderator.accounts, this ]
		}
	}

	public async unlink(api: API): Promise<void> {
		await unlinkModeratorAccount(api, this.moderator.id, {
			platform: this.platform,
			id: this.id,
		})

		if (this.moderator instanceof Moderator) {
			this.moderator.accounts = this.moderator.accounts.filter(filterAccount => !(filterAccount.platform === this.platform && filterAccount.id === this.id))
		}
	}
}

export default ModeratorAccount
export { ModeratorAccountData }