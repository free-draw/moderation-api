import API from "../../API"
import getReport from "../../method/reports/getReport"
import Report from "../Report"
import Resolvable from "../../type/interface/Resolvable"

class ReportResolvable implements Resolvable<Report> {
	public id: string

	constructor(id: string) {
		this.id = id
	}

	public async resolve(api: API, allowCache?: boolean): Promise<Report> {
		const report = await getReport(api, this.id, allowCache)
		if (!report) throw new Error("Report not found")

		return report
	}
}

export default ReportResolvable