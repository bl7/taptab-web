import { Order } from "./api";

// New order status system utilities
export type OrderStatus = "active" | "closed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "CASH" | "CARD" | "QR" | "STRIPE";
export type OrderSource = "QR_ORDERING" | "WAITER" | "CASHIER";

/**
 * Check if an order should be visible on tables based on the new status system
 * Orders are visible when:
 * - status === 'active' AND
 * - (orderSource === 'QR_ORDERING' OR (orderSource IN ['WAITER', 'CASHIER'] AND paymentStatus === 'pending'))
 */
export function isOrderVisibleOnTable(order: Order): boolean {
  return (
    order.status?.toLowerCase() === "active" &&
    (order.orderSource === "QR_ORDERING" ||
      (["WAITER", "WAITER_ORDERING", "CASHIER", "CASHIER_ORDERING"].includes(
        order.orderSource || ""
      ) &&
        order.paymentStatus?.toLowerCase() === "pending"))
  );
}

/**
 * Get order status display information
 */
export function getOrderStatusDisplay(order: Order) {
  const statusMap = {
    active: "🟢 Active",
    closed: "🔴 Closed",
    cancelled: "⚫ Cancelled",
  };

  const paymentStatusMap = {
    pending: "⏳ Pending",
    paid: "✅ Paid",
    failed: "❌ Failed",
    refunded: "🔄 Refunded",
  };

  const normalizedStatus =
    order.status?.toLowerCase() as keyof typeof statusMap;
  const normalizedPaymentStatus =
    order.paymentStatus?.toLowerCase() as keyof typeof paymentStatusMap;

  return {
    orderStatus: statusMap[normalizedStatus] || order.status,
    paymentStatus:
      paymentStatusMap[normalizedPaymentStatus] || order.paymentStatus,
    paymentMethod: order.paymentMethod || "Not set",
  };
}

/**
 * Filter orders that should be visible on tables
 */
export function filterVisibleOrders(orders: Order[]): Order[] {
  return orders.filter(isOrderVisibleOnTable);
}

/**
 * Check if an order is a QR order (always visible when active)
 */
export function isQROrder(order: Order): boolean {
  return order.orderSource === "QR_ORDERING";
}

/**
 * Check if an order is a regular order (waiter/cashier)
 */
export function isRegularOrder(order: Order): boolean {
  return ["WAITER", "WAITER_ORDERING", "CASHIER", "CASHIER_ORDERING"].includes(
    order.orderSource || ""
  );
}

/**
 * Get order source display name
 */
export function getOrderSourceDisplay(orderSource?: string): string {
  const sourceMap = {
    QR_ORDERING: "QR Ordering",
    WAITER: "Waiter",
    WAITER_ORDERING: "Waiter",
    CASHIER: "Cashier",
    CASHIER_ORDERING: "Cashier",
  };

  return (
    sourceMap[orderSource as keyof typeof sourceMap] || orderSource || "Unknown"
  );
}

/**
 * Check if payment should close the order
 * QR orders stay open after payment, regular orders close
 */
export function shouldCloseOrderAfterPayment(order: Order): boolean {
  return isRegularOrder(order);
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplay(paymentMethod?: string): string {
  const methodMap = {
    CASH: "Cash",
    CARD: "Card",
    QR: "QR Code",
    STRIPE: "Online Payment",
  };

  return (
    methodMap[paymentMethod as keyof typeof methodMap] ||
    paymentMethod ||
    "Not set"
  );
}
