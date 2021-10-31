import ActionType from "../../enum/ActionType"
import API from "../../API"
import ActionResolvable from "../../class/resolvable/ActionResolvable"
import UserResolvable from "../../class/resolvable/UserResolvable"
import { ActionOptions } from "../../class/Action"

type AcceptReportRequest = {
	type: ActionType,
	reason: string,
	notes?: string,
	expiry?: string,
	duration?: number,
}

type AcceptReportResponse = {
	userId: number,
	actionId: string,
}

async function acceptReport(api: API, reportId: string, options: Omit<ActionOptions, "snapshot">): Promise<ActionResolvable> {
	const { data } = await api.request<AcceptReportResponse>({
		url: `/reports/${reportId}/accept`,
		method: "POST",
		data: {
			type: options.type,
			reason: options.reason,
			notes: options.notes,
			expiry: options.expiry ? options.expiry.toString() : undefined,
			duration: options.duration,
		} as AcceptReportRequest,
	})

	const userResolvable = new UserResolvable(data.userId)
	return new ActionResolvable(userResolvable, data.actionId)
}

export default acceptReport