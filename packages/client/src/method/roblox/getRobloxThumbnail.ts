import API from "../../API"
import RobloxThumbnailType from "../../enum/RobloxThumbnailType"
import Resource from "../../Resource"

type RobloxThumbnail = string
type RobloxThumbnailOptions = { id: number, type: RobloxThumbnailType, size: String }

type GetRobloxThumbnailsRequest = {
	requestId: string,
	targetId: number,
	token?: string,
	alias?: string,
	type: RobloxThumbnailType,
	size: string,
	isCircular?: boolean,
}[]

type GetRobloxThumbnailsResponse = {
	data: {
		requestId: string,
		targetId: number,
		state: string,
		imageUrl: string,
		errorCode?: number,
		errorMessage?: string,
	}[],
}

const RobloxThumbnailResource = new Resource<RobloxThumbnailOptions, RobloxThumbnail, API>(async (requestedThumbnails, api) => {
	const { data } = await api.request<GetRobloxThumbnailsResponse>({
		method: "POST",
		url: "/roblox/thumbnails",
		data: Object.entries(requestedThumbnails).map(([ key, requestedThumbnail ]) => {
			return {
				requestId: key,
				targetId: requestedThumbnail.id,
				type: requestedThumbnail.type,
				size: requestedThumbnail.size,
			}
		}) as GetRobloxThumbnailsRequest,
	})

	const thumbnails = {} as { [key: string]: RobloxThumbnail }
	for (const thumbnail of data.data) {
		thumbnails[thumbnail.requestId] = thumbnail.imageUrl
	}
	return thumbnails
})

function getRobloxThumbnail(api: API, options: RobloxThumbnailOptions): Promise<RobloxThumbnail> {
	const key = `${options.id}-${options.type}-${options.size}`
	return RobloxThumbnailResource.request(api, options, key)
}

export default getRobloxThumbnail