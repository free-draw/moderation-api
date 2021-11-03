import API from "../../API"
import getReport from "../../method/reports/getReport"
import Report from "../Report"
import Resolvable from "../../type/interface/Resolvable"

class ReportResolvable implements Resolvable<Report> {
	public id: string

	constructor(id: string) {
		this.id = id
	}

	public async resolve(api: API): Promise<Report> {
		return getReport(api, this.id)
	}
}

export default ReportResolvable