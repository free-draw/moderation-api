import API from "../../API"
import ReportResolvable from "../../class/resolvable/ReportResolvable"
import { ReportOptions } from "../../class/Report"

type CreateReportResponse = {
	reportId: string,
}

async function createReport(api: API, options: ReportOptions) {
	const { data } = await api.request<CreateReportResponse>({
		url: "/reports",
		method: "POST",
		data: options,
	})

	return new ReportResolvable(data.reportId)
}

export default createReport