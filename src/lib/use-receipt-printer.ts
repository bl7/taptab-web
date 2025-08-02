import { useEffect, useRef, useState, useCallback } from 'react';
import { ReceiptPrinter, OrderNotification } from './receipt-printer';

export function useReceiptPrinter() {
  const printerRef = useRef<ReceiptPrinter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize printer connection
  const connect = useCallback((jwtToken: string) => {
    if (!jwtToken) {
      console.error('❌ No JWT token provided for WebSocket connection');
      return;
    }

    // Prevent multiple connections
    if (printerRef.current && isConnected) {
      console.log('🔄 Already connected, skipping connection attempt');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    setConnectionStatus('connecting');
    
    try {
      // Clean up existing connection first
      if (printerRef.current) {
        printerRef.current.disconnect();
        printerRef.current = null;
      }

      printerRef.current = new ReceiptPrinter();
      
      // Set up notification callback
      printerRef.current.onNotification((notification: OrderNotification) => {
        console.log('🎯 React hook received notification:', notification.order.orderNumber);
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      });
      
      printerRef.current.connect(jwtToken);
      
      // Check connection status periodically
      const checkConnection = () => {
        if (printerRef.current) {
          const connected = printerRef.current.getConnectionStatus();
          setIsConnected(connected);
          setConnectionStatus(connected ? 'connected' : 'disconnected');
        }
      };

      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Check immediately and then every 5 seconds (reduced frequency)
      checkConnection();
      intervalRef.current = setInterval(checkConnection, 5000);

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [isConnected]);

  // Disconnect printer
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (printerRef.current) {
      printerRef.current.disconnect();
      printerRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Test notification function
  const testNotification = () => {
    if (printerRef.current) {
      printerRef.current.testNotification();
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    if (printerRef.current) {
      printerRef.current.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    if (printerRef.current) {
      printerRef.current.clearNotifications();
      setNotifications([]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up WebSocket connection on unmount');
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    testNotification,
    markAsRead,
    clearNotifications,
    notifications,
    isConnected,
    connectionStatus,
    printer: printerRef.current
  };
} 