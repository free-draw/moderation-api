import { FastifyInstance } from "fastify"
import plugin from "fastify-plugin"

import { ActionSchema } from "../types/schema/Action"
import { ModeratorAccountSchema } from "../types/schema/ModeratorAccount"

import { LogSchema } from "../types/schema/Log"
import { ModeratorSchema } from "../types/schema/Moderator"
import { ReportSchema } from "../types/schema/Report"
import { SnapshotSchema } from "../types/schema/Snapshot"
import { UserSchema } from "../types/schema/User"

async function SchemaPlugin(fastify: FastifyInstance): Promise<void> {
	fastify.addSchema(ActionSchema)
	fastify.addSchema(ModeratorAccountSchema)

	fastify.addSchema(LogSchema)
	fastify.addSchema(ModeratorSchema)
	fastify.addSchema(ReportSchema)
	fastify.addSchema(SnapshotSchema)
	fastify.addSchema(UserSchema)
}

export default plugin(SchemaPlugin, {
	name: "plugin-schema",
})