import LogType from "../../enum/LogType"
import SortDirection from "../../enum/SortDirection"
import API from "../../API"
import Log, { LogData } from "../../class/Log"

type GetLogsResponse = {
	nextPageCursor: string,
	previousPageCursor: string,
	index: number,
	logs: LogData[],
}

async function getLogs(api: API, options?: {
	cursor?: string,
	type?: LogType,
	source?: string,
	direction?: SortDirection,
	after?: string,
	before?: string,
	size?: string,
}): Promise<Log[]> {
	const { data } = await api.request<GetLogsResponse>({
		url: "/logs",
		method: "GET",
		params: options,
	})

	return data.logs.map(logData => new Log(logData))
}

export default getLogs