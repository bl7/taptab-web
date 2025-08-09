"use client";

import React, { useState, useEffect } from "react";
import { X, Scissors, AlertCircle, Plus, Minus } from "lucide-react";
import { Order, Table, api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface OrderSplitModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSplitSuccess: (
    newOrder: Order,
    updatedSourceOrder: Order,
    splitDetails: Record<string, unknown>
  ) => void;
  tables: Table[];
}

interface SplitItem {
  itemId: string;
  quantity: number;
  item: Order["items"][0];
}

const PREDEFINED_REASONS = [
  "Customer wants separate bill",
  "Different payment methods",
  "Takeaway conversion",
  "Delivery conversion",
  "Group split request",
  "Table change",
  "Kitchen management",
  "Special occasion seating",
];

export default function OrderSplitModal({
  order,
  isOpen,
  onClose,
  onSplitSuccess,
  tables,
}: OrderSplitModalProps) {
  const [selectedItems, setSelectedItems] = useState<SplitItem[]>([]);
  const [newTableId, setNewTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [customSplitAmount, setCustomSplitAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen && order) {
      setSelectedItems([]);
      setNewTableId("");
      setCustomerName(order.customerName || "");
      setCustomerPhone(order.customerPhone || "");
      setSpecialInstructions("");
      setReason("");
      setCustomReason("");
      setCustomSplitAmount(0);
      setError("");
    }
  }, [isOpen, order]);

  // Filter available tables (exclude current table)
  const availableTables = tables.filter(
    (table) => table.id !== order?.tableId && table.id !== order?.tableNumber
  );

  const handleItemSelection = (item: Order["items"][0], quantity: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((si) => si.itemId === item.id);
      if (existing) {
        if (quantity === 0) {
          return prev.filter((si) => si.itemId !== item.id);
        }
        return prev.map((si) =>
          si.itemId === item.id ? { ...si, quantity } : si
        );
      } else if (quantity > 0) {
        return [...prev, { itemId: item.id, quantity, item }];
      }
      return prev;
    });
    setError("");
  };

  const calculateSplitTotal = () => {
    return selectedItems.reduce((total, selected) => {
      return (
        total +
        (selected.item.price || selected.item.total || 0) * selected.quantity
      );
    }, 0);
  };

  const calculateRemainingTotal = () => {
    const orderTotal = order?.totalAmount || order?.total || 0;
    return orderTotal - calculateSplitTotal();
  };

  const getSelectedQuantity = (itemId: string) => {
    return selectedItems.find((si) => si.itemId === itemId)?.quantity || 0;
  };

  const handleSplit = async () => {
    if (!order || selectedItems.length === 0) {
      setError("Please select items to split");
      return;
    }

    if (selectedItems.length === order.items.length) {
      // Check if we're splitting ALL quantities of ALL items
      const allItemsFullySplit = order.items.every((item) => {
        const selectedQty = getSelectedQuantity(item.id);
        return selectedQty === item.quantity;
      });

      if (allItemsFullySplit) {
        setError(
          "Cannot split all items. At least one item must remain in the original order."
        );
        return;
      }
    }

    const finalReason =
      customReason.trim() || reason || "Order split requested";

    setLoading(true);
    setError("");

    try {
      console.log("🔄 Starting split operation:", {
        orderId: order.id,
        selectedItems: selectedItems.map((si) => ({
          itemId: si.itemId,
          quantity: si.quantity,
          itemName: si.item.menuItemName,
        })),
        newTableId,
        reason: finalReason,
      });

      // Use the API client
      const result = await api.splitOrder(order.id, {
        itemsToSplit: selectedItems.map((si) => ({
          itemId: si.itemId,
          quantity: si.quantity,
        })),
        newTableId: newTableId || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        specialInstructions: specialInstructions || undefined,
        reason: finalReason,
      });
      console.log("✅ Split operation successful:", result);

      // Call success handler
      onSplitSuccess(
        result.data.newOrder,
        result.data.updatedSourceOrder,
        result.data.splitDetails
      );

      // Close modal
      onClose();
    } catch (error: unknown) {
      console.error("❌ Split operation failed:", error);
      setError(handleSplitError(error as Error & { code?: string }));
    } finally {
      setLoading(false);
    }
  };

  const handleSplitError = (error: Error & { code?: string }): string => {
    const errorMessages: Record<string, string> = {
      VALIDATION_ERROR: "Please select valid items to split",
      ITEM_NOT_FOUND: "One or more selected items are no longer available",
      INSUFFICIENT_QUANTITY:
        "Cannot split more items than available in the order",
      INVALID_ORDER_STATUS:
        "This order cannot be split (must be active or pending)",
      TABLE_NOT_FOUND: "Selected table is not available",
      NOT_FOUND: "Order not found",
    };

    const errorCode = error?.code || "";
    return (
      errorMessages[errorCode] || error?.message || "Failed to split order"
    );
  };

  // Split by custom amount
  const splitByCustomAmount = () => {
    if (!order || customSplitAmount <= 0) return;

    const targetAmount = customSplitAmount;
    console.log(`💰 Custom Split: Splitting off $${targetAmount.toFixed(2)}`);

    const splitItems = calculateOptimalSplit(targetAmount);
    setSelectedItems(splitItems);
    setReason(`Split off $${targetAmount.toFixed(2)}`);
  };

  const calculateOptimalSplit = (
    targetAmount: number,
    items = order?.items || []
  ) => {
    const splitItems: SplitItem[] = [];
    let currentTotal = 0;

    for (const item of items) {
      const itemPrice = item.price || item.total || 0;

      if (currentTotal + itemPrice <= targetAmount) {
        splitItems.push({
          itemId: item.id,
          quantity: item.quantity,
          item,
        });
        currentTotal += itemPrice;
      } else {
        const unitPrice = itemPrice / item.quantity;
        const remainingAmount = targetAmount - currentTotal;
        const exactQuantity = Math.round(remainingAmount / unitPrice);

        if (exactQuantity > 0 && exactQuantity <= item.quantity) {
          splitItems.push({
            itemId: item.id,
            quantity: exactQuantity,
            item,
          });
          currentTotal += unitPrice * exactQuantity;
        }
        break;
      }
    }

    return splitItems;
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-900">Split Order</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Source Order Information */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Source Order Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Order ID:</span>{" "}
                  <span className="font-mono">
                    {order.orderNumber || order.id}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Current Table:</span> Table{" "}
                  {order.tableNumber}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> $
                  {Number(order.totalAmount || order.total || 0).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {order.customerName || "Walk-in Customer"}
                </div>
              </div>
            </div>

            {/* Debug Info */}
            {selectedItems.length > 0 && (
              <div className="bg-muted border border-gray-300 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Current Selection Debug
                </h4>
                <div className="text-xs text-gray-700 space-y-1">
                  <div>
                    Total Order: $
                    {(order.totalAmount || order.total || 0).toFixed(2)}
                  </div>
                  <div>Selected Total: ${calculateSplitTotal().toFixed(2)}</div>
                  <div>Selected Items: {selectedItems.length}</div>
                  <div className="max-h-20 overflow-y-auto">
                    {selectedItems.map((si) => (
                      <div key={si.itemId}>
                        • {si.quantity}x {si.item.menuItemName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Split Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Split Bill Options
              </h4>

              {/* Custom Amount Split */}
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Split by Custom Amount
                </h5>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600">Split off $</span>
                  <input
                    type="number"
                    min="0.01"
                    max={order.totalAmount || order.total || 0}
                    step="0.01"
                    value={customSplitAmount}
                    onChange={(e) =>
                      setCustomSplitAmount(parseFloat(e.target.value) || 0)
                    }
                    className="w-20 p-1 border border-input rounded text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="0.00"
                  />
                  <Button
                    variant="secondary"
                    onClick={splitByCustomAmount}
                    disabled={
                      customSplitAmount <= 0 ||
                      customSplitAmount >=
                        (order.totalAmount || order.total || 0)
                    }
                    className="px-3 py-1 text-sm"
                  >
                    Split Amount
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Remaining: $
                  {(
                    (order.totalAmount || order.total || 0) - customSplitAmount
                  ).toFixed(2)}
                </div>
              </div>

              {/* Manual Item Selection */}
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Itemized Split (Manual Selection)
                </h5>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-1 text-sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Item Selection */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Select Items to Split
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg">
                {order.items.map((item) => {
                  const selectedQty = getSelectedQuantity(item.id);
                  const itemPrice = item.price || item.total || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.menuItemName}
                          {selectedQty > 0 && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {selectedQty} selected
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${itemPrice.toFixed(2)} each • Available:{" "}
                          {item.quantity}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 italic mt-1">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() =>
                              handleItemSelection(
                                item,
                                Math.max(0, selectedQty - 1)
                              )
                            }
                            disabled={selectedQty === 0}
                            className="w-8 h-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={selectedQty}
                            onChange={(e) =>
                              handleItemSelection(
                                item,
                                Math.min(
                                  item.quantity,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                )
                              )
                            }
                            className="w-16 text-center border border-input rounded px-2 py-1 focus:ring-2 focus:ring-ring focus:border-transparent"
                          />

                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() =>
                              handleItemSelection(
                                item,
                                Math.min(item.quantity, selectedQty + 1)
                              )
                            }
                            disabled={selectedQty >= item.quantity}
                            className="w-8 h-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Split Total for this item */}
                        <div className="text-right min-w-[80px]">
                          <div className="font-medium text-gray-900">
                            ${(selectedQty * itemPrice).toFixed(2)}
                          </div>
                          {selectedQty > 0 && (
                            <div className="text-xs text-gray-600">
                              {selectedQty} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Split Summary */}
              {selectedItems.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-900">
                        Items to Split:
                      </span>
                      <div className="text-green-700">
                        {selectedItems.length} items
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-900">
                        Split Total:
                      </span>
                      <div className="text-green-700">
                        ${calculateSplitTotal().toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-900">
                        Remaining Total:
                      </span>
                      <div className="text-green-700">
                        ${calculateRemainingTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* New Order Configuration */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">
                New Order Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table (Optional)
                  </label>
                  <select
                    value={newTableId}
                    onChange={(e) => setNewTableId(e.target.value)}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Same table as source order</option>
                    {availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity} seats)
                        {table.location ? ` • ${table.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={order.customerName || "Enter customer name"}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={order.customerPhone || "Enter phone number"}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Split
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (e.target.value) setCustomReason("");
                    }}
                    className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Select a reason...</option>
                    {PREDEFINED_REASONS.map((reasonOption) => (
                      <option key={reasonOption} value={reasonOption}>
                        {reasonOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special instructions for the new order"
                  rows={3}
                  className="w-full p-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Custom Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Reason
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    if (e.target.value.trim()) setReason("");
                  }}
                  placeholder="Or enter custom reason..."
                  maxLength={200}
                  className="w-full p-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {customReason.length}/200 characters
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-muted border border-gray-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-gray-700">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 ? (
              <span>
                Splitting {selectedItems.length} items • Total: $
                {calculateSplitTotal().toFixed(2)}
              </span>
            ) : (
              <span>Select items to split from the order above</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSplit}
              disabled={selectedItems.length === 0 || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Splitting Order...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Split Order (${calculateSplitTotal().toFixed(2)})
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
