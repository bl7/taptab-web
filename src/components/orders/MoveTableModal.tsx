"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";
import { Order, Table, api } from "@/lib/api";
import { ButtonLoader } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MoveTableModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveSuccess: (
    updatedOrder: Order,
    moveDetails: Record<string, unknown>
  ) => void;
  tables: Table[];
}

const PREDEFINED_REASONS = [
  "Customer requested",
  "Better seating area",
  "Larger table needed",
  "Quieter area requested",
  "Table maintenance",
  "Wrong table assigned",
  "Group size changed",
  "Special occasion seating",
];

export default function MoveTableModal({
  order,
  isOpen,
  onClose,
  onMoveSuccess,
  tables,
}: MoveTableModalProps) {
  const [selectedTableId, setSelectedTableId] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedTableId("");
      setReason("");
      setCustomReason("");
      setError("");
    }
  }, [isOpen]);

  // Filter out current table and get available tables
  const availableTables = tables.filter(
    (table) => table.id !== order?.tableId && table.id !== order?.tableNumber
  );

  const handleMove = async () => {
    if (!order || !selectedTableId) {
      setError("Please select a table");
      return;
    }

    const finalReason =
      customReason.trim() || reason || "Table change requested";

    if (!finalReason) {
      setError("Please provide a reason for the move");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔄 Starting move operation:", {
        orderId: order.id,
        fromTable: order.tableNumber,
        toTableId: selectedTableId,
        reason: finalReason,
      });

      const result = await api.moveOrderToTable(order.id, {
        tableId: selectedTableId,
        reason: finalReason,
      });

      console.log("✅ Move operation successful:", result);

      // Call success handler with updated order and move details
      onMoveSuccess(result.data.order, result.data.moveDetails);

      // Close modal
      onClose();
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      console.error("❌ Move operation failed:", {
        error,
        errorMessage: err?.message,
        errorCode: err?.code,
        errorStatus: err?.status,
        errorResponse: err?.response,
        orderId: order.id,
        tableId: selectedTableId,
        reason: finalReason,
      });

      // Try to extract more detailed error information
      let detailedError = "Unknown error occurred";
      let errorCode = "";
      let errorStatus = "";

      if (err?.name === "APIError") {
        // Handle APIError from our API client
        detailedError = err.message as string;
        errorCode = err.code as string;
        errorStatus = err.status as string;
      } else if (err?.message) {
        detailedError = err.message as string;
      } else if (typeof error === "string") {
        detailedError = error;
      }

      // Add debugging info to error message
      const debugInfo = `[Status: ${errorStatus || "unknown"}, Code: ${
        errorCode || "unknown"
      }]`;
      const userError = `${detailedError} ${debugInfo}`;

      console.error("🔍 Detailed error for user:", userError);
      setError(userError);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveError = (error: Error & { code?: string }): string => {
    const errorMessages: Record<string, string> = {
      TABLE_NOT_FOUND: "The selected table does not exist or is not available",
      SAME_TABLE: "This order is already at the selected table",
      INVALID_ORDER_STATUS:
        "This order cannot be moved (must be active or pending)",
      NOT_FOUND: "Order not found",
      VALIDATION_ERROR: "Please select a valid table",
    };

    const errorCode = error?.code || "";
    return errorMessages[errorCode] || error?.message || "Failed to move order";
  };

  const getTableStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "text-green-600";
      case "occupied":
        return "text-red-600";
      case "reserved":
        return "text-yellow-600";
      case "cleaning":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getTableStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case "available":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "occupied":
        return `${baseClasses} bg-gray-200 text-gray-900`;
      case "reserved":
        return `${baseClasses} bg-gray-100 text-gray-700`;
      case "cleaning":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-900">
              Move Order to Different Table
            </h3>
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
        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Order Details
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">
                  {order.orderNumber || order.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Table:</span>
                <span className="font-medium">Table {order.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">
                  ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{order.items?.length || 0} items</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "active"
                      ? "bg-gray-100 text-gray-800"
                      : order.status === "closed"
                      ? "bg-gray-200 text-gray-900"
                      : order.status === "cancelled"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Table Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Table <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                setError("");
              }}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            >
              <option value="">Choose a table...</option>
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.number} ({table.capacity} seats) - {table.status}
                  {table.location ? ` • ${table.location}` : ""}
                </option>
              ))}
            </select>

            {selectedTableId && (
              <div className="mt-2">
                {(() => {
                  const selectedTable = availableTables.find(
                    (t) => t.id === selectedTableId
                  );
                  if (!selectedTable) return null;

                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={getTableStatusBadge(selectedTable.status)}
                      >
                        {selectedTable.status}
                      </span>
                      {selectedTable.location && (
                        <span className="text-gray-500">
                          • {selectedTable.location}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Move <span className="text-destructive">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value) setCustomReason("");
                setError("");
              }}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mb-3"
            >
              <option value="">Select a reason...</option>
              {PREDEFINED_REASONS.map((reasonOption) => (
                <option key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Or enter custom reason..."
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (e.target.value.trim()) setReason("");
                  setError("");
                }}
                maxLength={200}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={
                !selectedTableId || (!reason && !customReason.trim()) || loading
              }
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  Moving Order...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Move to Table
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
