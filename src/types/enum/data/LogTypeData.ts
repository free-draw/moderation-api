import LogType from "../LogType"
import Report from "../../schema/Report"
import Action from "../../schema/Action"
import Moderator from "../../schema/Moderator"
import Permission from "../../Permission"
import ModeratorAccount from "../../schema/ModeratorAccount"

type LogTypeData = {
	[LogType.CREATE_ACTION]: { userId: number, actionId: string },
	[LogType.DELETE_ACTION]: { userId: number, action: Action },
	[LogType.DELETE_ACTIONS_BULK]: { userId: number, actions: Action[] },

	[LogType.CREATE_MODERATOR]: { moderatorId: string },
	[LogType.DELETE_MODERATOR]: { moderator: Moderator },
	[LogType.UPDATE_MODERATOR]: { moderatorId: string, name?: string, permissions?: Permission[], active?: boolean },
	[LogType.LINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccount },
	[LogType.UNLINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccount },

	[LogType.ACCEPT_REPORT]: { reportId: Report },
	[LogType.DECLINE_REPORT]: { reportId: Report },
}

export default LogTypeData