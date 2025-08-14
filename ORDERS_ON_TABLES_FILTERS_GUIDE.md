# 📋 Orders on Tables - Display & Filtering Guide

## 🎯 **How Orders Are Shown on Tables**

### **1. Order Visibility Rules**

Orders are displayed on tables based on the `filterVisibleOrders` function in `src/lib/order-utils.ts`:

```typescript
export function isOrderVisibleOnTable(order: Order): boolean {
  return (
    order.status?.toLowerCase() === "active" &&
    (order.orderSource === "QR_ORDERING" ||
      order.orderSource === "SPLIT" ||
      (["WAITER", "WAITER_ORDERING", "CASHIER", "CASHIER_ORDERING"].includes(
        order.orderSource || ""
      ) &&
        order.paymentStatus?.toLowerCase() === "pending"))
  );
}
```

### **2. Visibility Criteria**

**✅ Orders ARE shown when:**

- **Status**: `active` OR `merged` (not closed or cancelled)
- **AND** one of these conditions:
  - **QR Orders**: `orderSource === "QR_ORDERING"` (always visible when active/merged)
  - **Split Orders**: `orderSource === "SPLIT"` (always visible when active/merged)
  - **Waiter/Cashier Orders**: `orderSource` is `WAITER`, `WAITER_ORDERING`, `CASHIER`, or `CASHIER_ORDERING` **AND** `paymentStatus === "pending"`

**❌ Orders are NOT shown when:**

- Status is `closed` or `cancelled`
- Waiter/Cashier orders that are already `paid`
- Orders with invalid/unknown `orderSource`

### **3. Table Matching Logic**

Orders are matched to tables using this logic in `src/app/dashboard/orders/page.tsx`:

```typescript
const getTableOrders = useCallback(
  (tableId: string) => {
    return orders.filter((order) => {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return false;

      // Handle both QR orders and Waiter/Cashier orders
      const isQROrder = order.orderSource === "QR_ORDERING";

      let matches = false;
      if (isQROrder) {
        // QR orders: match order.tableNumber (tableId) with table.id
        matches = order.tableNumber === table.id;
      } else {
        // Waiter/Cashier orders: match order.tableNumber (tableId) with table.id
        matches = order.tableNumber === table.id;
      }

      // Check if order is visible
      const isVisible = filterVisibleOrders([order]).length > 0;

      return matches && isVisible;
    });
  },
  [orders, tables]
);
```

## 🔍 **Available Filters**

### **1. API-Level Filters**

The `getOrders` function in `src/lib/api.ts` supports these filters:

```typescript
async getOrders(params?: {
  status?: string;    // Filter by order status
  tableId?: string;   // Filter by specific table
}): Promise<{ orders: Order[] }>
```

**Usage:**

```typescript
// Get all orders
const allOrders = await api.getOrders();

// Get orders by status
const activeOrders = await api.getOrders({ status: "active" });

// Get orders for specific table
const tableOrders = await api.getOrders({ tableId: "table_123" });

// Get active orders for specific table
const activeTableOrders = await api.getOrders({
  status: "active",
  tableId: "table_123",
});
```

### **2. Frontend Filtering**

The frontend applies additional filtering:

**Order Source Filtering:**

- **QR Orders**: Always visible when active
- **Split Orders**: Always visible when active
- **Waiter/Cashier Orders**: Only visible when `paymentStatus === "pending"`

**Status Filtering:**

- Only `active` and `merged` orders are shown
- `closed` and `cancelled` orders are filtered out

**Table Matching:**

- Orders must match the table's `id` in `order.tableNumber`

## 📊 **Table Display Information**

### **1. Table Status Colors**

Tables are color-coded based on their status:

```typescript
const getTableStatusColor = (table: Table) => {
  const status = getTableStatus(table);
  const isUrgent = isTableUrgent(table.id);

  if (isUrgent) return "bg-red-500"; // 🔴 Urgent (wait time > 20min)
  if (status === "occupied") return "bg-orange-500"; // 🟠 Occupied
  if (status === "reserved") return "bg-purple-500"; // 🟣 Reserved
  return "bg-green-500"; // 🟢 Available
};
```

