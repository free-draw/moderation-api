import ActionData from "../../schema/Action"
import ReportData from "../../schema/Report"

type RedisEventData = {
	reportCreate: { report: ReportData },
	reportDelete: { report: ReportData },
	actionCreate: { userId: number, action: ActionData },
	actionDelete: { userId: number, action: ActionData },
}

export default RedisEventData