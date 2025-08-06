"use client";

import React from "react";
import {
  X,
  User,
  MapPin,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Order } from "@/lib/orders-api";
import { Button } from "@/components/ui/button";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentModal: (order: Order) => void;
  onCancelModal: (order: Order) => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onPaymentModal,
  onCancelModal,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const totalAmount =
    order.totalAmount ||
    order.finalAmount ||
    order.total ||
    order.items.reduce((sum, item) => sum + (item.total || 0), 0);

  const waitTime = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details
              </h2>
              <p className="text-sm text-gray-600">
                Order #{order.orderNumber || order.id.slice(-8)}
              </p>
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

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Table {order.tableNumber}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {order.customerName || "Walk-in Customer"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {order.waiterName || order.sourceDetails || "Unknown Waiter"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {order.orderSource || "Unknown Source"}
              </span>
            </div>
          </div>

          {/* Wait Time Warning */}
          {waitTime > 20 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700">
                  Order waiting for {waitTime} minutes
                </span>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {item.quantity}x {item.menuItemName}
                      </span>
                      <span className="text-sm text-gray-600">
                        ${(item.price || 0).toFixed(2)} each
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    ${(item.total || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center mb-6 p-4 bg-muted rounded-lg">
            <span className="text-lg font-bold text-gray-900">
              Total Amount:
            </span>
            <span className="text-2xl font-bold text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 flex-wrap gap-2">
            {order.status === "active" && (
              <>
                <Button
                  onClick={() => {
                    onPaymentModal(order);
                    onClose();
                  }}
                  className="flex-1 py-3"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    onCancelModal(order);
                    onClose();
                  }}
                  className="flex-1 py-3"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
