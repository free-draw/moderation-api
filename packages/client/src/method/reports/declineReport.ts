import API from "../../API"

async function declineReport(api: API, reportId: string): Promise<void> {
	await api.request({
		url: `/reports/${reportId}/decline`,
		method: "POST",
	})
}

export default declineReport