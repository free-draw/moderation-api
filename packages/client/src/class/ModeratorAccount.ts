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
}

export default ModeratorAccount
export { ModeratorAccountData }