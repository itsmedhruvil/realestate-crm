export const appRoles = ["Administrator", "Manager", "Sales Agent"] as const;

export type AppRole = (typeof appRoles)[number];

const roleAccess: Record<AppRole, string[]> = {
  Administrator: [
    "/dashboard",
    "/dashboard/properties",
    "/dashboard/leads",
    "/dashboard/clients",
    "/dashboard/team",
    "/dashboard/activities",
    "/dashboard/site-visits",
    "/dashboard/payments",
    "/dashboard/settings",
    "/dashboard/account",
  ],
  Manager: [
    "/dashboard",
    "/dashboard/properties",
    "/dashboard/leads",
    "/dashboard/clients",
    "/dashboard/team",
    "/dashboard/activities",
    "/dashboard/site-visits",
    "/dashboard/payments",
    "/dashboard/account",
  ],
  "Sales Agent": [
    "/dashboard",
    "/dashboard/properties",
    "/dashboard/leads",
    "/dashboard/clients",
    "/dashboard/activities",
    "/dashboard/site-visits",
    "/dashboard/account",
  ],
};

export function normalizeRole(role: unknown): AppRole {
  return appRoles.includes(role as AppRole) ? (role as AppRole) : "Sales Agent";
}

export function isAdminRole(role: unknown) {
  return normalizeRole(role) === "Administrator";
}

export function canAccessPath(role: unknown, pathname: string) {
  const normalizedRole = normalizeRole(role);

  return roleAccess[normalizedRole].some(
    (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(`${path}/`))
  );
}

export function navItemsForRole<T extends { href: string }>(role: unknown, items: T[]) {
  return items.filter((item) => canAccessPath(role, item.href));
}

export function canAccessApiPath(role: unknown, pathname: string) {
  const routeMap: Record<string, string> = {
    "/api/properties": "/dashboard/properties",
    "/api/leads": "/dashboard/leads",
    "/api/clients": "/dashboard/clients",
    "/api/team": "/dashboard/team",
    "/api/activities": "/dashboard/activities",
    "/api/visits": "/dashboard/site-visits",
    "/api/payments": "/dashboard/payments",
  };

  const dashboardPath = Object.entries(routeMap).find(
    ([apiPath]) => pathname === apiPath || pathname.startsWith(`${apiPath}/`)
  )?.[1];

  return dashboardPath ? canAccessPath(role, dashboardPath) : true;
}
