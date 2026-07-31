export type AppRole = "USER" | "ADMIN" | "SUPERADMIN";

export function isStaff(role?: string | null) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function isSuperAdmin(role?: string | null) {
  return role === "SUPERADMIN";
}
