import Fastify, { FastifyInstance } from "fastify"
import IORedis from "ioredis"
import Mongoose from "mongoose"
import { resolve } from "path"
import env from "./util/option/env"
import log from "./util/log"

import HelmetPlugin from "fastify-helmet"
import CookiePlugin from "fastify-cookie"
import AuthPlugin from "fastify-auth"
import AutoloadPlugin from "fastify-autoload"
import FastifyJWT from "fastify-jwt"

import DecoratePlugin from "./plugins/Decorate"
import SchemaPlugin from "./plugins/Schema"

class App {
	public fastify: FastifyInstance
	public redis: IORedis.Redis

	constructor() {
		this.fastify = Fastify({ logger: log })
		this.redis = new IORedis(env.redisUrl)
	}

	public async publish(name: string, data: any): Promise<void> {
		await this.redis.publish(name, JSON.stringify(data))
	}

	private async initFastify(): Promise<string> {
		const fastify = this.fastify

		fastify.register(HelmetPlugin)
		fastify.register(CookiePlugin)
		fastify.register(AuthPlugin)
		fastify.register(FastifyJWT, { secret: env.jwtSecret })

		fastify.register(DecoratePlugin)
		fastify.register(SchemaPlugin)

		fastify.register(AutoloadPlugin, {
			dir: resolve(__dirname, "./handlers"),
			dirNameRoutePrefix: false,
		})

		return await fastify.listen(env.port ?? 80, env.address ?? "0.0.0.0")
	}

	private async initRedis(): Promise<void> {
		this.redis.connect(() => {
			log.info("Connected to Redis")
		})
	}

	private async initMongo(): Promise<void> {
		await new Promise((resolve, reject) => {
			Mongoose.connect(env.mongodbUrl)
			Mongoose.connection.on("open", resolve)
			Mongoose.connection.on("error", reject)
		})

		log.info("Connected to MongoDB")
	}

	public async start(): Promise<string> {
		const [ address ] = await Promise.all([
			this.initFastify(),
			this.initRedis(),
			this.initMongo(),
		])

		return address
	}
}

export default new App()