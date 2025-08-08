"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { api } from "@/lib/api";
import { Order, Table } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { isQROrder } from "@/lib/order-utils";
import { showToast } from "@/lib/utils";

interface MergeBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMergeComplete: () => void;
}

interface OrderGroup {
  id: string;
  name: string;
  orders: string[];
  totalAmount: number;
  customerName?: string;
}

interface TableSummary {
  totalOrders: number;
  totalAmount: number;
  canMerge: boolean;
  mergeRestrictions: string[];
}

export default function MergeBillsModal({
  isOpen,
  onClose,
  onMergeComplete,
}: MergeBillsModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [tableSummary, setTableSummary] = useState<TableSummary | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [targetOrder, setTargetOrder] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [mergeStrategy, setMergeStrategy] = useState<"append" | "create_new">(
    "append"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [merging, setMerging] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    canMerge: boolean;
    restrictions: string[];
    warnings: string[];
    preview: {
      mergedOrder: Order;
      totalAmount: number;
      itemCount: number;
    };
  } | null>(null);

  const loadAllOrders = useCallback(async () => {
    try {
      console.log("handle orderslist - Starting loadAllOrders function");

      // Try to get all orders from the existing orders state first
      const existingOrders = await api.getOrders();
      console.log(
        "handle orderslist - Existing orders from API:",
        existingOrders
      );

      if (existingOrders.orders && existingOrders.orders.length > 0) {
        console.log("handle orderslist - Using existing orders from API");
        const activeOrders = existingOrders.orders.filter(
          (order) => order.status === "active" && !isQROrder(order)
        );
        console.log(
          "handle orderslist - Active orders from existing API:",
          activeOrders
        );

        // Fetch tables to get actual table names/numbers
        console.log("handle orderslist - Fetching tables for mapping");
        const tablesResponse = await api.getTables();
        console.log("handle orderslist - Tables response:", tablesResponse);

        // Create a mapping of table IDs to actual table numbers
        const tableIdToNumber = new Map<string, string>();
        tablesResponse.tables.forEach((table) => {
          tableIdToNumber.set(table.id, `Table ${table.number}`);
        });
        console.log(
          "handle orderslist - Table ID to number mapping:",
          Object.fromEntries(tableIdToNumber)
        );

        // Store tables for table selection dropdown
        setAvailableTables(tablesResponse.tables);

        // Add table information to each order
        const ordersWithTableInfo = activeOrders.map((order) => {
          const tableId = order.tableId || order.id;
          const actualTableNumber =
            tableIdToNumber.get(tableId) || `Table ${tableId}`;

          console.log("handle orderslist - Mapping order:", {
            orderId: order.id,
            tableId: tableId,
            mappedTableNumber: actualTableNumber,
          });

          return {
            ...order,
            tableNumber: actualTableNumber,
            tableId: tableId,
          };
        });

        setOrders(ordersWithTableInfo);
        setOrderGroups([]); // No groups for now

        const totalOrders = ordersWithTableInfo.length;
        const totalAmount = ordersWithTableInfo.reduce(
          (sum, order) => sum + Number(order.totalAmount || order.total || 0),
          0
        );

        const canMerge = totalOrders >= 2;
        const mergeRestrictions =
          totalOrders < 2
            ? ["At least 2 active orders are required for merging"]
            : [];

        setTableSummary({
          totalOrders,
          totalAmount,
          canMerge,
          mergeRestrictions,
        });

        console.log(
          "handle orderslist - Final result using existing orders:",
          ordersWithTableInfo
        );
        return;
      }

      // Fallback: Load orders from each table
      console.log("handle orderslist - Falling back to table-by-table loading");
      const tablesResponse = await api.getTables();
      const allOrders: Order[] = [];
      const allOrderGroups: OrderGroup[] = [];

      // Store tables for table selection dropdown
      setAvailableTables(tablesResponse.tables);

      // Load orders from each table
      console.log(
        "handle orderslist - Starting to load orders from tables:",
        tablesResponse.tables.map((t) => ({ id: t.id, number: t.number }))
      );

      for (const table of tablesResponse.tables) {
        try {
          console.log(
            `handle orderslist - Loading orders for table ${table.id} (${table.number})`
          );
          const tableOrdersResponse = await api.getTableOrders(table.id);
          console.log(
            `handle orderslist - Table ${table.number} API response:`,
            tableOrdersResponse
          );
          console.log(
            `handle orderslist - Table ${table.number} orders:`,
            tableOrdersResponse.orders
          );
          console.log(
            `handle orderslist - Table ${table.number} order statuses:`,
            tableOrdersResponse.orders.map((o) => ({
              id: o.id,
              status: o.status,
              orderNumber: o.orderNumber,
            }))
          );

          // Only include active orders that can be merged (not paid or cancelled)
          const activeOrders = tableOrdersResponse.orders.filter(
            (order) => order.status === "active"
          );
          console.log(
            `handle orderslist - Table ${table.number} active orders:`,
            activeOrders
          );

          // Add table information to each order
          const ordersWithTableInfo = activeOrders.map((order) => ({
            ...order,
            tableNumber: `Table ${table.number}`,
            tableId: table.id,
          }));

          allOrders.push(...ordersWithTableInfo);
          allOrderGroups.push(...tableOrdersResponse.orderGroups);
        } catch (error) {
          console.error(
            `handle orderslist - Error loading orders for table ${table.id}:`,
            error
          );
        }
      }

      console.log("handle orderslist - All loaded orders:", allOrders);
      console.log(
        "handle orderslist - Order details:",
        allOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          itemsCount: order.items?.length || 0,
        }))
      );
      setOrders(allOrders);

      // Filter order groups to only include those with active orders
      const activeOrderIds = new Set(allOrders.map((order) => order.id));
      const filteredOrderGroups = allOrderGroups.filter((group) =>
        group.orders.some((orderId) => activeOrderIds.has(orderId))
      );
      setOrderGroups(filteredOrderGroups);

      // Calculate summary across all tables
      const totalOrders = allOrders.length;
      const totalAmount = allOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0
      );

      // Only allow merging if there are at least 2 active orders
      const canMerge = totalOrders >= 2;
      const mergeRestrictions =
        totalOrders < 2
          ? ["At least 2 active orders are required for merging"]
          : [];

      setTableSummary({
        totalOrders,
        totalAmount,
        canMerge,
        mergeRestrictions,
      });
    } catch (error) {
      console.error("Error loading all orders:", error);
      // Fallback: set empty arrays so the modal still works
      setOrders([]);
      setOrderGroups([]);
      setTableSummary({
        totalOrders: 0,
        totalAmount: 0,
        canMerge: false,
        mergeRestrictions: [],
      });
    }
  }, []);

  // Load all orders
  useEffect(() => {
    if (isOpen) {
      loadAllOrders();
    }
  }, [isOpen, loadAllOrders]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleValidateMerge = async () => {
    if (selectedOrders.length < 2) {
      showToast.warning("Please select at least 2 orders to merge");
      return;
    }

    try {
      console.log("🔍 handleValidateMerge - Selected orders:", selectedOrders);
      const result = await api.validateMerge({
        sourceOrderIds: selectedOrders,
      });
      console.log("✅ handleValidateMerge - Result:", result);
      setValidationResult(result);
    } catch (error) {
      console.error("❌ handleValidateMerge - Error:", error);
      showToast.error("Error validating merge. Please try again.");
    }
  };

  const handleMergeOrders = async () => {
    if (!validationResult?.canMerge) {
      showToast.error(
        "Cannot merge selected orders. Please check restrictions."
      );
      return;
    }

    // Validation for create_new strategy
    if (mergeStrategy === "create_new" && !selectedTableId) {
      showToast.warning("Please select a table for the new order.");
      return;
    }

    try {
      setMerging(true);
      const result = await api.mergeOrders({
        sourceOrderIds: selectedOrders,
        targetOrderId: targetOrder || undefined,
        mergeStrategy,
        tableId: mergeStrategy === "create_new" ? selectedTableId : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        specialInstructions: specialInstructions || undefined,
        createNewOrder: mergeStrategy === "create_new",
      });

      showToast.success(
        `Orders merged successfully! New total: $${Number(
          result.mergeSummary.totalAmount || 0
        ).toFixed(2)}`
      );
      onMergeComplete();
      onClose();
    } catch (error) {
      console.error("Error merging orders:", error);
      showToast.error("Error merging orders. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  const getSelectedOrdersTotal = () => {
    return orders
      .filter((order) => selectedOrders.includes(order.id))
      .reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0
      );
  };

  const getSelectedOrdersCount = () => {
    return orders
      .filter((order) => selectedOrders.includes(order.id))
      .reduce((sum, order) => sum + order.items.length, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-800" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Merge Bills</h2>
              <p className="text-sm text-gray-600">
                Merge orders from multiple tables
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Order Selection */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Orders to Merge
              </h3>

              {/* Table Summary */}
              {tableSummary && (
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tableSummary.totalOrders} active orders • $
                        {Number(tableSummary.totalAmount || 0).toFixed(2)} total
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Only active orders (not paid or cancelled) are shown for
                        merging
                      </p>
                      {tableSummary.mergeRestrictions.length > 0 && (
                        <p className="text-xs text-destructive mt-1">
                          Restrictions:{" "}
                          {tableSummary.mergeRestrictions.join(", ")}
                        </p>
                      )}
                    </div>
                    <DollarSign className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              )}

              {/* Order Groups */}
              {orderGroups.length > 0 ? (
                orderGroups.map((group) => (
                  <div key={group.id} className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {group.name || "Orders"}
                    </h4>
                    <div className="space-y-2">
                      {orders
                        .filter((order) => group.orders.includes(order.id))
                        .map((order) => (
                          <div
                            key={order.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedOrders.includes(order.id)
                                ? "border-gray-400 bg-muted"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleOrderSelect(order.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  Table {order.tableNumber} •{" "}
                                  {order.customerName || "No name"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.items.length} items • $
                                  {Number(
                                    order.totalAmount || order.total || 0
                                  ).toFixed(2)}{" "}
                                  •{" "}
                                  {order.orderNumber?.split("-")[0] || "Order"}
                                </p>
                                <div className="mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "closed"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedOrders.includes(order.id) && (
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                /* Direct Orders Display (when no groups) */
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedOrders.includes(order.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleOrderSelect(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Table {order.tableNumber} •{" "}
                            {order.customerName || "No name"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} items • $
                            {Number(
                              order.totalAmount || order.total || 0
                            ).toFixed(2)}{" "}
                            • {order.orderNumber?.split("-")[0] || "Order"}
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "closed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedOrders.includes(order.id) && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Merge Configuration */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Merge Configuration
              </h3>

              {/* Selected Orders Summary */}
              {selectedOrders.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {selectedOrders.length} orders selected
                      </p>
                      <p className="text-sm text-green-700">
                        {getSelectedOrdersCount()} items • $
                        {getSelectedOrdersTotal().toFixed(2)} total
                      </p>
                    </div>
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              )}

              {/* Merge Strategy */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merge Strategy
                </label>
                <select
                  value={mergeStrategy}
                  onChange={(e) => {
                    const strategy = e.target.value as "append" | "create_new";
                    setMergeStrategy(strategy);
                    // Reset target order and table selection when strategy changes
                    setTargetOrder(null);
                    setSelectedTableId("");
                  }}
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="append">Append to existing order</option>
                  <option value="create_new">Create new order</option>
                </select>
              </div>

              {/* Table Selection for Create New */}
              {mergeStrategy === "create_new" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Table for New Order
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                    required
                  >
                    <option value="">Choose a table...</option>
                    {availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} - {table.status} ({table.capacity}{" "}
                        seats)
                        {table.location ? ` • ${table.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Order Selection */}
              {mergeStrategy === "append" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Order (Optional)
                  </label>
                  <select
                    value={targetOrder || ""}
                    onChange={(e) => setTargetOrder(e.target.value || null)}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Auto-select</option>
                    {(() => {
                      // For append strategy, only show selected orders as targets
                      const targetOrders =
                        mergeStrategy === "append"
                          ? orders.filter((order) =>
                              selectedOrders.includes(order.id)
                            )
                          : orders;

                      console.log(
                        "handle orderslist - Target order filtering:",
                        {
                          mergeStrategy: mergeStrategy,
                          selectedOrders: selectedOrders,
                          targetOrdersCount: targetOrders.length,
                          allOrdersCount: orders.length,
                        }
                      );

                      return targetOrders.map((order) => {
                        console.log(
                          "handle orderslist - Target order option:",
                          {
                            id: order.id,
                            tableNumber: order.tableNumber,
                            tableId: order.tableId,
                            customerName: order.customerName,
                            isSelected: selectedOrders.includes(order.id),
                            mergeStrategy: mergeStrategy,
                          }
                        );
                        return (
                          <option key={order.id} value={order.id}>
                            Table {order.tableNumber} •{" "}
                            {order.customerName || "No name"} •{" "}
                            {order.items.length} items • $
                            {Number(
                              order.totalAmount || order.total || 0
                            ).toFixed(2)}
                            {selectedOrders.includes(order.id)
                              ? " (Selected)"
                              : ""}
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>
              )}

              {/* Customer Information */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Combined customer name"
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Primary phone number"
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Combined special instructions"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div
                  className={`rounded-lg p-4 mb-4 ${
                    validationResult.canMerge ? "bg-muted" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.canMerge ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <span
                      className={`font-medium ${
                        validationResult.canMerge
                          ? "text-gray-900"
                          : "text-gray-900"
                      }`}
                    >
                      {validationResult.canMerge ? "Can Merge" : "Cannot Merge"}
                    </span>
                  </div>

                  {validationResult.warnings.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-yellow-800">
                        Warnings:
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.restrictions.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-800">
                        Restrictions:
                      </p>
                      <ul className="text-sm text-gray-700 list-disc list-inside">
                        {validationResult.restrictions.map(
                          (restriction, index) => (
                            <li key={index}>{restriction}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {validationResult.canMerge && validationResult.preview && (
                    <div className="bg-white rounded p-3">
                      <p className="text-sm font-medium text-gray-900">
                        Preview: $
                        {Number(
                          validationResult.preview.totalAmount || 0
                        ).toFixed(2)}{" "}
                        • {validationResult.preview.itemCount} items
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleValidateMerge}
                  disabled={
                    selectedOrders.length < 2 || !tableSummary?.canMerge
                  }
                  className="flex-1"
                >
                  Validate Merge
                </Button>

                <Button
                  onClick={handleMergeOrders}
                  disabled={
                    !validationResult?.canMerge ||
                    merging ||
                    !tableSummary?.canMerge
                  }
                  className="flex-1"
                >
                  {merging ? "Merging..." : "Merge Orders"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
