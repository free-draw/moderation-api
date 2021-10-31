import ActionType from "../enum/ActionType"
//import ModeratorResolvable from "./resolvable/ModeratorResolvable"
//import ReportResolvable from "./resolvable/ReportResolvable"
//import SnapshotResolvable from "./resolvable/SnapshotResolvable"

type ActionData = {
	id: string,
	active: boolean,
	created: Date,
	type: ActionType,
	expiry?: Date,
	reason: string,
	notes?: string,
	snapshot?: string,
	report?: string,
	moderator?: string,
}

class Action {
	public id: string
	public active: boolean
	public created: Date
	public type: ActionType
	public expiry?: Date
	public reason: string
	public notes?: string
	//public snapshot?: SnapshotResolvable
	//public report?: ReportResolvable
	//public moderator?: ModeratorResolvable

	constructor(data: ActionData) {
		this.id = data.id
		this.active = data.active
		this.created = new Date(data.created)
		this.type = data.type
		this.expiry = data.expiry ? new Date(data.expiry) : undefined
		this.reason = data.reason
		this.notes = data.notes
		//this.snapshot = data.snapshot ? new SnapshotResolvable(data.snapshot) : undefined
		//this.report = data.report ? new ReportResolvable(data.report) : undefined
		//this.moderator = data.moderator ? new ModeratorResolvable(data.moderator) : undefined
	}

	public async delete(): Promise<void> {
		// TODO
	}
}

export default Action
export { Action, ActionData }