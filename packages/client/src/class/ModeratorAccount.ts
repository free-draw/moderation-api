import AccountPlatform from "../enum/AccountPlatform"

type ModeratorAccountData = {
	platform: AccountPlatform,
	id: string | number,
}

class ModeratorAccount {
	public platform: AccountPlatform
	public id: string | number

	constructor(data: ModeratorAccountData) {
		this.platform = data.platform
		this.id = data.id
	}
}

export default ModeratorAccount
export { ModeratorAccountData }