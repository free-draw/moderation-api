import API from "../API"
import { ModeratorAccount, ModeratorAccountData } from "./ModeratorAccount"

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
		this.accounts = data.accounts.map(accountData => new ModeratorAccount(accountData))
		this.permissions = data.permissions
	}

	public async linkAccount(account: ModeratorAccount | ModeratorAccountData): Promise<void> {
		// TODO
	}

	public async unlinkAccount(account: ModeratorAccount | ModeratorAccountData): Promise<void> {
		// TODO
	}

	public async delete(api: API): Promise<void> {
		// TODO
	}
}

export default Moderator
export { Moderator, ModeratorData }