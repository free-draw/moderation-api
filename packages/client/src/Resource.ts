import { EventEmitter2 } from "eventemitter2"
import NodeCache from "node-cache"
import lodash from "lodash"

enum ResourceState {
	READY,
	REQUEST_PENDING,
	REQUEST_ACTIVE,
}

type ResourceFetcher<I, O, D> = (
	data: { [key: string]: I },
	designator: D
) => Promise<{ [key: string]: O }>

type ResourceItemListener<O> = {
	resolve: (result: O) => any,
	reject: (reason: any) => any,
}

type ResourceItem<I, O> = {
	data: I,
	listeners: ResourceItemListener<O>[],
}

class ResourceQueue<I, O, D> extends EventEmitter2 {
	public designator: D
	public fetcher: ResourceFetcher<I, O, D>
	public timeout: number

	private items: { [key: string]: ResourceItem<I, O> } = {}
	public state: ResourceState = ResourceState.READY

	constructor(options: {
		designator: D,
		fetcher: ResourceFetcher<I, O, D>,
		timeout?: number,
	}) {
		super()

		this.designator = options.designator
		this.fetcher = options.fetcher
		this.timeout = options.timeout ?? 100
	}

	private setState(state: ResourceState) {
		this.state = state
		this.emit("state", state)
	}

	private async flush() {
		this.setState(ResourceState.REQUEST_ACTIVE)

		const items = this.items
		this.items = {}

		try {
			const results = await this.fetcher(lodash.mapValues(items, item => item.data), this.designator)

			for (const key in items) {
				const item = items[key]
				const result = results[key]

				for (const listener of item.listeners) {
					listener.resolve(result)
				}
			}
		} catch(error) {
			for (const key in items) {
				const item = items[key]

				for (const listener of item.listeners) {
					listener.reject(error)
				}
			}
		}

		if (Object.values(this.items).length > 0) {
			this.flush()
		} else {
			this.setState(ResourceState.READY)
		}
	}

	public request(data: I, key: string): Promise<O> {
		return new Promise((resolve, reject) => {
			if (this.state == ResourceState.READY) {
				this.setState(ResourceState.REQUEST_PENDING)

				setTimeout(() => {
					if (this.state === ResourceState.READY) {
						this.flush()
					}
				}, this.timeout)
			}

			const listener = { resolve, reject } as ResourceItemListener<O>

			if (this.items[key]) {
				this.items[key].listeners.push(listener)
			} else {
				this.items[key] = {
					data,
					listeners: [ listener ],
				}
			}
		})
	}
}

type ResourceCache<D> = {
	designator: D,
	cache: NodeCache,
}

class Resource<I, O, D> {
	public fetcher: ResourceFetcher<I, O, D>
	public timeout: number
	public defaultCacheOptions?: NodeCache.Options

	private queues: ResourceQueue<I, O, D>[] = []
	private caches: ResourceCache<D>[] = []

	constructor(fetcher: ResourceFetcher<I, O, D>, options?: {
		timeout: number,
		defaultCacheOptions?: NodeCache.Options,
	}) {
		this.fetcher = fetcher
		this.timeout = options?.timeout ?? 100
		this.defaultCacheOptions = options?.defaultCacheOptions
	}

	private queue(designator: D): ResourceQueue<I, O, D> {
		let queue = this.queues.find(findQueue => findQueue.designator === designator)

		if (!queue) {
			queue = new ResourceQueue({
				designator,
				fetcher: this.fetcher,
				timeout: this.timeout,
			})

			queue.on("state", (state: ResourceState) => {
				if (state === ResourceState.READY) {
					this.queues = this.queues.filter(filterQueue => filterQueue !== queue)
				}
			})
		}

		return queue
	}

	private cache(designator: D): NodeCache {
		let cache = this.caches.find(cache => cache.designator === designator)

		if (!cache) {
			const nodeCache = new NodeCache(this.defaultCacheOptions)

			cache = {
				designator,
				cache: nodeCache,
			}

			nodeCache.on("expired", () => {
				if (nodeCache.keys().length === 0) {
					this.caches = this.caches.filter(filterCache => filterCache !== cache)
				}
			})
		}

		return cache.cache
	}

	public request(designator: D, data: I, key: string, ignoreCache?: boolean): Promise<O> {
		const cache = this.cache(designator)
		let value = cache.get<O>(key)

		if (!value || ignoreCache) {
			const queue = this.queue(designator)

			return queue.request(data, key).then((result: O) => {
				cache.set(key, data)
				return result
			})
		} else {
			return Promise.resolve(value)
		}
	}
}

class SimpleResource<I, O> {
	public resource: Resource<I, O, string>

	constructor(fetcher: ResourceFetcher<I, O, string>, options?: {
		timeout: number,
		defaultCacheOptions?: NodeCache.Options,
	}) {
		this.resource = new Resource(fetcher, options)
	}

	public request(data: I, key: string): Promise<O> {
		return this.resource.request("default", data, key)
	}
}

export default Resource
export {
	Resource,
	SimpleResource,
}