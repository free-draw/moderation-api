const minimatch = require("minimatch")
const lodash = require("lodash")
const path = require("path")

const PERMISSION_STRING_REGEX = /^(-?)(?:(\w+):)?(.+?)$/

const config = require(path.resolve(require.main.filename, "../config.json"))
const permissionGroups = lodash.mapValues(config.permissionGroups, parsePermissionStrings)

function parsePermissionString(permissionString) {
	const [ _, inverse, type, content ] = PERMISSION_STRING_REGEX.exec(permissionString)

	return {
		inverse: inverse.length > 0,
		group: type === "group",
		content: content,
	}
}

function parsePermissionStrings(permissionStrings) {
	return permissionStrings.map(parsePermissionString)
}

function flattenPermissions(permissions) {
	return permissions.flatMap((permission) => {
		if (permission.group) {
			return flattenPermissions(permissionGroups[permission.content])
		} else {
			return permission
		}
	})
}

function deduplicatePermissions(permissions) {
	const newPermissions = []

	for (let index = 0; index < permissions.length; index++) {
		const permission = permissions[index]

		const existingPermission = newPermissions.find((findPermission) => {
			return findPermission.content === permission.content
		})
		
		if (!existingPermission) {
			newPermissions.push(permission)
		}
	}

	return newPermissions
}

function checkPermissions(matchPermission, permissionStrings) {
	let permissions = parsePermissionStrings(permissionStrings)
	permissions = flattenPermissions(permissions)
	permissions = deduplicatePermissions(permissions)

	permissions.sort((A, B) => {
		if (A.inverse === B.inverse) {
			return 0
		} else if (A.inverse) {
			return -1
		} else if (B.inverse) {
			return 1
		}
	})

	for (let index = 0; index < permissions.length; index++) {
		const permission = permissions[index]

		if (minimatch(matchPermission, permission.content)) {
			return !permission.inverse
		}
	}

	return false
}

module.exports = checkPermissions