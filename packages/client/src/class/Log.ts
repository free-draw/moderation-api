import Action, { ActionData } from "./Action"
import Moderator from "./Moderator"
import ModeratorAccount from "./ModeratorAccount"
import ModeratorResolvable from "./resolvable/ModeratorResolvable"
import ReportResolvable from "./resolvable/ReportResolvable"
import LogType from "../enum/LogType"
import RobloxUser from "../type/RobloxUser"
import getRobloxUser from "../method/roblox/getRobloxUser"
import API from "../API"

type LogData = {
	id: string,
	time: Date | string | number,
	type: LogType,
	data: any,
	moderator: string,
}

type LogTypeData = {
	[LogType.CREATE_ACTION]: { user: RobloxUser, action: Action },
	[LogType.DELETE_ACTION]: { user: RobloxUser, action: Action },
	[LogType.DELETE_ACTIONS_BULK]: { user: RobloxUser, actions: Action[] },

	[LogType.CREATE_MODERATOR]: { moderator: Moderator },
	[LogType.DELETE_MODERATOR]: { moderator: Moderator },
	[LogType.UPDATE_MODERATOR]: { moderator: ModeratorResolvable, name?: string, permissions?: string[], active?: boolean },
	[LogType.LINK_MODERATOR_ACCOUNT]: { moderator: ModeratorResolvable, account: ModeratorAccount },
	[LogType.UNLINK_MODERATOR_ACCOUNT]: { moderator: ModeratorResolvable, account: ModeratorAccount },

	[LogType.ACCEPT_REPORT]: { report: ReportResolvable },
	[LogType.DECLINE_REPORT]: { report: ReportResolvable },
}

class Log {
	public id: string
	public time: Date
	public type: LogType
	public data: any
	public moderator: ModeratorResolvable

	constructor(data: LogData) {
		this.id = data.id
		this.time = new Date(data.time)
		this.type = data.type
		this.data = data.data
		this.moderator = new ModeratorResolvable(data.moderator)
	}

	public async resolveData(api: API): Promise<LogTypeData[keyof LogTypeData]> {
		switch (this.type) {
			case LogType.CREATE_ACTION:
				return {
					user: await getRobloxUser(api, this.data.userId),
					action: new Action(this.data.action),
				}
			case LogType.DELETE_ACTION:
				return {
					user: await getRobloxUser(api, this.data.userId),
					action: new Action(this.data.action),
				}
			case LogType.DELETE_ACTIONS_BULK:
				return {
					user: await getRobloxUser(api, this.data.userId),
					actions: this.data.actions.map((actionData: ActionData) => new Action(actionData)),
				}

			case LogType.CREATE_MODERATOR:
				return {
					moderator: new Moderator(this.data.moderator),
				}
			case LogType.DELETE_MODERATOR:
				return {
					moderator: new Moderator(this.data.moderator),
				}
			case LogType.UPDATE_MODERATOR:
				return {
					moderator: new ModeratorResolvable(this.data.moderatorId),
				}
			case LogType.LINK_MODERATOR_ACCOUNT:
				return {
					moderator: new ModeratorResolvable(this.data.moderatorId),
					account: new ModeratorAccount(this.data.account),
				}
			case LogType.UNLINK_MODERATOR_ACCOUNT:
				return {
					moderator: new ModeratorResolvable(this.data.moderatorId),
					account: new ModeratorAccount(this.data.account),
				}

			case LogType.ACCEPT_REPORT:
				return {
					report: new ReportResolvable(this.data.reportId),
				}
			case LogType.DECLINE_REPORT:
				return {
					report: new ReportResolvable(this.data.reportId),
				}
		}
	}
}

export default Log
export { LogData, LogTypeData }