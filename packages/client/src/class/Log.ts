import ModeratorResolvable from "./resolvable/ModeratorResolvable"
import LogType from "../enum/LogType"

type LogData = {
	id: string,
	time: Date | string | number,
	type: LogType,
	data: any,
	moderator: string,
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
}

export default Log
export { LogData }