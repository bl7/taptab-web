/**
 * Role-based access control system for the TapTab application
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "MANAGER"
  | "KITCHEN"
  | "WAITER"
  | "CASHIER"
  | "READONLY";

export interface NavigationItem {
  id: string;
  href: string;
  title: string;
  icon: string;
  allowedRoles: UserRole[];
  description?: string;
}

/**
 * Define which roles can access which pages
 */
export const NAVIGATION_PERMISSIONS: NavigationItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    title: "Dashboard",
    icon: "Home",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Main dashboard overview",
  },
  {
    id: "analytics",
    href: "/dashboard/analytics",
    title: "Analytics",
    icon: "BarChart3",
    allowedRoles: [
      "SUPER_ADMIN",
      "TENANT_ADMIN",
      "MANAGER",
      "WAITER",
      "READONLY",
    ],
    description: "Business analytics and reports",
  },
  {
    id: "kds",
    href: "/dashboard/kds",
    title: "Chef's Screen",
    icon: "UtensilsCrossed",
    allowedRoles: [
      "SUPER_ADMIN",
      "TENANT_ADMIN",
      "MANAGER",
      "KITCHEN",
      "READONLY",
    ],
    description: "Kitchen display system",
  },
  {
    id: "orders",
    href: "/dashboard/orders",
    title: "Orders",
    icon: "ShoppingCart",
    allowedRoles: [
      "SUPER_ADMIN",
      "TENANT_ADMIN",
      "MANAGER",
      "WAITER",
      "READONLY",
    ],
    description: "View and manage orders",
  },
  {
    id: "order-taking",
    href: "/dashboard/order-taking",
    title: "Take Orders",
    icon: "Plus",
    allowedRoles: [
      "SUPER_ADMIN",
      "TENANT_ADMIN",
      "MANAGER",
      "WAITER",
      "READONLY",
    ],
    description: "Create new orders",
  },
  {
    id: "menu",
    href: "/dashboard/menu",
    title: "Menu",
    icon: "Menu",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Manage menu items and categories",
  },
  {
    id: "tables",
    href: "/dashboard/tables",
    title: "Tables",
    icon: "Table",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Manage tables and locations",
  },
  {
    id: "layout",
    href: "/dashboard/layout",
    title: "Layout",
    icon: "Layout",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Restaurant layout builder",
  },
  {
    id: "staff",
    href: "/dashboard/staff",
    title: "Staff",
    icon: "Users",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Manage staff members",
  },
  {
    id: "rota",
    href: "/dashboard/rota",
    title: "Rota",
    icon: "Calendar",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Staff scheduling",
  },
  {
    id: "promotions",
    href: "/dashboard/simple-promotions",
    title: "Promotions",
    icon: "Percent",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "Manage promotions and discounts",
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    title: "Settings",
    icon: "Settings",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "READONLY"],
    description: "System settings and configuration",
  },
];

/**
 * Check if a user role has permission to access a specific page
 */
export function hasPageAccess(
  userRole: UserRole | string,
  href: string
): boolean {
  const page = NAVIGATION_PERMISSIONS.find((item) => item.href === href);
  if (!page) return true; // Allow access to undefined pages (fallback)

  return page.allowedRoles.includes(userRole as UserRole);
}

/**
 * Get all navigation items that a user role can access
 */
export function getAccessibleNavigation(
  userRole: UserRole | string
): NavigationItem[] {
  return NAVIGATION_PERMISSIONS.filter((item) =>
    item.allowedRoles.includes(userRole as UserRole)
  );
}

/**
 * Role hierarchy for permission inheritance
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 1000,
  TENANT_ADMIN: 900,
  MANAGER: 800,
  KITCHEN: 300,
  WAITER: 200,
  CASHIER: 200,
  READONLY: 100,
};

/**
 * Get role display information
 */
export function getRoleInfo(role: UserRole) {
  const roleConfig = {
    SUPER_ADMIN: {
      name: "Super Admin",
      description: "Full system access",
      color: "bg-red-100 text-red-800",
      priority: ROLE_HIERARCHY["SUPER_ADMIN"],
    },
    TENANT_ADMIN: {
      name: "Restaurant Owner",
      description: "Full restaurant management",
      color: "bg-purple-100 text-purple-800",
      priority: ROLE_HIERARCHY["TENANT_ADMIN"],
    },
    MANAGER: {
      name: "Manager",
      description: "Operations management",
      color: "bg-blue-100 text-blue-800",
      priority: ROLE_HIERARCHY["MANAGER"],
    },
    KITCHEN: {
      name: "Kitchen Staff",
      description: "Kitchen operations only",
      color: "bg-orange-100 text-orange-800",
      priority: ROLE_HIERARCHY["KITCHEN"],
    },
    WAITER: {
      name: "Waiter",
      description: "Order taking and service",
      color: "bg-yellow-100 text-yellow-800",
      priority: ROLE_HIERARCHY["WAITER"],
    },
    CASHIER: {
      name: "Cashier",
      description: "Payment and order processing",
      color: "bg-green-100 text-green-800",
      priority: ROLE_HIERARCHY["CASHIER"],
    },
    READONLY: {
      name: "Read Only",
      description: "View access only",
      color: "bg-gray-100 text-gray-800",
      priority: ROLE_HIERARCHY["READONLY"],
    },
  };

  return roleConfig[role] || roleConfig["READONLY"];
}

/**
 * Check if user can perform administrative actions
 */
export function canManageStaff(userRole: UserRole | string): boolean {
  return ["SUPER_ADMIN", "TENANT_ADMIN"].includes(userRole as UserRole);
}

/**
 * Check if user can manage restaurant operations
 */
export function canManageOperations(userRole: UserRole | string): boolean {
  return ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER"].includes(
    userRole as UserRole
  );
}

/**
 * Check if user can view financial data
 */
export function canViewFinancials(userRole: UserRole | string): boolean {
  return ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER"].includes(
    userRole as UserRole
  );
}

/**
 * Get default redirect path for role
 */
export function getDefaultPageForRole(userRole: UserRole | string): string {
  switch (userRole) {
    case "KITCHEN":
      return "/dashboard/kds";
    case "WAITER":
      return "/dashboard/orders";
    case "SUPER_ADMIN":
    case "TENANT_ADMIN":
    case "MANAGER":
    case "READONLY":
    default:
      return "/dashboard";
  }
}
