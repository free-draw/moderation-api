import API from "../../API"
import Report, { ReportData } from "../../class/Report"
import Resource from "../../Resource"

type GetReportsBulkResponse = {
	reports: ReportData[],
}

const ReportResource = new Resource<string, Report, API>(async (reportIds, api) => {
	const { data } = await api.request<GetReportsBulkResponse>({
		url: "/bulk/reports",
		method: "POST",
		data: {
			reportIds: Object.values(reportIds),
		},
	})

	const reports = {} as Record<string, Report>
	for (const reportData of data.reports) {
		reports[reportData.id] = new Report(reportData)
	}
	return reports
})

async function getReport(api: API, reportId: string, allowCache?: boolean): Promise<Report | null> {
	return await ReportResource.request(api, reportId, reportId, !allowCache) ?? null
}

export default getReport