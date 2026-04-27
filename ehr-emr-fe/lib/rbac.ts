export const DASHBOARD_PERMISSIONS = [
  "patient.read",
  "encounter.read",
  "diagnosis.read",
  "medication.read",
  "analytics.read",
]

export const PATH_PERMISSIONS: Array<{ matcher: RegExp; requiredAny: string[] }> = [
  { matcher: /^\/dashboard$/, requiredAny: DASHBOARD_PERMISSIONS },
  { matcher: /^\/patients$/, requiredAny: ["patient.list", "patient.read"] },
  { matcher: /^\/patients\/[^/]+$/, requiredAny: ["patient.read"] },
  { matcher: /^\/encounters$/, requiredAny: ["encounter.read"] },
  { matcher: /^\/diagnoses$/, requiredAny: ["diagnosis.read"] },
  { matcher: /^\/medications$/, requiredAny: ["medication.read"] },
  { matcher: /^\/analytics$/, requiredAny: ["analytics.read"] },
  { matcher: /^\/admin\/import$/, requiredAny: ["staff.manage"] },
  { matcher: /^\/admin\/audit$/, requiredAny: ["audit.read"] },
]

export function hasAnyPermission(userPermissions: string[], requiredAny: string[]) {
  return requiredAny.some((permission) => userPermissions.includes(permission))
}

export function requiredPermissionsForPath(pathname: string) {
  return PATH_PERMISSIONS.find((item) => item.matcher.test(pathname))?.requiredAny
}

export function defaultLandingPath(userPermissions: string[]) {
  if (hasAnyPermission(userPermissions, DASHBOARD_PERMISSIONS)) return "/dashboard"
  if (hasAnyPermission(userPermissions, ["patient.list", "patient.read"])) return "/patients"
  return "/login"
}
