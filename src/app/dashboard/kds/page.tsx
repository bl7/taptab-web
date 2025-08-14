"use client";

import React, { useState, useMemo, useEffect } from "react";
import { RefreshCw, AlertTriangle, UtensilsCrossed } from "lucide-react";
import { useOrders } from "@/lib/use-orders";
import { api, Table } from "@/lib/api";
import { Order } from "@/lib/orders-api";
import { filterVisibleOrders } from "@/lib/order-utils";
import { PageLoader } from "@/lib/utils";

interface KDSOrderCardProps {
  order: Order;
  tables: Table[];
  onStatusChange: (orderId: string, status: string) => void;
  onItemStatusChange: (orderId: string, itemId: string, status: string) => void;
}

function KDSOrderCard({
  order,
  tables,
  onStatusChange,
  onItemStatusChange,
}: KDSOrderCardProps) {
  const waitTime = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );

  const isUrgent = waitTime > 20;
  // Use a simple incrementing number instead of showing IDs
  const orderNumber = order.orderNumber || `Order`;

  // Get actual table name from table ID
  const getTableName = () => {
    const table = tables.find((t) => t.id === order.tableNumber);
    return table ? table.number : order.tableNumber;
  };

  // Calculate overall order progress based on individual items
  const orderProgress = useMemo(() => {
    const totalItems = order.items.length;
    const readyItems = order.items.filter(
      (item) => item.status === "ready" || item.status === "served"
    ).length;
    const preparingItems = order.items.filter(
      (item) => item.status === "preparing"
    ).length;

    if (readyItems === totalItems) return "ready";
    if (preparingItems > 0 || readyItems > 0) return "preparing";
    return "pending";
  }, [order.items]);

  // Determine card color based on wait time and progress
  const getCardColor = () => {
    if (order.status === "closed") return "bg-gray-50 border-gray-200";
    if (orderProgress === "ready") return "bg-green-50 border-green-200";
    if (isUrgent) return "bg-red-50 border-red-300";
    if (waitTime > 15) return "bg-yellow-50 border-yellow-300";
    return "bg-white border-gray-200";
  };

  const getOrderSourceIcon = () => {
    switch (order.orderSource) {
      case "QR_ORDERING":
        return "📱";
      case "WAITER":
        return "👩‍💼";
      case "CASHIER":
        return "🏪";
      default:
        return "📋";
    }
  };

  return (
    <div
      className={`${getCardColor()} rounded-lg border-2 p-3 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            #{orderNumber}
          </span>
          {isUrgent && (
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          )}
        </div>
        <div className="text-right text-sm text-gray-600">{waitTime} min</div>
      </div>

      {/* Table and Source Info */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-medium text-gray-700">
          Table {getTableName()}
        </span>
        <span className="flex items-center gap-1 text-gray-600">
          {getOrderSourceIcon()}
          {order.orderSource === "QR_ORDERING"
            ? "QR"
            : order.orderSource === "WAITER"
            ? order.waiterName || "Waiter"
            : order.orderSource === "CASHIER"
            ? "Cashier"
            : "Order"}
        </span>
      </div>

      {/* Compact Items List */}
      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div key={item.id || index} className="flex items-start gap-2">
            {/* Quantity and Status */}
            <div className="flex items-center gap-1 min-w-0">
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-gray-900 text-sm truncate">
                  {item.menuItemName}
                </span>
                {item.notes && (
                  <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded mt-1 border-l-2 border-red-400">
                    📝 {item.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex-shrink-0">
              {item.status === "pending" && (
                <button
                  onClick={() =>
                    onItemStatusChange(order.id, item.id, "preparing")
                  }
                  className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Start
                </button>
              )}

              {item.status === "preparing" && (
                <button
                  onClick={() => onItemStatusChange(order.id, item.id, "ready")}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Ready
                </button>
              )}

              {item.status === "ready" && (
                <button
                  onClick={() =>
                    onItemStatusChange(order.id, item.id, "served")
                  }
                  className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Done
                </button>
              )}

              {item.status === "served" && (
                <span className="text-xs text-gray-500 px-2 py-1">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Order Button - Only when all items ready */}
      {orderProgress === "ready" && order.status === "active" && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <button
            onClick={() => onStatusChange(order.id, "closed")}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            ✓ Complete Order
          </button>
        </div>
      )}
    </div>
  );
}

export default function KDSPage() {
  const { orders, loading, error, refreshOrders } = useOrders();
  const [filter, setFilter] = useState<"all" | "new" | "preparing" | "ready">(
    "all"
  );

  // State for tables
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        setTablesLoading(true);
        const response = await api.getTables();
        setTables(response.tables);
      } catch (error) {
        console.error("Failed to load tables:", error);
      } finally {
        setTablesLoading(false);
      }
    };

    loadTables();
  }, []);

  // Helper function to calculate order progress based on items
  const getOrderProgress = (order: Order) => {
    const totalItems = order.items.length;
    const readyItems = order.items.filter(
      (item) => item.status === "ready" || item.status === "served"
    ).length;
    const preparingItems = order.items.filter(
      (item) => item.status === "preparing"
    ).length;

    if (readyItems === totalItems) return "ready";
    if (preparingItems > 0 || readyItems > 0) return "preparing";
    return "new";
  };

  // Filter orders for kitchen display
  const kitchenOrders = useMemo(() => {
    // Only show active orders
    let filteredOrders = orders.filter((order) => {
      const isVisible = filterVisibleOrders([order]).length > 0;
      const isActive = order.status === "active";
      return isVisible && isActive;
    });

    // Apply status filter based on item progress
    if (filter !== "all") {
      filteredOrders = filteredOrders.filter((order) => {
        const progress = getOrderProgress(order);
        return progress === filter;
      });
    }

    // Sort by creation time (oldest first - FIFO for kitchen)
    return filteredOrders.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [orders, filter]);

  // Get counts for each status based on item progress
  const statusCounts = useMemo(() => {
    const activeOrders = orders.filter((order) => {
      const isVisible = filterVisibleOrders([order]).length > 0;
      return isVisible && order.status === "active";
    });

    const newOrders = activeOrders.filter(
      (order) => getOrderProgress(order) === "new"
    );
    const preparingOrders = activeOrders.filter(
      (order) => getOrderProgress(order) === "preparing"
    );
    const readyOrders = activeOrders.filter(
      (order) => getOrderProgress(order) === "ready"
    );

    return {
      all: activeOrders.length,
      new: newOrders.length,
      preparing: preparingOrders.length,
      ready: readyOrders.length,
    };
  }, [orders]);

  // Handle order status change
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(
        orderId,
        status as "active" | "closed" | "cancelled" | "merged"
      );
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      // TODO: Add user-friendly error notification
    }
  };

  // Handle individual item status change (placeholder for future API implementation)
  const handleItemStatusChange = async (
    orderId: string,
    itemId: string,
    status: string
  ) => {
    try {
      // Note: This would need a specific API endpoint for item status updates
      // For now, we'll simulate by logging and refreshing
      console.log(
        `Updating item ${itemId} in order ${orderId} to status ${status}`
      );

      // TODO: Implement actual API call when backend supports individual item status updates
      // await api.updateOrderItemStatus(orderId, itemId, status);

      await refreshOrders();
    } catch (error) {
      console.error("Failed to update item status:", error);
      // TODO: Add user-friendly error notification
    }
  };

  if (loading || tablesLoading) {
    return <PageLoader message="Loading kitchen orders..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-red-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshOrders}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-4 shadow-sm">
        <div className="flex items-center justify-end">
          <button
            onClick={refreshOrders}
            className="bg-gray-900 hover:bg-gray-800 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6">
        <div className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All Orders", count: statusCounts.all },
            { id: "new", label: "New", count: statusCounts.new },
            {
              id: "preparing",
              label: "Preparing",
              count: statusCounts.preparing,
            },
            { id: "ready", label: "Ready", count: statusCounts.ready },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`py-4 px-2 md:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 md:px-6 py-4 md:py-6">
        {kitchenOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center shadow-sm">
            <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UtensilsCrossed className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No active orders in the kitchen queue."
                : `No orders with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            {kitchenOrders.map((order) => (
              <KDSOrderCard
                key={order.id}
                order={order}
                tables={tables}
                onStatusChange={handleOrderStatusChange}
                onItemStatusChange={handleItemStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
