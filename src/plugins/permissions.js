const plugin = require("fastify-plugin")
const path = require("path")

const { BAD_REQUEST, FORBIDDEN } = require("../util/statusCodes")

const TokenType = require("../enum/TokenType")

const config = require(path.resolve(require.main.filename, "../config.json"))

function checkPermission(checkPermissionName, permissions) {
	const checkPermissionNameSplit = checkPermissionName.split("/")

	return permissions.some((permission) => {
		const [ _, permissionType, permissionName ] = /^(\w+):(.+)$/.exec(permission)

		switch (permissionType) {
			case "literal":
				const permissionNameSplit = permissionName.split("/")
				return permissionName === checkPermissionNameSplit.slice(0, permissionNameSplit.length).join("/")
			
			case "group":
				const group = config.permissionGroups[permissionName]
				return checkPermission(checkPermissionName, group)
		}
	})
}

async function PermissionsPlugin(fastify) {
	fastify.decorate("createPermissionValidator", (permissionName) => {
		return async (request) => {
			const { token, identity } = request

			if (identity) {
				if (checkPermission(permissionName, identity.permissions)) {
					return
				} else {
					throw {
						statusCode: FORBIDDEN,
						message: `User is not allowed to access route; missing permission ${permissionName}`
					}
				}
			} else {
				if (token.type === TokenType.SERVER) {
					return // Server is allowed to access anything
				} else {
					throw {
						statusCode: BAD_REQUEST,
						message: "Unknown non-server identity",
					}
				}
			}
		}
	})
}

module.exports = plugin(PermissionsPlugin, {
	name: "plugin-permissions",
})