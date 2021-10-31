import API from "../../API"
import Report, { ReportData } from "../../class/Report"

type GetReportResponse = {
	report: ReportData,
}

async function getReport(api: API, reportId: string): Promise<Report | null> {
	const { data } = await api.request<GetReportResponse>({
		url: `/reports/${reportId}`,
		method: "GET",
	})

	return new Report(data.report)
}

export default getReport