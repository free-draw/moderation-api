import API from "../../API"

async function declineReport(api: API, id: string): Promise<void> {
	await api.request({
		url: `/reports/${id}/decline`,
		method: "POST",
	})
}

export default declineReport