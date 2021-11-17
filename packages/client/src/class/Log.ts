import Action, { ActionData } from "./Action"
import Moderator from "./Moderator"
import ModeratorAccount from "./ModeratorAccount"
import ModeratorResolvable from "./resolvable/ModeratorResolvable"
import Report from "./Report"
import UserResolvable from "./resolvable/UserResolvable"
import LogType from "../enum/LogType"
import RobloxUser from "../type/RobloxUser"
import getRobloxUser from "../method/roblox/getRobloxUser"
import getModerator from "../method/moderators/getModerator"
import getReport from "../method/reports/getReport"
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
	[LogType.UPDATE_MODERATOR]: { moderator: Moderator, options: { name?: string, permissions?: string[], active?: boolean } },
	[LogType.LINK_MODERATOR_ACCOUNT]: { moderator: Moderator, account: ModeratorAccount },
	[LogType.UNLINK_MODERATOR_ACCOUNT]: { moderator: Moderator, account: ModeratorAccount },

	[LogType.ACCEPT_REPORT]: { report: Report, action: Action, target: RobloxUser, from: RobloxUser },
	[LogType.DECLINE_REPORT]: { report: Report, target: RobloxUser, from: RobloxUser },
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
		const type = this.type

		if (type === LogType.CREATE_ACTION) {
			return {
				user: await getRobloxUser(api, this.data.userId),
				action: new Action(new UserResolvable(this.data.userId), this.data.action),
			}
		} else if (type === LogType.DELETE_ACTION) {
			return {
				user: await getRobloxUser(api, this.data.userId),
				action: new Action(new UserResolvable(this.data.userId), this.data.action),
			}
		} else if (type === LogType.DELETE_ACTIONS_BULK) {
			return {
				user: await getRobloxUser(api, this.data.userId),
				actions: this.data.actions.map((actionData: ActionData) => new Action(new UserResolvable(this.data.userId), actionData)),
			}
		} else if (type === LogType.CREATE_MODERATOR) {
			return {
				moderator: new Moderator(this.data.moderator),
			}
		} else if (type === LogType.DELETE_MODERATOR) {
			return {
				moderator: new Moderator(this.data.moderator),
			}
		} else if (type === LogType.UPDATE_MODERATOR) {
			const moderator = await getModerator(api, this.data.moderatorId, true)
			if (!moderator) throw new Error("Moderator not found")

			return {
				moderator,
				options: this.data.options,
			}
		} else if (type === LogType.LINK_MODERATOR_ACCOUNT) {
			const moderator = await getModerator(api, this.data.moderatorId, true)
			if (!moderator) throw new Error("Moderator not found")

			return {
				moderator,
				account: new ModeratorAccount(moderator, this.data.account),
			}
		} else if (type === LogType.UNLINK_MODERATOR_ACCOUNT) {
			const moderator = await getModerator(api, this.data.moderatorId, true)
			if (!moderator) throw new Error("Moderator not found")

			return {
				moderator,
				account: new ModeratorAccount(moderator, this.data.account),
			}
		} else if (type === LogType.ACCEPT_REPORT) {
			const report = await getReport(api, this.data.reportId, true)
			if (!report) throw new Error("Report not found")

			const [ target, from ] = await Promise.all([
				getRobloxUser(api, report.target.id),
				getRobloxUser(api, report.from.id),
			])

			return {
				action: new Action(report.target, this.data.action),
				report,
				target,
				from,
			}
		} else if (type === LogType.DECLINE_REPORT) {
			const report = await getReport(api, this.data.reportId, true)
			if (!report) throw new Error("Report not found")

			const [ target, from ] = await Promise.all([
				getRobloxUser(api, report.target.id),
				getRobloxUser(api, report.from.id),
			])

			return {
				report,
				target,
				from,
			}
		}

		throw new Error("what")
	}
}

export default Log
export { LogData, LogTypeData }