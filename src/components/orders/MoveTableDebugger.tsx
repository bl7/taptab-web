/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface MoveTableDebuggerProps {
  orderId?: string;
  tableId?: string;
}

export default function MoveTableDebugger({
  orderId = "test-order-id",
  tableId = "test-table-id",
}: MoveTableDebuggerProps) {
  const [testOrderId, setTestOrderId] = useState(orderId);
  const [testTableId, setTestTableId] = useState(tableId);
  const [testReason, setTestReason] = useState("Test move");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [checkingEndpoint, setCheckingEndpoint] = useState(false);
  const [endpointResult, setEndpointResult] = useState<any>(null);

  const testMoveTable = async () => {
    setTesting(true);
    setResult(null);
    setError("");

    console.log("🧪 Testing move table API...");
    console.log("📍 API Base URL:", (api as any).baseURL);
    console.log("📋 Test parameters:", {
      orderId: testOrderId,
      tableId: testTableId,
      reason: testReason,
    });

    try {
      const response = await api.moveOrderToTable(testOrderId, {
        tableId: testTableId,
        reason: testReason,
      });

      console.log("✅ Test successful:", response);
      setResult(response);
    } catch (err: any) {
      console.error("❌ Test failed:", err);
      setError(
        `${err.message} [${err.code || "unknown"}:${err.status || "unknown"}]`
      );
    } finally {
      setTesting(false);
    }
  };

  const checkEndpoint = async () => {
    setCheckingEndpoint(true);
    setEndpointResult(null);

    const baseURL = (api as any).baseURL;
    const testUrl = `${baseURL}/orders/${testOrderId}/move-table`;

    console.log("🔍 Checking endpoint accessibility:", testUrl);

    try {
      // Try to make a simple OPTIONS request to check if endpoint exists
      const response = await fetch(testUrl, {
        method: "OPTIONS",
      });

      const result = {
        url: testUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };

      console.log("📡 Endpoint check result:", result);
      setEndpointResult(result);
    } catch (err: any) {
      console.error("❌ Endpoint check failed:", err);
      setEndpointResult({
        error: err.message,
        url: testUrl,
      });
    } finally {
      setCheckingEndpoint(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        🔧 Move Table API Debugger
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">
            Order ID:
          </label>
          <input
            type="text"
            value={testOrderId}
            onChange={(e) => setTestOrderId(e.target.value)}
            className="w-full p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter order ID to test"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">
            Table ID:
          </label>
          <input
            type="text"
            value={testTableId}
            onChange={(e) => setTestTableId(e.target.value)}
            className="w-full p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter table ID to move to"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">
            Reason:
          </label>
          <input
            type="text"
            value={testReason}
            onChange={(e) => setTestReason(e.target.value)}
            className="w-full p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter reason for move"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={checkEndpoint}
          disabled={checkingEndpoint || !testOrderId}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {checkingEndpoint ? "Checking..." : "Check Endpoint"}
        </button>

        <button
          onClick={testMoveTable}
          disabled={testing || !testOrderId || !testTableId}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {testing ? "Testing..." : "Test Move Table API"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800">Error:</h4>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {endpointResult && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800">Endpoint Check:</h4>
          <pre className="text-blue-700 text-xs mt-1 overflow-auto">
            {JSON.stringify(endpointResult, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800">API Test Result:</h4>
          <pre className="text-green-700 text-xs mt-1 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-yellow-600">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>• Check browser console for detailed logs</p>
        <p>• Network tab shows actual HTTP requests</p>
        <p>• API Base URL: {(api as any).baseURL}</p>
      </div>
    </div>
  );
}
