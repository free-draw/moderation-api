type PermissionLiteral = string
type PermissionGroup = `group:${string}`

type Permission = PermissionLiteral | PermissionGroup

export default Permission
export { PermissionLiteral, PermissionGroup }