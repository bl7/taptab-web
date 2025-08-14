"use client";

import React from "react";
import { User, MapPin, AlertTriangle, Scissors, X } from "lucide-react";
import { Order } from "@/lib/orders-api";
import { Button } from "@/components/ui/button";
import {
  getOrderStatusDisplay,
  getPaymentMethodDisplay,
  getOrderSourceDisplay,
  isQROrder,
} from "@/lib/order-utils";

interface OrderCardProps {
  order: Order;
  waitTime: number;
  isUrgent: boolean;
  onClick: (order: Order) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onPaymentModal: (order: Order) => void;
  onCancelModal: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onCloseOrder?: (order: Order) => void;
  onMoveTable?: (order: Order) => void;
  onSplitOrder?: (order: Order) => void;
}

export default function OrderCard({
  order,
  waitTime,
  isUrgent,
  onClick,
  onPaymentModal,
  onCancelModal,
  onEditOrder,
  onPrintReceipt,
  onCloseOrder,
  onMoveTable,
  onSplitOrder,
}: OrderCardProps) {
  // Debug: Log order data to see what fields are available
  console.log("qrorder", {
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    orderSource: order.orderSource,
    status: order.status,
    allFields: Object.keys(order),
    fullOrder: order,
  });

  const totalAmount =
    order.totalAmount ||
    order.finalAmount ||
    order.total ||
    order.items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div
      onClick={() => onClick(order)}
      className="relative bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl"
    >
      {/* Urgent Indicator */}
      {isUrgent && (
        <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Header with Order Source Title */}
      <div className="mb-4">
        {/* Order Source as Title */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className={`text-lg font-bold ${
                isQROrder(order) ? "text-blue-700" : "text-purple-700"
              }`}
            >
              {getOrderSourceDisplay(order.orderSource)}
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              Order #{order.orderNumber || order.id.slice(-8)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${totalAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{waitTime} min ago</div>
          </div>
        </div>

        {/* Order Source Icon/Indicator Bar */}
        <div
          className={`h-1 w-full rounded-full ${
            isQROrder(order)
              ? "bg-gradient-to-r from-blue-500 to-blue-300"
              : "bg-gradient-to-r from-purple-500 to-purple-300"
          }`}
        ></div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {order.customerName || "Walk-in Customer"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Table {order.tableNumber}
          </span>
        </div>
      </div>

      {/* Payment Status - Prominent Display */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
            order.paymentStatus === "paid"
              ? "bg-green-100 text-green-800 border border-green-200"
              : order.paymentStatus === "pending"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : order.paymentStatus === "failed"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-gray-100 text-gray-800 border border-gray-200"
          }`}
        >
          <span className="mr-2">Payment Status:</span>
          <span className="font-semibold">
            {order.paymentStatus || "Unknown"}
          </span>
          {order.paymentMethod && (
            <span className="ml-2 text-xs">
              via {getPaymentMethodDisplay(order.paymentMethod)}
            </span>
          )}
        </div>
      </div>

      {/* Order Status Info */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-gray-600">
            {getOrderStatusDisplay(order).orderStatus}
          </span>
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              order.paymentStatus === "paid"
                ? "bg-green-100 text-green-800"
                : order.paymentStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : order.paymentStatus === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {order.paymentStatus || "Unknown"}
          </div>
          {order.paymentMethod && (
            <span className="text-gray-600">
              via {getPaymentMethodDisplay(order.paymentMethod)}
            </span>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {item.quantity}x {item.menuItemName}
              </span>
              {item.notes && (
                <span className="text-xs text-gray-500 italic">
                  ({item.notes})
                </span>
              )}
            </div>
            <span className="font-medium text-gray-900">
              ${(item.total || 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons - Only show for active or merged orders */}
      {(order.status === "active" || order.status === "merged") && (
        <div className="space-y-2">
          {/* Primary Actions Row */}
          <div className="flex space-x-2">
            {/* For QR orders: Show Close Table instead of Mark as Paid */}
            {isQROrder(order) ? (
              <>
                {/* Only show Edit Order for QR orders with pending payment */}
                {order.paymentStatus === "pending" && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditOrder(order);
                    }}
                    className="flex-1 text-sm"
                  >
                    Edit Order
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintReceipt(order);
                  }}
                  className="flex-1 text-sm"
                >
                  Print Receipt
                </Button>

                {order.paymentStatus === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelModal(order);
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Cancel Order
                  </Button>
                )}

                {onCloseOrder && order.paymentStatus === "paid" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseOrder(order);
                    }}
                    className="flex-1 text-sm bg-green-600 hover:bg-green-700"
                  >
                    Close Order
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPaymentModal(order);
                  }}
                  className="flex-1 text-sm"
                >
                  Pay & Close
                </Button>

                {order.paymentStatus === "pending" && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditOrder(order);
                    }}
                    className="flex-1 text-sm"
                  >
                    Edit Order
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintReceipt(order);
                  }}
                  className="flex-1 text-sm"
                >
                  Print Receipt
                </Button>

                {order.paymentStatus === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelModal(order);
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Cancel Order
                  </Button>
                )}

                {onCloseOrder && order.paymentStatus === "paid" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseOrder(order);
                    }}
                    className="flex-1 text-sm bg-green-600 hover:bg-green-700"
                  >
                    Close Order
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Secondary Actions Row - Only for non-QR orders with pending payment */}
          {!isQROrder(order) &&
            order.paymentStatus === "pending" &&
            (onMoveTable || onSplitOrder) && (
              <div className="flex justify-center gap-2">
                {onMoveTable && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTable(order);
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    Move Table
                  </Button>
                )}

                {onSplitOrder && order.items.length > 1 && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplitOrder(order);
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Scissors className="h-4 w-4" />
                    Split Order
                  </Button>
                )}
              </div>
            )}
        </div>
      )}

      {/* Wait Time Warning */}
      {waitTime > 30 && (
        <div className="mt-3 p-2 bg-muted border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-gray-700">
              Long wait time: {waitTime} minutes
            </span>
          </div>
        </div>
      )}

      {/* Waiter Info */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {order.waiterName || order.sourceDetails || "Unknown Waiter"}
          </span>
        </div>
      </div>
    </div>
  );
}
