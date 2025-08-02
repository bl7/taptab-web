import React, { useState, useEffect } from 'react';
import { OrderNotification } from '@/lib/receipt-printer';
import { OrderNotificationPopup } from './OrderNotificationPopup';

interface NotificationManagerProps {
  onMarkAsRead: (id: string) => void;
  notifications: OrderNotification[];
}

export function NotificationManager({ 
  onMarkAsRead, 
  notifications 
}: NotificationManagerProps) {
  const [currentNotification, setCurrentNotification] = useState<OrderNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<OrderNotification[]>([]);
  const [isShowing, setIsShowing] = useState(false);

  // Handle new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // If no notification is currently showing, show the latest one
      if (!isShowing && !currentNotification) {
        setCurrentNotification(latestNotification);
        setIsShowing(true);
      } else if (isShowing && currentNotification) {
        // Add to queue if another notification is already showing
        setNotificationQueue(prev => [...prev, latestNotification]);
      }
    }
  }, [notifications, isShowing, currentNotification]);

  const handleCloseNotification = () => {
    setIsShowing(false);
    setCurrentNotification(null);
    
    // Show next notification in queue after a short delay
    setTimeout(() => {
      if (notificationQueue.length > 0) {
        const nextNotification = notificationQueue[0];
        setNotificationQueue(prev => prev.slice(1));
        setCurrentNotification(nextNotification);
        setIsShowing(true);
      }
    }, 500);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
    handleCloseNotification();
  };

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!currentNotification || !isShowing) {
    return null;
  }

  return (
    <OrderNotificationPopup
      notification={currentNotification}
      onClose={handleCloseNotification}
      onMarkAsRead={handleMarkAsRead}
    />
  );
} 