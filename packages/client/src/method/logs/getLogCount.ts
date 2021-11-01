import LogType from "../../enum/LogType"
import TimeSpan from "../../enum/TimeSpan"
import API from "../../API"

type GetLogCountResponse = {
	count: number,
}

async function getLogCount(api: API, options: {
	type: LogType,
	span: TimeSpan,
	moderator?: string,
}): Promise<number> {
	const { data } = await api.request<GetLogCountResponse>({
		url: "/logs/count",
		method: "GET",
		params: options,
	})

	return data.count
}

export default getLogCount