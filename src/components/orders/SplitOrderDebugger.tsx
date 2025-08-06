/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface SplitOrderDebuggerProps {
  orderId?: string;
  sampleItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function SplitOrderDebugger({
  orderId = "test-order-id",
  sampleItems = [
    { id: "item1", name: "Apple Juice", quantity: 2, price: 2 },
    { id: "item2", name: "Aachi Khau", quantity: 1, price: 20 },
    { id: "item3", name: "Chana Bhuna", quantity: 3, price: 20 },
  ],
}: SplitOrderDebuggerProps) {
  const [testOrderId, setTestOrderId] = useState(orderId);
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      itemId: string;
      quantity: number;
    }>
  >([]);
  const [newTableId, setNewTableId] = useState("");
  const [customerName, setCustomerName] = useState("Split Customer");
  const [reason, setReason] = useState("Test split");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleItemSelect = (itemId: string, quantity: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.itemId === itemId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter((item) => item.itemId !== itemId);
        }
        return prev.map((item) =>
          item.itemId === itemId ? { ...item, quantity } : item
        );
      } else if (quantity > 0) {
        return [...prev, { itemId, quantity }];
      }
      return prev;
    });
  };

  const testSplitOrder = async () => {
    setTesting(true);
    setResult(null);
    setError("");

    console.log("🧪 Testing split order API...");
    console.log("📍 API Base URL:", (api as any).baseURL);
    console.log("📋 Test parameters:", {
      orderId: testOrderId,
      itemsToSplit: selectedItems,
      newTableId,
      customerName,
      reason,
    });

    try {
      const response = await api.splitOrder(testOrderId, {
        itemsToSplit: selectedItems,
        newTableId: newTableId || undefined,
        customerName: customerName || undefined,
        reason: reason || "Test split",
      });

      console.log("✅ Split test successful:", response);
      setResult(response);
    } catch (err: any) {
      console.error("❌ Split test failed:", err);
      setError(
        `${err.message} [${err.code || "unknown"}:${err.status || "unknown"}]`
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-purple-50 text-black border border-purple-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        ✂️ Split Order API Debugger
      </h3>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Order ID:
          </label>
          <input
            type="text"
            value={testOrderId}
            onChange={(e) => setTestOrderId(e.target.value)}
            className="w-full p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
            placeholder="Enter order ID to test"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Items to Split:
          </label>
          <div className="space-y-2">
            {sampleItems.map((item) => {
              const selectedQty =
                selectedItems.find((si) => si.itemId === item.id)?.quantity ||
                0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (${item.price} each, {item.quantity} available)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleItemSelect(item.id, Math.max(0, selectedQty - 1))
                      }
                      disabled={selectedQty === 0}
                      className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={selectedQty}
                      onChange={(e) =>
                        handleItemSelect(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                    <button
                      onClick={() =>
                        handleItemSelect(
                          item.id,
                          Math.min(item.quantity, selectedQty + 1)
                        )
                      }
                      disabled={selectedQty >= item.quantity}
                      className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">
              New Table ID (optional):
            </label>
            <input
              type="text"
              value={newTableId}
              onChange={(e) => setNewTableId(e.target.value)}
              className="w-full p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
              placeholder="Leave empty for same table"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">
              Customer Name:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
              placeholder="Enter customer name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Reason:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
            placeholder="Enter reason for split"
          />
        </div>
      </div>

      <button
        onClick={testSplitOrder}
        disabled={testing || selectedItems.length === 0 || !testOrderId}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
      >
        {testing ? "Testing..." : "Test Split Order API"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800">Error:</h4>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800">Success:</h4>
          <div className="text-green-700 text-sm mt-1">
            <p>
              <strong>New Order ID:</strong> {result.data?.newOrder?.id}
            </p>
            <p>
              <strong>Items Split:</strong>{" "}
              {result.data?.splitDetails?.itemsSplit}
            </p>
            <p>
              <strong>Split Amount:</strong> $
              {result.data?.splitDetails?.totalSplitAmount}
            </p>
            <p>
              <strong>Remaining Amount:</strong> $
              {result.data?.splitDetails?.sourceOrderRemainingTotal}
            </p>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-green-800 font-medium">
              View Full Response
            </summary>
            <pre className="text-green-700 text-xs mt-1 overflow-auto bg-green-100 p-2 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-4 text-xs text-purple-600">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>• Check browser console for detailed logs</p>
        <p>• Network tab shows actual HTTP requests</p>
        <p>• API Base URL: {(api as any).baseURL}</p>
        <p>• Selected items: {selectedItems.length}</p>
      </div>
    </div>
  );
}
