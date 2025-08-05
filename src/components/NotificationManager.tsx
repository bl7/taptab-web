import React, { useState, useEffect, useRef } from 'react';
import { OrderNotification } from '@/lib/receipt-printer';
import { OrderNotificationPopup } from './OrderNotificationPopup';


interface NotificationManagerProps {
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  notifications: OrderNotification[];
}

export function NotificationManager({ 
  onMarkAsRead, 
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

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
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