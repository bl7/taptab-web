import React, { useState, useEffect, useRef } from 'react';
import { OrderNotification } from '@/lib/receipt-printer';
import { OrderNotificationPopup } from './OrderNotificationPopup';
import { Bell, X, Check, Trash2 } from 'lucide-react';

interface NotificationManagerProps {
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  notifications: OrderNotification[];
}

export function NotificationManager({ 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClearAll,
  notifications 
}: NotificationManagerProps) {
  const [currentNotification, setCurrentNotification] = useState<OrderNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<OrderNotification[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      // Only show unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length > 0) {
        const latestUnreadNotification = unreadNotifications[0];
        
        // If no notification is currently showing, show the latest unread one
        if (!isShowing && !currentNotification) {
          setCurrentNotification(latestUnreadNotification);
          setIsShowing(true);
        } else if (isShowing && currentNotification) {
          // Add to queue if another notification is already showing
          setNotificationQueue(prev => [...prev, latestUnreadNotification]);
        }
      }
    }
  }, [notifications, isShowing, currentNotification]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false);
      }
    };

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationPanel]);

  const handleCloseNotification = () => {
    setIsShowing(false);
    setCurrentNotification(null);
    
    // Show next unread notification in queue after a short delay
    setTimeout(() => {
      if (notificationQueue.length > 0) {
        const nextNotification = notificationQueue[0];
        setNotificationQueue(prev => prev.slice(1));
        
        // Only show if it's still unread
        if (!nextNotification.isRead) {
          setCurrentNotification(nextNotification);
          setIsShowing(true);
        }
      }
    }, 500);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
    // Immediately close the current notification
    setIsShowing(false);
    setCurrentNotification(null);
    
    // Clear the queue and don't show any more notifications for this ID
    setNotificationQueue(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    setShowNotificationPanel(false);
    // Clear the current notification and queue
    setIsShowing(false);
    setCurrentNotification(null);
    setNotificationQueue([]);
  };

  const handleClearAll = () => {
    onClearAll();
    setShowNotificationPanel(false);
  };

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Notification Bell with Count */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200"
          title={`${unreadCount} unread notifications`}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden" ref={panelRef}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium ${
                            notification.changes ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {notification.changes ? 'Order Modified' : 'New Order'}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-800 truncate">
                          Order #{notification.order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Table {notification.order.tableNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${notification.order.finalAmount.toFixed(2)}
                        </div>
                        {notification.changes && (
                          <div className="mt-1 text-xs text-gray-600">
                            {notification.changes.addedItems.length > 0 && (
                              <span className="text-green-600">+{notification.changes.addedItems.length} added</span>
                            )}
                            {notification.changes.removedItems.length > 0 && (
                              <span className="text-red-600 ml-2">-{notification.changes.removedItems.length} removed</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Popup Notification */}
      {currentNotification && isShowing && (
        <OrderNotificationPopup
          notification={currentNotification}
          onClose={handleCloseNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </>
  );
} 