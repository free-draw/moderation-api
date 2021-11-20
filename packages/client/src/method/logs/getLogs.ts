import LogType from "../../enum/LogType"
import SortDirection from "../../enum/SortDirection"
import API from "../../API"
import Log, { LogData, LogTypeData } from "../../class/Log"
import Moderator from "../../class/Moderator"
import Page from "../../type/interface/Page"
import getModerator from "../moderators/getModerator"

type LogModeratorResolved = {
	log: Log,
	moderator: Moderator
}
type LogDataResolved = {
	log: Log,
	data: LogTypeData[keyof LogTypeData],
}
type LogResolved = LogModeratorResolved & LogDataResolved

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

	// Resolving

	public async resolveLogModerators(api: API): Promise<LogModeratorResolved[]> {
		return await Promise.all(
			this.logs.map(async (log) => {
				return {
					log,
					moderator: await log.moderator.resolve(api),
				}
			})
		)
	}

	public async resolveLogData(api: API): Promise<LogDataResolved[]> {
		return await Promise.all(
			this.logs.map(async (log) => {
				return {
					log,
					data: await log.resolveData(api),
				}
			})
		)
	}

	public async resolveAll(api: API): Promise<LogResolved[]> {
		const [ logModerators, logData ] = await Promise.all([
			this.resolveLogModerators(api),
			this.resolveLogData(api),
		])

		const results = [] as LogResolved[]

		for (let index = 0; index < this.logs.length; index++) {
			results.push({
				log: this.logs[index],
				moderator: logModerators[index].moderator,
				data: logData[index].data,
			})
		}

		return results
	}
}

type GetLogsResponse = {
	nextPageCursor: string,
	previousPageCursor: string,
	index: number,
	logs: LogData[],
}

type GetLogsOptions = {
	cursor?: string,
	type?: LogType,
	source?: string,
	direction?: SortDirection,
	after?: string,
	before?: string,
	size?: number,
}

async function getLogs(api: API, options?: GetLogsOptions): Promise<LogsPage> {
	const { data } = await api.request<GetLogsResponse>({
		url: "/logs",
		method: "GET",
		params: options,
	})

	return new LogsPage(data.nextPageCursor, data.previousPageCursor, data.logs)
}

export default getLogs
export {
	LogsPage,
	LogResolved,
	LogDataResolved,
	LogModeratorResolved,
	GetLogsOptions,
}