### **2. Table Information Displayed**

Each table shows:

- **Table Number**: The table identifier
- **Capacity**: Number of seats (e.g., "4p")
- **Order Count**: Number of active orders (badge)
- **Revenue**: Total revenue from orders (badge)
- **Wait Time**: Average wait time for orders
- **Urgent Indicator**: Pulsing border for orders > 20min

### **3. Table Status Logic**

```typescript
const getTableStatus = useCallback(
  (table: Table) => {
    const tableOrders = getTableOrders(table.id);
    if (tableOrders.length > 0) {
      return "occupied"; // Has active orders
    }
    return table.status; // Use table's default status
  },
  [getTableOrders]
);
```

## 🎛️ **Current Filtering Behavior**

### **What You See on Tables:**

1. **Active QR Orders**: ✅ Always visible
2. **Active Split Orders**: ✅ Always visible
3. **Active Waiter/Cashier Orders**: ✅ Only if `paymentStatus === "pending"`
4. **Merged QR Orders**: ✅ Always visible
5. **Merged Split Orders**: ✅ Always visible
6. **Merged Waiter/Cashier Orders**: ✅ Only if `paymentStatus === "pending"`
7. **Paid Waiter/Cashier Orders**: ❌ Not visible (filtered out)
8. **Closed Orders**: ❌ Not visible (filtered out)
9. **Cancelled Orders**: ❌ Not visible (filtered out)

### **Order Sources Handled:**

- `QR_ORDERING` - QR code orders
- `WAITER` - Waiter orders
- `WAITER_ORDERING` - Waiter orders (alternative)
- `CASHIER` - Cashier orders
- `CASHIER_ORDERING` - Cashier orders (alternative)
- `SPLIT` - Split orders

## 🔧 **Customization Options**

### **1. Modify Visibility Rules**

To change which orders are shown, edit `src/lib/order-utils.ts`:

```typescript
// Example: Show all active orders regardless of payment status
export function isOrderVisibleOnTable(order: Order): boolean {
  return order.status?.toLowerCase() === "active";
}

// Example: Show only QR and Split orders
export function isOrderVisibleOnTable(order: Order): boolean {
  return (
    order.status?.toLowerCase() === "active" &&
    (order.orderSource === "QR_ORDERING" || order.orderSource === "SPLIT")
  );
}
```

### **2. Add New Filters**

To add new filtering options, modify the `getOrders` function:

```typescript
async getOrders(params?: {
  status?: string;
  tableId?: string;
  orderSource?: string;     // New filter
  paymentStatus?: string;   // New filter
  limit?: number;          // New filter
  offset?: number;         // New filter
}): Promise<{ orders: Order[] }>
```

### **3. Frontend Filter UI**

Add filter controls to the orders page:

```typescript
// Add state for filters
const [statusFilter, setStatusFilter] = useState<string>("");
const [sourceFilter, setSourceFilter] = useState<string>("");

// Apply filters
const filteredOrders = orders.filter((order) => {
  if (statusFilter && order.status !== statusFilter) return false;
  if (sourceFilter && order.orderSource !== sourceFilter) return false;
  return true;
});
```

## 📝 **Summary**

**Current System:**

- Shows active and merged orders on tables
- QR and Split orders always visible when active/merged
- Waiter/Cashier orders only visible when payment is pending
- Tables show order count, revenue, and wait time
- Color-coded status indicators
- Real-time updates via refresh

**Key Filters:**

1. **Status**: Only `active` and `merged` orders (excludes `closed`, `cancelled`)
2. **Payment**: Waiter/Cashier orders must be `pending`
3. **Table Matching**: `order.tableNumber === table.id`
4. **Order Source**: All sources supported with different rules

The system is designed to show only relevant, actionable orders on tables while filtering out completed or cancelled orders.
