"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export default function MergeBillsTest() {
  const [tableId, setTableId] = useState("5");
  const [testResult, setTestResult] = useState<string>("");

  const testGetTableOrders = async () => {
    try {
      setTestResult("Testing getTableOrders...");
      const response = await api.getTableOrders(tableId);
      setTestResult(
        `✅ Success! Found ${response.orders.length} orders for table ${tableId}`
      );
      console.log("Table Orders Response:", response);
    } catch (error) {
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("Test Error:", error);
    }
  };

  const testValidateMerge = async () => {
    try {
      setTestResult("Testing validateMerge...");
      const response = await api.validateMerge({
        sourceOrderIds: ["order_1", "order_2"],
      });
      setTestResult(`✅ Validation Result: Can merge = ${response.canMerge}`);
      console.log("Validate Merge Response:", response);
    } catch (error) {
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("Test Error:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Merge Bills API Test
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table ID
          </label>
          <input
            type="text"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter table ID"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={testGetTableOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Get Table Orders
          </button>

          <button
            onClick={testValidateMerge}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Test Validate Merge
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
