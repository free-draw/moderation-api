import LogType from "../../enum/LogType"
import SortDirection from "../../enum/SortDirection"
import API from "../../API"
import Log, { LogData } from "../../class/Log"
import Page from "../../type/interface/Page"

class LogsPage implements Page<Log> {
	private nextPageCursor: string
	private previousPageCursor: string
	public logs: Log[]

	constructor(nextPageCursor: string, previousPageCursor: string, logs: LogData[]) {
		this.nextPageCursor = nextPageCursor
		this.previousPageCursor = previousPageCursor
		this.logs = logs.map(logData => new Log(logData))
	}

	public async next(api: API): Promise<LogsPage> {
		return await getLogs(api, { cursor: this.nextPageCursor })
	}

	public async previous(api: API): Promise<LogsPage> {
		return await getLogs(api, { cursor: this.previousPageCursor })
	}
}

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
}): Promise<LogsPage> {
	const { data } = await api.request<GetLogsResponse>({
		url: "/logs",
		method: "GET",
		params: options,
	})

	return new LogsPage(data.nextPageCursor, data.previousPageCursor, data.logs)
}

export default getLogs