const plugin = require("fastify-plugin")
const path = require("path")

const { FORBIDDEN } = require("../util/statusCodes")

const TokenType = require("../enum/TokenType")

const checkPermissions = require("../util/checkPermissions")

async function PermissionsPlugin(fastify) {
	fastify.decorateRequest("checkPermissions", function(permissionName) {
		if (this.identity) {
			return checkPermissions(permissionName, this.identity.permissions)
		}

		if (this.token.type === TokenType.SERVER) {
			return true
		}

		return false
	})

	fastify.addHook("preValidation", async (request) => {
		let { auth, permissions } = request.context.config

		if (permissions) {
			if (!auth) {
				throw new Error("auth must be enabled before permissions can be defined")
			}

			if (typeof permissions === "string") {
				permissions = [ permissions ]
			}	

			for (let index = 0; index < permissions.length; index++) {
				const permissionName = permissions[index]

				if (!request.checkPermissions(permissionName)) {
					throw {
						statusCode: FORBIDDEN,
						message: `User is not allowed to access route; missing permission ${permissionName}`,
					}
				}
			}
		}
	})
}

module.exports = plugin(PermissionsPlugin, {
	name: "plugin-permissions",
})