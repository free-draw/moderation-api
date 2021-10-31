import LogType from "../LogType"
import ReportData from "../../schema/Report"
import ActionData from "../../schema/Action"
import ModeratorData from "../../schema/Moderator"
import Permission from "../../Permission"
import ModeratorAccountData from "../../schema/ModeratorAccount"

type LogTypeData = {
	[LogType.CREATE_ACTION]: { userId: number, actionId: string },
	[LogType.DELETE_ACTION]: { userId: number, action: ActionData },
	[LogType.DELETE_ACTIONS_BULK]: { userId: number, actions: ActionData[] },

	[LogType.CREATE_MODERATOR]: { moderatorId: string },
	[LogType.DELETE_MODERATOR]: { moderator: ModeratorData },
	[LogType.UPDATE_MODERATOR]: { moderatorId: string, name?: string, permissions?: Permission[], active?: boolean },
	[LogType.LINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccountData },
	[LogType.UNLINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccountData },

	[LogType.ACCEPT_REPORT]: { reportId: ReportData },
	[LogType.DECLINE_REPORT]: { reportId: ReportData },
}

export default LogTypeData