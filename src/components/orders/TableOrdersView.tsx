"use client";

import React, { useState } from "react";
import { ArrowLeft, Users, Clock, X, RefreshCw, User } from "lucide-react";
import { Order } from "@/lib/orders-api";
import { Table, api, OrderModificationChange } from "@/lib/api";
import { ReceiptGenerator } from "@/lib/receipt-generator";
import { showToast } from "@/lib/utils";

import OrderCard from "./OrderCard";
import OrderDetailsModal from "./OrderDetailsModal";
import EditOrderModal from "@/components/EditOrderModal";
import MoveTableModal from "./MoveTableModal";
import OrderSplitModal from "./OrderSplitModal";

interface TableOrdersViewProps {
  table: Table;
  orders: Order[];
  onBack: () => void;
  onRefresh: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  tables?: Table[];
}

export default function TableOrdersView({
  table,
  orders,
  onBack,
  onRefresh,
  onStatusChange,
  tables = [],
}: TableOrdersViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Payment and cancellation modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToAction, setOrderToAction] = useState<Order | null>(null);

  // Print receipt modal
  const [showPrintReceiptModal, setShowPrintReceiptModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printReceiptType, setPrintReceiptType] = useState<
    "kitchen" | "customer" | null
  >(null);
  const [printingReceipt, setPrintingReceipt] = useState(false);

  // Move table modal
  const [showMoveTableModal, setShowMoveTableModal] = useState(false);
  const [orderToMove, setOrderToMove] = useState<Order | null>(null);

  // Split order modal
  const [showSplitOrderModal, setShowSplitOrderModal] = useState(false);
  const [orderToSplit, setOrderToSplit] = useState<Order | null>(null);

  const getWaitTime = (order: Order) => {
    return Math.floor(
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
    );
  };

  const isUrgent = (order: Order) => {
    return getWaitTime(order) > 20;
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handlePrintReceipt = async (order: Order) => {
    try {
      const receiptGenerator = new ReceiptGenerator();

      // Convert Order to OrderData format
      const orderData = {
        id: order.id,
        orderNumber: order.orderNumber || order.id.slice(-8),
        tableNumber: order.tableNumber,
        totalAmount: order.totalAmount || 0,
        finalAmount: order.finalAmount || order.totalAmount || 0,
        status: order.status,
        customerName: order.customerName || "Walk-in Customer",
        customerPhone: order.customerPhone || "",
        orderSource: order.orderSource,
        items: order.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          price: item.price,
          total: item.total || item.price * item.quantity,
          notes: item.notes,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      // Generate receipt PNG
      const receiptDataURL = await receiptGenerator.generateReceiptPNG(
        orderData
      );

      // Calculate dimensions
      const labelWidth = 56; // 56mm receipt width
      const actualHeightPixels = receiptGenerator.getHeight(orderData);
      const labelHeight = Math.ceil((actualHeightPixels * 25.4) / 120); // Convert pixels to mm at 120 DPI

      // OS-specific data format
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      const isMac = platform.includes("mac") || userAgent.includes("mac");

      let printData: {
        type?: string;
        images?: string[];
        labelWidth?: number;
        labelHeight?: number;
        image?: string;
        selectedPrinter: string;
      };
      if (isMac) {
        // Mac format: base64-only image
        const base64Only = receiptDataURL.replace("data:image/png;base64,", "");
        printData = {
          type: "print",
          images: [base64Only],
          selectedPrinter: "Receipt Printer",
        };
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer",
        };
      }

      // Send to PrintBridge
      const printBridgeURL = isMac
        ? "ws://localhost:8080"
        : "ws://localhost:8080/ws";
      const ws = new WebSocket(printBridgeURL);

      ws.onopen = () => {
        console.log(`🖨️ Printing receipt for order:`, orderData.orderNumber);
        ws.send(JSON.stringify(printData));
        ws.close();
        showToast.success("Receipt printed successfully!");
      };

      ws.onerror = () => {
        console.warn("⚠️ PrintBridge not connected");
        showToast.error(
          "PrintBridge not connected. Please start the PrintBridge server."
        );
      };
    } catch (error) {
      console.error("❌ Error printing receipt:", error);
      showToast.error("Failed to print receipt. Please try again.");
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleModifyOrder = async (
    orderId: string,
    changes: OrderModificationChange[]
  ) => {
    try {
      const result = await api.modifyOrderBatch(orderId, changes);

      if (result.success) {
        await onRefresh();
        console.log("Order modified successfully:", result);
      } else {
        throw new Error("Failed to modify order");
      }
    } catch (error) {
      console.error("Error modifying order:", error);
      showToast.error("Failed to modify order. Please try again.");
    }
  };

  const openPaymentModal = (order: Order) => {
    setOrderToAction(order);
    setShowPaymentModal(true);
  };

  const openCancelModal = (order: Order) => {
    setOrderToAction(order);
    setShowCancelModal(true);
  };

  const handlePaymentWithMethod = async (
    paymentMethod: "CASH" | "CARD" | "QR" | "STRIPE"
  ) => {
    if (!orderToAction) return;

    try {
      // Mark the order as paid
      await api.markOrderAsPaid(orderToAction.id, paymentMethod);

      // Close the order after payment for all order types
      await api.closeOrder(orderToAction.id, "Customer finished dining");
      showToast.success(
        `Order paid via ${paymentMethod} and closed successfully`
      );

      onRefresh();
      setShowPaymentModal(false);
      setOrderToAction(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      showToast.error("Failed to process payment");
    }
  };

  const handleCancelWithReason = async () => {
    if (!orderToAction || !cancelReason.trim()) {
      showToast.warning("Please provide a reason for cancellation");
      return;
    }

    try {
      await api.cancelOrder(orderToAction.id, cancelReason.trim());
      showToast.success("Order cancelled successfully");
      onRefresh();
      setShowCancelModal(false);
      setCancelReason("");
      setOrderToAction(null);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showToast.error("Failed to cancel order");
    }
  };

  const handleCloseOrder = async (order: Order) => {
    try {
      await api.closeOrder(order.id, "Customer finished dining");
      showToast.success("Order closed successfully");
      onRefresh();
    } catch (error) {
      console.error("Failed to close order:", error);
      showToast.error("Failed to close order");
    }
  };

  const closePrintReceiptModal = () => {
    setOrderToPrint(null);
    setPrintReceiptType(null);
    setShowPrintReceiptModal(false);
  };

  const printReceipt = async (type: "kitchen" | "customer") => {
    if (!orderToPrint) return;

    setPrintingReceipt(true);
    setPrintReceiptType(type);
    try {
      const receiptGenerator = new ReceiptGenerator();

      // Convert Order to OrderData format
      const orderData = {
        id: orderToPrint.id,
        orderNumber: orderToPrint.orderNumber || orderToPrint.id.slice(-8),
        tableNumber: orderToPrint.tableNumber,
        totalAmount: orderToPrint.totalAmount || 0,
        finalAmount: orderToPrint.finalAmount || orderToPrint.totalAmount || 0,
        status: orderToPrint.status,
        customerName: orderToPrint.customerName || "Walk-in Customer",
        customerPhone: orderToPrint.customerPhone || "",
        orderSource: orderToPrint.orderSource,
        items: orderToPrint.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          price: item.price,
          total: item.total || item.price * item.quantity,
          notes: item.notes,
        })),
        createdAt: orderToPrint.createdAt,
        updatedAt: orderToPrint.updatedAt,
      };

      // Generate receipt PNG
      const receiptDataURL = await receiptGenerator.generateReceiptPNG(
        orderData
      );

      // Calculate dimensions
      const labelWidth = 56; // 56mm receipt width
      const actualHeightPixels = receiptGenerator.getHeight(orderData);
      const labelHeight = Math.ceil((actualHeightPixels * 25.4) / 120); // Convert pixels to mm at 120 DPI

      // OS-specific data format
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      const isMac = platform.includes("mac") || userAgent.includes("mac");

      let printData: {
        type?: string;
        images?: string[];
        labelWidth?: number;
        labelHeight?: number;
        image?: string;
        selectedPrinter: string;
      };
      if (isMac) {
        // Mac format: base64-only image
        const base64Only = receiptDataURL.replace("data:image/png;base64,", "");
        printData = {
          type: "print",
          images: [base64Only],
          selectedPrinter: "Receipt Printer",
        };
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer",
        };
      }

      // Send to PrintBridge
      const printBridgeURL = isMac
        ? "ws://localhost:8080"
        : "ws://localhost:8080/ws";
      const ws = new WebSocket(printBridgeURL);

      ws.onopen = () => {
        console.log(
          `🖨️ Printing ${type} receipt for order:`,
          orderData.orderNumber
        );
        ws.send(JSON.stringify(printData));
        ws.close();
        showToast.success(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } receipt printed successfully!`
        );
      };

      ws.onerror = () => {
        console.warn("⚠️ PrintBridge not connected");
        showToast.error(
          "PrintBridge not connected. Please start the PrintBridge server."
        );
      };
    } catch (error) {
      console.error("❌ Error printing receipt:", error);
      showToast.error("Failed to print receipt. Please try again.");
    } finally {
      setPrintingReceipt(false);
      closePrintReceiptModal();
    }
  };

  // Move table handlers
  const handleMoveTable = (order: Order) => {
    setOrderToMove(order);
    setShowMoveTableModal(true);
  };

  const handleMoveSuccess = (
    updatedOrder: Order,
    moveDetails: Record<string, unknown>
  ) => {
    console.log("✅ Order moved successfully:", { updatedOrder, moveDetails });

    // Show success notification
    showToast.success(
      `Order moved successfully from Table ${moveDetails.fromTable} to Table ${moveDetails.toTable}`
    );

    // Refresh orders to update the view
    onRefresh();

    // Close modal
    setShowMoveTableModal(false);
    setOrderToMove(null);
  };

  const closeMoveTableModal = () => {
    setShowMoveTableModal(false);
    setOrderToMove(null);
  };

  // Split order handlers
  const handleSplitOrder = (order: Order) => {
    setOrderToSplit(order);
    setShowSplitOrderModal(true);
  };

  const handleSplitSuccess = (
    newOrder: Order,
    updatedSourceOrder: Order,
    splitDetails: Record<string, unknown>
  ) => {
    console.log("✅ Order split successfully:", {
      newOrder,
      updatedSourceOrder,
      splitDetails,
    });

    // Show success notification
    showToast.success(
      `Order split successfully! New order: ${
        newOrder.orderNumber || newOrder.id
      } (${splitDetails.itemsSplit} items, $${splitDetails.totalSplitAmount})`
    );

    // Refresh orders to update the view
    onRefresh();

    // Close modal
    setShowSplitOrderModal(false);
    setOrderToSplit(null);
  };

  const closeSplitOrderModal = () => {
    setShowSplitOrderModal(false);
    setOrderToSplit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tables</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Table {table.number}
            </h1>
            <p className="text-gray-600">Order Management</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Orders
          </h3>
          <p className="text-gray-600">
            This table has no active orders at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              waitTime={getWaitTime(order)}
              isUrgent={isUrgent(order)}
              onClick={handleOrderClick}
              onStatusChange={onStatusChange}
              onPaymentModal={openPaymentModal}
              onCancelModal={openCancelModal}
              onEditOrder={handleEditOrder}
              onPrintReceipt={handlePrintReceipt}
              onCloseOrder={handleCloseOrder}
              onMoveTable={handleMoveTable}
              onSplitOrder={handleSplitOrder}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        onPaymentModal={openPaymentModal}
        onCancelModal={openCancelModal}
      />

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => {
            setShowEditModal(false);
            setEditingOrder(null);
          }}
          onModifyOrder={handleModifyOrder}
        />
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && orderToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Select Payment Method
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Order: {orderToAction.orderNumber || orderToAction.id.slice(-8)}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handlePaymentWithMethod("CASH")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                >
                  Cash
                </button>
                <button
                  onClick={() => handlePaymentWithMethod("CARD")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                >
                  Card
                </button>
                <button
                  onClick={() => handlePaymentWithMethod("QR")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                >
                  QR
                </button>
                <button
                  onClick={() => handlePaymentWithMethod("STRIPE")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
                >
                  Stripe
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setOrderToAction(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && orderToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: {orderToAction.orderNumber || orderToAction.id.slice(-8)}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelWithReason}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setOrderToAction(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {showPrintReceiptModal && orderToPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-black">
                    Print Receipt
                  </h2>
                  <p className="text-sm text-gray-600">
                    Order:{" "}
                    {orderToPrint.orderNumber || orderToPrint.id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={closePrintReceiptModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Select Receipt Type:
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => printReceipt("kitchen")}
                    disabled={printingReceipt}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {printingReceipt && printReceiptType === "kitchen"
                      ? "Printing..."
                      : "Kitchen Receipt"}
                  </button>
                  <button
                    onClick={() => printReceipt("customer")}
                    disabled={printingReceipt}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {printingReceipt && printReceiptType === "customer"
                      ? "Printing..."
                      : "Customer Receipt"}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Kitchen Receipt:</strong> For kitchen staff with
                  cooking instructions
                </p>
                <p>
                  <strong>Customer Receipt:</strong> For customer with payment
                  details
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Table Modal */}
      <MoveTableModal
        order={orderToMove}
        isOpen={showMoveTableModal}
        onClose={closeMoveTableModal}
        onMoveSuccess={handleMoveSuccess}
        tables={tables}
      />

      {/* Split Order Modal */}
      <OrderSplitModal
        order={orderToSplit}
        isOpen={showSplitOrderModal}
        onClose={closeSplitOrderModal}
        onSplitSuccess={handleSplitSuccess}
        tables={tables}
      />
    </div>
  );
}
