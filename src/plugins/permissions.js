const plugin = require("fastify-plugin")
const path = require("path")

const { FORBIDDEN } = require("../util/statusCodes")

const TokenType = require("../enum/TokenType")

const config = require(path.resolve(require.main.filename, "../config.json"))

function checkPermission(permissions, checkPermissionName) {
	const checkPermissionNameSplit = checkPermissionName.split("/")

	return permissions.some((permission) => {
		const [ _, permissionType, permissionName ] = /^(\w+):(.+)$/.exec(permission)

		switch (permissionType) {
			case "literal":
				const permissionNameSplit = permissionName.split("/")
				return permissionName === checkPermissionNameSplit.slice(0, permissionNameSplit.length).join("/")
			
			case "group":
				const group = config.permissionGroups[permissionName]
				return checkPermission(group, checkPermissionName)
		}
	})
}

async function PermissionsPlugin(fastify) {
	fastify.decorateRequest("checkPermission", function(permissionName) {
		if (this.identity) {
			return checkPermission(this.identity.permissions, permissionName)
		}

		if (this.token.type === TokenType.SERVER) {
			return true
		}

		return false
	})

	fastify.addHook("preValidation", async (request) => {
		let permissions = request.context.config.permissions

		if (permissions) {
			if (typeof permissions === "string") {
				permissions = [ permissions ]
			}	

			for (let index = 0; index < permissions.length; index++) {
				const permissionName = permissions[index]

				if (!request.checkPermission(permissionName)) {
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