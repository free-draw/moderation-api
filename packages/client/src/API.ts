import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { ModeratorAccountData } from "./class/ModeratorAccount"
import urljoin from "url-join"

class API {
	public url: string
	public token?: string
	public identity?: ModeratorAccountData

	constructor(url: string, token?: string, identity?: ModeratorAccountData) {
		this.url = url
		this.token = token
		this.identity = identity
	}

	public async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		const headers = {
			...(config.headers ?? {}),
		} as Record<string, string>
		if (this.token) {
			headers.authorization = `Bearer ${this.token}`
		}

		const params = {
			...(config.params ?? {}),
		} as Record<string, string>
		if (this.identity) {
			params.identity = `${this.identity.platform}/${this.identity.id}`
		}

		return await axios.request<T>({
			...config,
			url: urljoin(this.url, config.url as string),
			headers,
		})
	}

	public as(identity: ModeratorAccountData): API {
		return new API(this.url, this.token, identity)
	}
}

export default API