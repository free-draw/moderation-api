import { FastifyInstance } from "fastify"
import plugin from "fastify-plugin"
import { ModeratorDocument } from "../model/Moderator"
import Token from "../types/Token"

declare module "fastify" {
	interface FastifyRequest {
		token: Token,
		identity?: ModeratorDocument,
	}
}

async function DecoratePlugin(fastify: FastifyInstance): Promise<void> {
	fastify.decorateRequest("token", null)
	fastify.decorateRequest("identity", null)
}

export default plugin(DecoratePlugin, {
	name: "plugin-decorate",
})