export type UserRole = 'TENANT_ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'READONLY';

/**
 * Check if a user should receive print notifications based on their role
 * @param role - The user's role
 * @returns boolean - True if user should receive print notifications
 */
export function shouldReceivePrintNotifications(role: UserRole | string): boolean {
  return role === 'TENANT_ADMIN' || role === 'KITCHEN';
}

/**
 * Get a human-readable description of print notification permissions
 * @param role - The user's role
 * @returns string - Description of print permissions
 */
export function getPrintPermissionDescription(role: UserRole | string): string {
  if (shouldReceivePrintNotifications(role)) {
    return 'Receives real-time print notifications';
  }
  return 'No print notifications (view-only access)';
}

/**
 * Get role-based access control information
 * @returns object - Role permissions for print notifications
 */
export function getRolePermissions() {
  return {
    TENANT_ADMIN: {
      canReceivePrints: true,
      description: 'Restaurant owner/admin - receives print notifications'
    },
    KITCHEN: {
      canReceivePrints: true,
      description: 'Kitchen staff - receives print notifications'
    },
    MANAGER: {
      canReceivePrints: false,
      description: 'Manager - no print notifications'
    },
    CASHIER: {
      canReceivePrints: false,
      description: 'Cashier - no print notifications'
    },
    WAITER: {
      canReceivePrints: false,
      description: 'Waiter - no print notifications'
    },
    READONLY: {
      canReceivePrints: false,
      description: 'Read-only user - no print notifications'
    },
    SUPER_ADMIN: {
      canReceivePrints: false,
      description: 'System admin - no print notifications'
    }
  };
} 