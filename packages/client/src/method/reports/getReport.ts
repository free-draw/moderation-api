import API from "../../API"
import Report, { ReportData } from "../../class/Report"

type GetReportResponse = {
	report: ReportData,
}

async function getReport(api: API, id: string): Promise<Report | null> {
	const { data } = await api.request<GetReportResponse>({
		url: `/reports/${id}`,
		method: "GET",
	})

	return new Report(data.report)
}

export default getReport