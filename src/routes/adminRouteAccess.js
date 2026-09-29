export const ADMIN_ROUTE_ACCESS = {
  dashboard: ["admin", "superadmin", "user"],
  orders: ["admin", "superadmin", "user"],
  saleForm: ["admin", "superadmin", "user"],
  qrCode: ["admin", "superadmin", "user"],
  products: ["admin", "superadmin"],
  users: ["admin", "superadmin"],
  categories: ["admin", "superadmin"],
  promotions: ["admin", "superadmin"],
  deliveryProviders: ["admin", "superadmin"],
  settings: ["admin", "superadmin"],
};

export function normalizeRole(role) {
  return (role ?? "").toString().toLowerCase().trim();
}

export function canAccessAdminRoute(routeKey, role) {
  const allowedRoles = ADMIN_ROUTE_ACCESS[routeKey];

  if (!allowedRoles) return false;

  return allowedRoles.includes(normalizeRole(role));
}
