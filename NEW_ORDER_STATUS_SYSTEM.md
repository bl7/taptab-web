# New Order Status System Implementation

## Overview

The frontend has been updated to support the new order status system that separates order lifecycle from payment status. This provides better control over order visibility and payment tracking.

## Key Changes Made

### 1. Updated Type Definitions

**File: `src/lib/api.ts`**

- Updated `Order` interface to include new fields:
  - `status: "active" | "closed" | "cancelled"`
  - `paymentStatus: "pending" | "paid" | "failed" | "refunded"`
  - `paymentMethod?: "CASH" | "CARD" | "QR" | "STRIPE"`
  - `orderSource?: "QR_ORDERING" | "WAITER" | "CASHIER"`

**File: `src/lib/orders-api.ts`**

- Added new type definitions:
  - `OrderStatus = "active" | "closed" | "cancelled"`
  - `PaymentStatus = "pending" | "paid" | "failed" | "refunded"`
  - `PaymentMethod = "CASH" | "CARD" | "QR" | "STRIPE"`
  - `OrderSource = "QR_ORDERING" | "WAITER" | "CASHIER"`

### 2. New Order Utilities

**File: `src/lib/order-utils.ts`** (NEW)

- `isOrderVisibleOnTable(order)` - Checks if order should be visible on tables
- `getOrderStatusDisplay(order)` - Returns formatted status display
- `filterVisibleOrders(orders)` - Filters orders that should be visible
- `isQROrder(order)` - Checks if order is from QR ordering
- `isRegularOrder(order)` - Checks if order is from waiter/cashier
- `getOrderSourceDisplay(orderSource)` - Returns formatted source display
- `getPaymentMethodDisplay(paymentMethod)` - Returns formatted payment method display

### 3. Updated API Methods

**File: `src/lib/api.ts`**

- Updated `markOrderAsPaid()` to send new status fields
- Updated `updateOrderStatus()` to use new status values
- Removed "ONLINE" payment method, replaced with "STRIPE"

### 4. Updated Components

**File: `src/app/dashboard/orders/page.tsx`**

- Updated `getTableOrders()` to use new visibility logic
- Updated `handleOrderStatusChange()` to use new status values
- Added import for `filterVisibleOrders`

**File: `src/components/orders/OrderCard.tsx`**

- Added status display section showing:
  - Order source (QR Ordering, Waiter, Cashier)
  - Order status (🟢 Active, 🔴 Closed, ⚫ Cancelled)
  - Payment status (⏳ Pending, ✅ Paid, ❌ Failed, 🔄 Refunded)
  - Payment method (Cash, Card, QR Code, Online Payment)
- **QR Order UX Improvements**:
  - QR orders show "Close Table" button instead of "Mark as Paid"
  - QR orders don't show split bill or move table options
  - QR orders only show Print Receipt and Close Table buttons (Edit Order only for pending payment)
  - Payment status is prominently displayed on all order cards
  - Removed redundant QR ordering information display

**File: `src/components/orders/OrderDetailsModal.tsx`**

- Added comprehensive status display in order info grid
- Shows order status, payment status, and payment method
- **QR Order UX**: Shows Edit Order and Cancel Order only for pending payment, no actions for paid orders

**File: `src/components/orders/TableOrdersView.tsx`**

- Updated payment handling to work with new status system
- Removed manual status updates (backend handles automatically)
- Updated payment method from "ONLINE" to "STRIPE"
- Added `handleCloseOrder()` function for QR orders
- Added `onCloseOrder` prop to OrderCard components

**File: `src/components/orders/MergeBillsModal.tsx`**

- Added QR order filtering to exclude QR orders from merge bills
- Updated status display to use new status values
- QR orders are automatically filtered out from merge options

**File: `src/components/payment/OrderPaymentSection.tsx`**

- Updated payment success handler comments to reflect new behavior

## New Order Visibility Logic

### Orders Visible on Tables

Orders are visible when:

```javascript
status === 'active' && (
  orderSource === 'QR_ORDERING' ||
  (orderSource IN ['WAITER', 'CASHIER'] && paymentStatus === 'pending')
)
```

### Order Flow Examples

#### QR Orders (Public Ordering)

1. **Order Created** → `status: 'active'`, `paymentStatus: 'pending'`, `orderSource: 'QR_ORDERING'`

   - ✅ **Shows on table** (active + QR_ORDERING)
   - ✅ **WebSocket notification sent**

