"use client";

import React from "react";
import { User, MapPin, AlertTriangle, Scissors } from "lucide-react";
import { Order } from "@/lib/orders-api";
import { Button } from "@/components/ui/button";

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
  onMoveTable?: (order: Order) => void;
  onSplitOrder?: (order: Order) => void;
}

export default function OrderCard({
  order,
  waitTime,
  isUrgent,
  onClick,
  onPaymentModal,
  onEditOrder,
  onPrintReceipt,
  onMoveTable,
  onSplitOrder,
}: OrderCardProps) {
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

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Order number removed */}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ${totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">{waitTime} min ago</div>
        </div>
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

      {/* Action Buttons - Only show for active orders */}
      {order.status === "active" && (
        <div className="space-y-2">
          {/* Primary Actions Row */}
          <div className="flex space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPaymentModal(order);
              }}
              className="flex-1 text-sm"
            >
              Mark as Paid
            </Button>

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
          </div>

          {/* Secondary Actions Row */}
          {(onMoveTable || onSplitOrder) && (
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
        {order.orderSource && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {order.orderSource.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
