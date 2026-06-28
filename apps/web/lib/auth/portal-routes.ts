import { UserRole } from "@repo/types";

export const roleRoutePrefix: Record<string, string> = {
  [UserRole.CUSTOMER]: "/customer",
  [UserRole.DESIGNER]: "/designer",
  [UserRole.ADMIN]: "/admin",
};

export function dashboardPathForRole(role: string): string {
  const prefix = roleRoutePrefix[role] ?? roleRoutePrefix[UserRole.CUSTOMER];
  return `${prefix}/dashboard`;
}
