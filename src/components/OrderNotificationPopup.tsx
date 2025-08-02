import React, { useState, useEffect } from 'react';
import { OrderNotification } from '@/lib/receipt-printer';
import { X, Bell, Clock, User, Phone, MapPin } from 'lucide-react';

interface OrderNotificationPopupProps {
  notification: OrderNotification;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export function OrderNotificationPopup({ 
  notification, 
  onClose, 
  onMarkAsRead 
}: OrderNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // Show popup with animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    // Update time ago every minute
    const updateTimeAgo = () => {
      const now = new Date();
      const notificationTime = new Date(notification.timestamp);
      const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo('Just now');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [notification.timestamp]);

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Helper function to format items (unused but kept for future use)
  // const formatItems = (items: OrderData['items']) => {
  //   return items.map(item => 
  //     `${item.menuItemName} x${item.quantity}`
  //   ).join(', ');
  // };

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span className="font-semibold">New Order Received!</span>
          </div>
          <button
            onClick={handleMarkAsRead}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Order Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-black">
                Order #{notification.order.orderNumber}
              </h3>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Table {notification.order.tableNumber}
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {notification.order.customerName}
              </div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {notification.order.customerPhone}
              </div>
              {notification.order.orderSource && (
                <div className="flex items-center">
                  <span className={`badge badge-${notification.order.orderSource.toLowerCase().replace('_', '-')}`}>
                    {notification.order.orderSource}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <h4 className="font-semibold text-black mb-2">Items:</h4>
            <div className="space-y-1">
              {notification.order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.menuItemName} x{item.quantity}
                  </span>
                  <span className="font-medium text-black">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
              {notification.order.items.some(item => item.notes) && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {notification.order.items.map((item, index) => 
                    item.notes ? (
                      <div key={index} className="text-xs text-gray-500 italic">
                        {item.menuItemName}: {item.notes}
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-black">Total:</span>
              <span className="text-lg font-bold text-green-600">
                ${notification.order.finalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleMarkAsRead}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Mark as Read
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 