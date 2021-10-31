import API from "../../API"
import Report, { ReportData } from "../../class/Report"

type GetPendingReportsResponse = {
	reports: ReportData[],
}

async function getPendingReports(api: API): Promise<Report[]> {
	const { data } = await api.request<GetPendingReportsResponse>({
		url: "/reports",
		method: "GET",
	})

	return data.reports.map(reportData => new Report(reportData))
}

export default getPendingReports