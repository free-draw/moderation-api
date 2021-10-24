import { FastifyRequest } from "fastify"
import { FastifyAuthFunction } from "fastify-auth"
import createError from "fastify-error"
import { StatusCodes } from "http-status-codes"
import { mapValues } from "lodash"
import { Minimatch } from "minimatch"
import TokenType from "../types/enum/TokenType"
import Permission, { PermissionLiteral } from "../types/Permission"
import config from "../util/option/config"

const parsedPermissionCache = {} as { [permission: Permission]: PermissionData }
const groups = mapValues(config.permissions, parsePermissions)

type PermissionData = {
	isInverted: boolean,
	isGroup: boolean,
	content: string,
}

function parsePermissions(permissions: Permission[]): PermissionData[] {
	return permissions.map((permission) => {
		const cache = parsedPermissionCache[permission]
		if (cache) return cache

		const match = /^(-?)(?:(\w+):)?(.+?)$/.exec(permission)
		if (!match) throw new Error("Invalid permission")

		const [ isInverted, type, content ] = match.slice(1)
		if (type && type.length > 0 && type !== "group") throw new Error("Invalid permission type")

		const data = {
			isInverted: isInverted.length > 0,
			isGroup: type === "group",
			content,
		}

		parsedPermissionCache[permission] = data

		return data
	})
}

function flattenPermissions(permissions: PermissionData[]): PermissionData[] {
	return permissions.flatMap((permission) => {
		return permission.isGroup ? flattenPermissions(groups[permission.content]) : permission
	})
}

function arePermissionsEqual(permissionA: PermissionData, permissionB: PermissionData): boolean {
	return permissionA.isInverted === permissionB.isInverted
		&& permissionA.isGroup === permissionB.isGroup
		&& permissionA.content === permissionB.content
}

function deduplicatePermissions(permissions: PermissionData[]): PermissionData[] {
	const newPermissions = [] as PermissionData[]

	for (const permission of permissions) {
		const isEqual = newPermissions.find(checkPermission => arePermissionsEqual(checkPermission, permission))
		if (!isEqual) newPermissions.push(permission)
	}

	return newPermissions
}

function checkPermissions(permissions: Permission[], requiredPermission: PermissionLiteral): boolean {
	let permissionDatas = parsePermissions(permissions)
	permissionDatas = flattenPermissions(permissionDatas)
	permissionDatas = deduplicatePermissions(permissionDatas)

	permissionDatas.sort((A, B) => {
		if (A.isInverted && !B.isInverted) {
			return -1
		} else if (!A.isInverted && B.isInverted) {
			return 1
		} else {
			return 0
		}
	})

	for (const permissionData of permissionDatas) {
		const minimatch = new Minimatch(permissionData.content + "/**")
		if (minimatch.match(requiredPermission)) {
			return !permissionData.isInverted
		}
	}

	return false
}

const PermissionsMissingError = createError(
	"PERMISSIONS_MISSING",
	"Missing required permissions",
	StatusCodes.UNAUTHORIZED
)

function authPermissions(requiredPermissions: PermissionLiteral[] | PermissionLiteral): FastifyAuthFunction {
	if (typeof requiredPermissions === "string") {
		requiredPermissions = [ requiredPermissions ]
	}

	return async function(request: FastifyRequest): Promise<void> {
		const identity = request.identity
		if (identity) {
			for (const requiredPermission of requiredPermissions) {
				if (!checkPermissions(identity.permissions, requiredPermission)) {
					throw new PermissionsMissingError()
				}
			}
		} else {
			// This should be checked by past auth functions
			if (request.token.type === TokenType.USER) throw new Error()
		}
	}
}

export default authPermissions