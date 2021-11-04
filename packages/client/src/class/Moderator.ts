import updateModerator from "../method/moderators/updateModerator"
import API from "../API"
import ModeratorAccount, { ModeratorAccountData } from "./ModeratorAccount"

type ModeratorData = {
	id: string,
	name: string,
	active: boolean,
	accounts: ModeratorAccountData[],
	permissions: string[],
}

class Moderator {
	public id: string
	public name: string
	public active: boolean
	public accounts: ModeratorAccount[]
	public permissions: string[]

	constructor(data: ModeratorData) {
		this.id = data.id
		this.name = data.name
		this.active = data.active
		this.accounts = data.accounts.map(accountData => new ModeratorAccount(this, accountData))
		this.permissions = data.permissions
	}

	public async update(api: API, options: {
		name?: string,
		permissions?: string[],
		active?: boolean,
	}): Promise<void> {
		await updateModerator(api, this.id, options)

		if (options.name) this.name = options.name
		if (options.permissions) this.permissions = options.permissions
		if (options.active) this.active = options.active
	}

	public async linkAccount(api: API, accountData: ModeratorAccountData): Promise<ModeratorAccount> {
		const account = new ModeratorAccount(this, accountData)
		await account.link(api)
		return account
	}
}

export default Moderator
export { ModeratorData }