2. **Payment Successful** → `status: 'active'`, `paymentStatus: 'paid'`, `paymentMethod: 'STRIPE'`

   - ✅ **Still shows on table** (active + QR_ORDERING)
   - ❌ **No WebSocket notification** (status didn't change)

3. **Admin Manually Closes** → `status: 'closed'`
   - ❌ **No longer shows on table**

#### Regular Orders (Waiter/Cashier)

1. **Order Created** → `status: 'active'`, `paymentStatus: 'pending'`, `orderSource: 'WAITER'`

   - ✅ **Shows on table** (active + pending payment)

2. **Payment Taken** → `status: 'closed'`, `paymentStatus: 'paid'`, `paymentMethod: 'CASH'`
   - ❌ **No longer shows on table** (closed status)

## UI/UX Improvements for QR Orders

### QR Order Behavior

1. **Payment Already Taken**: QR orders have payment already processed, so no "Mark as Paid" button
2. **Close Table Button**: QR orders show a green "Close Table" button to manually close the order
3. **No Split/Merge**: QR orders don't appear in merge bills and can't be split
4. **Limited Actions**: Only Print Receipt and Close Table actions available (Edit Order and Cancel Order only for pending payment)
5. **Payment Status Display**: All order cards show payment status prominently with colored badges and fallback to "Unknown" if not available

### Regular Order Behavior

1. **Payment Required**: Regular orders show "Mark as Paid" button
2. **Split Available**: Regular orders can be split if they have multiple items
3. **Merge Available**: Regular orders appear in merge bills functionality
4. **Full Actions**: All actions available including move table, split order, etc.

## Testing Checklist

### Frontend Testing

- [ ] **QR Orders**

  - [ ] QR orders show on table immediately when created
  - [ ] QR orders stay on table after payment
  - [ ] QR orders only disappear when manually closed
  - [ ] QR orders show "Close Table" button instead of "Mark as Paid"

- [ ] QR orders don't show split bill options
- [ ] QR orders don't appear in merge bills
- [ ] QR orders only show Edit Order and Cancel Order for pending payment
- [ ] Payment status is prominently displayed with colored badges on all order cards
- [ ] No redundant QR ordering information displayed
- [ ] Cancel Order button not shown for paid orders

- [ ] **Regular Orders**

  - [ ] Regular orders show on table when created
  - [ ] Regular orders disappear from table after payment
  - [ ] Regular orders show correct payment method
  - [ ] Regular orders show "Mark as Paid" button
  - [ ] Regular orders can be split and merged

- [ ] **Status Display**

  - [ ] Order cards show correct status icons
  - [ ] Order details modal shows comprehensive status info
  - [ ] Payment method displays correctly

- [ ] **Payment Processing**

  - [ ] Payment modal works with new status system
  - [ ] Payment success updates order correctly
  - [ ] No manual status updates needed

### Backend Integration Testing

- [ ] **API Responses**

  - [ ] Orders API returns new status fields
  - [ ] Payment API updates both status and paymentStatus
  - [ ] Status updates work with new values

- [ ] **WebSocket Notifications**

  - [ ] New active orders trigger notifications
  - [ ] Payment status changes don't trigger notifications
  - [ ] Order closures don't trigger notifications

## Migration Notes

### For Developers

1. **Existing Orders**: All existing orders will need to be migrated to the new status system
2. **Status Values**: Old `'paid'` status becomes `'closed'` with `paymentStatus: 'paid'`
3. **Payment Methods**: `'ONLINE'` becomes `'STRIPE'`
4. **Order Sources**: Ensure all orders have proper `orderSource` values

### For Users

1. **QR Orders**: Will stay visible after payment until manually closed
2. **Regular Orders**: Will disappear from table view after payment
3. **Status Display**: More detailed status information available
4. **Payment Tracking**: Separate tracking of order lifecycle and payment status
5. **QR Order UX**: Different UI for QR orders since payment is already taken

## API Endpoints

### Updated Endpoints

- `PUT /orders/{id}/pay` - Now sends `paymentStatus` and `status` fields
- `PUT /orders/{id}/status` - Updated to accept new status values
- `GET /orders` - Returns orders with new status fields

### New Fields in Responses

```json
{
  "id": "order_id",
  "status": "active|closed|cancelled",
  "paymentStatus": "pending|paid|failed|refunded",
  "paymentMethod": "CASH|CARD|QR|STRIPE",
  "orderSource": "QR_ORDERING|WAITER|CASHIER"
  // ... other fields
}
```

## Troubleshooting

### Common Issues

1. **Orders not showing on tables**

   - Check if `status === 'active'`
   - Check if `orderSource` is set correctly
   - Check if `paymentStatus === 'pending'` for regular orders

2. **Payment not updating order**

   - Verify backend handles new status fields
   - Check WebSocket notifications for status changes

3. **Status display issues**

   - Ensure all new fields are present in API responses
   - Check order utility functions for correct logic

4. **QR order UI issues**

   - Verify `isQROrder()` function works correctly
   - Check that QR orders don't show payment buttons
   - Ensure QR orders are filtered from merge bills

### Debug Tools

- Use browser console to check order objects
- Verify WebSocket notifications
- Check API responses for new fields
- Use order utility functions for testing visibility logic
