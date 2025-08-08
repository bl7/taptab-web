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
import {
  getOrderStatusDisplay,
  getOrderSourceDisplay,
  getPaymentMethodDisplay,
  isQROrder,
} from "@/lib/order-utils";

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
            <div className="flex-1">
              {/* Order Source as Primary Title */}
              <h1
                className={`text-3xl font-bold mb-2 ${
                  isQROrder(order) ? "text-blue-700" : "text-purple-700"
                }`}
              >
                {getOrderSourceDisplay(order.orderSource)}
              </h1>

              {/* Order Details Subtitle */}
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Details
                </h2>
                <span className="text-sm text-gray-600">
                  #{order.orderNumber || order.id.slice(-8)}
                </span>
              </div>

              {/* Visual Indicator Bar */}
              <div
                className={`h-1 w-32 rounded-full mt-3 ${
                  isQROrder(order)
                    ? "bg-gradient-to-r from-blue-500 to-blue-300"
                    : "bg-gradient-to-r from-purple-500 to-purple-300"
                }`}
              ></div>
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
                {getOrderSourceDisplay(order.orderSource)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {getOrderStatusDisplay(order).orderStatus}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {getOrderStatusDisplay(order).paymentStatus}
              </span>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Payment: {getPaymentMethodDisplay(order.paymentMethod)}
                </span>
              </div>
            )}
            {/* Payment Status Badge */}
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getOrderStatusDisplay(order).paymentStatus}
              </div>
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
                {/* For QR orders: Show different actions since payment is already taken */}
                {isQROrder(order) ? (
                  <>
                    {/* Only show Edit Order for QR orders with pending payment */}
                    {order.paymentStatus === "pending" && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // TODO: Add edit order functionality
                          onClose();
                        }}
                        className="flex-1 py-3"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Edit Order
                      </Button>
                    )}

                    {/* Only show Cancel Order for QR orders with pending payment */}
                    {order.paymentStatus === "pending" && (
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
                    )}
                  </>
                ) : (
                  <>
                    {/* Only show Mark as Paid for orders with pending payment */}
                    {order.paymentStatus === "pending" && (
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
                    )}

                    {/* Only show Cancel Order for orders with pending payment */}
                    {order.paymentStatus === "pending" && (
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
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
