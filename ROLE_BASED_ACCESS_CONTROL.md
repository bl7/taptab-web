# 🔐 Role-Based Access Control System

## 📋 Overview

Implemented comprehensive role-based access control (RBAC) for the TapTab dashboard to ensure users only see and access the features appropriate for their role.

## 🎯 Current Roles & Permissions

### **👑 SUPER_ADMIN**

- **Access**: Full system access
- **Pages**: All pages available
- **Description**: System-wide administrator
- **Default Page**: `/dashboard`

### **🏢 TENANT_ADMIN (Restaurant Owner)**

- **Access**: Full restaurant management
- **Pages**: Dashboard, Analytics, Orders, Take Orders, Menu, Tables, Layout, Staff, Rota, Promotions, Settings
- **Description**: Restaurant owner/manager with full control
- **Default Page**: `/dashboard`

### **👨‍💼 MANAGER**

- **Access**: Operations management
- **Pages**: Dashboard, Analytics, KDS, Orders, Take Orders, Menu, Tables, Layout, Promotions
- **Restrictions**: Cannot manage staff, rota, or settings
- **Default Page**: `/dashboard`

### **👨‍🍳 KITCHEN**

- **Access**: Kitchen operations only
- **Pages**: Dashboard, **KDS (Chef's Screen)**
- **Restrictions**: Limited to kitchen-relevant features
- **Default Page**: `/dashboard/kds` ✨

### **👩‍💼 WAITER**

- **Access**: Order taking and service
- **Pages**: Dashboard, **Orders**, **Take Orders**
- **Restrictions**: Cannot access management features
- **Default Page**: `/dashboard/orders` ✨

### **🏪 CASHIER**

- **Access**: Payment and order processing
- **Pages**: Dashboard, **Orders**, **Take Orders**
- **Restrictions**: Same as waiter - front-of-house operations
- **Default Page**: `/dashboard/orders` ✨

### **👀 READONLY**

- **Access**: View access only
- **Pages**: Dashboard only
- **Restrictions**: Cannot modify anything
- **Default Page**: `/dashboard`

## 🔧 Implementation Features

### **Automatic Navigation Filtering**

- Navigation menu shows only accessible pages
- Desktop and mobile navigation both filtered
- Clean, role-appropriate interface

### **Page Access Control**

- Automatic redirect if user tries to access unauthorized page
- Users redirected to their default page for their role
- Console logging for access attempts

### **Smart Defaults**

- **Kitchen staff** → Redirected to KDS (Chef's Screen)
- **Waiters/Cashiers** → Redirected to Orders page
- **Admins/Managers** → Dashboard overview

### **Role Hierarchy**

```
SUPER_ADMIN (1000)     - System control
TENANT_ADMIN (900)     - Restaurant control
MANAGER (800)          - Operations control
KITCHEN (300)          - Kitchen operations
WAITER (200)           - Service operations
CASHIER (200)          - Payment operations
READONLY (100)         - View only
```

## 📱 User Experience

### **For Kitchen Staff:**

- Logs in → Automatically goes to Chef's Screen (KDS)
- Navigation shows: Dashboard, Chef's Screen
- Cannot access management features

### **For Waiters/Cashiers:**

- Logs in → Automatically goes to Orders page
- Navigation shows: Dashboard, Orders, Take Orders
- Perfect for front-of-house operations

### **For Managers:**

- Full operational control without staff management
- Cannot hire/fire but can manage day-to-day operations

### **For Restaurant Owners:**

- Complete access to all restaurant features
- Staff management, scheduling, analytics, settings

## 🛡️ Security Features

### **Client-Side Protection:**

- Navigation filtering prevents UI access
- Automatic redirects for unauthorized pages
- Role validation on every route change

### **Server-Side Integration:**

- Works with existing API role checks
- Consistent with backend permissions
- Middleware-compatible design

## 📂 Technical Implementation

### **Key Files:**

- `/lib/role-permissions.ts` - Permission definitions
- `/app/dashboard/layout.tsx` - Navigation filtering
- Integrated with existing authentication system

### **Functions Available:**

```typescript
hasPageAccess(userRole, href); // Check page access
getAccessibleNavigation(userRole); // Get allowed nav items
getDefaultPageForRole(userRole); // Get default redirect
canManageStaff(userRole); // Admin permission check
canViewFinancials(userRole); // Financial data access
```

### **Navigation Structure:**

```typescript
const NAVIGATION_PERMISSIONS = [
  {
    id: "kds",
    href: "/dashboard/kds",
    title: "Chef's Screen",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "MANAGER", "KITCHEN"],
  },
  // ... more pages
];
```

## 🎨 Benefits

### **For Users:**

- **Simplified Interface**: Only see relevant features
- **Faster Navigation**: No clutter from inaccessible pages
- **Role-Appropriate Defaults**: Land on the right page immediately

### **For Restaurant Owners:**

- **Security**: Staff can't access sensitive features
- **Efficiency**: Staff focus on their core responsibilities
- **Control**: Fine-grained permission management

### **For Developers:**

- **Maintainable**: Centralized permission logic
- **Scalable**: Easy to add new roles or pages
- **Consistent**: Same permission system everywhere

## 🚀 Current Status

✅ **Navigation filtering** - Complete
✅ **Page access control** - Complete  
✅ **Role-based redirects** - Complete
✅ **Default page routing** - Complete
✅ **Mobile navigation** - Complete
✅ **Desktop navigation** - Complete

## 🔄 Usage Examples

### **Kitchen Staff Login:**

1. User logs in with KITCHEN role
2. Automatically redirected to `/dashboard/kds`
3. Navigation shows only: Dashboard, Chef's Screen
4. Trying to access `/dashboard/menu` → Redirected to `/dashboard/kds`

### **Waiter Login:**

1. User logs in with WAITER role
2. Automatically redirected to `/dashboard/orders`
3. Navigation shows: Dashboard, Orders, Take Orders
4. Perfect for taking and managing orders

### **Manager Login:**

1. User logs in with MANAGER role
2. Stays on `/dashboard`
3. Navigation shows all operational features except staff management
4. Can manage daily operations without administrative access

---

**Result**: A secure, role-appropriate dashboard experience that ensures each user type has access to exactly the features they need! 🔐✨
