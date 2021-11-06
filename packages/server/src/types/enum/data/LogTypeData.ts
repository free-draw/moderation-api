import LogType from "../LogType"
import { ActionData } from "../../schema/Action"
import ModeratorData from "../../schema/Moderator"
import Permission from "../../Permission"
import ModeratorAccountData from "../../schema/ModeratorAccount"

type LogTypeData = {
	[LogType.CREATE_ACTION]: { userId: number, action: ActionData },
	[LogType.DELETE_ACTION]: { userId: number, action: ActionData },
	[LogType.DELETE_ACTIONS_BULK]: { userId: number, actions: ActionData[] },

	[LogType.CREATE_MODERATOR]: { moderator: ModeratorData },
	[LogType.DELETE_MODERATOR]: { moderator: ModeratorData },
	[LogType.UPDATE_MODERATOR]: { moderatorId: string, options: { name?: string, permissions?: Permission[], active?: boolean } },
	[LogType.LINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccountData },
	[LogType.UNLINK_MODERATOR_ACCOUNT]: { moderatorId: string, account: ModeratorAccountData },

	[LogType.ACCEPT_REPORT]: { reportId: string, action: ActionData },
	[LogType.DECLINE_REPORT]: { reportId: string },
}

export default LogTypeData