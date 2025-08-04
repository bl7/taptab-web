import { useEffect, useRef, useState, useCallback } from 'react';
import { ReceiptPrinter, OrderNotification } from './receipt-printer';

// Global singleton instance
let globalPrinter: ReceiptPrinter | null = null;
let globalConnectionCount = 0;

// Function to get the global printer instance
export function getGlobalPrinter(): ReceiptPrinter | null {
  return globalPrinter;
}

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

    // Use global singleton instance
    if (!globalPrinter) {
      console.log('🔌 Creating global WebSocket connection...');
      globalPrinter = new ReceiptPrinter();
      globalConnectionCount = 0;
    }

    // Increment connection count
    globalConnectionCount++;
    console.log(`🔌 WebSocket connection count: ${globalConnectionCount}`);

    // Use the global instance
    printerRef.current = globalPrinter;
    
    // Set up notification callback only if not already set
    if (globalPrinter) {
      globalPrinter.onNotification((notification: OrderNotification) => {
        console.log('🎯 React hook received notification:', notification.order.orderNumber);
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      });
      
      // Connect only if not already connected
      if (!globalPrinter.getConnectionStatus()) {
        console.log('🔌 Connecting to WebSocket...');
        setConnectionStatus('connecting');
        globalPrinter.connect(jwtToken);
      } else {
        console.log('🔄 WebSocket already connected, skipping connection');
        setConnectionStatus('connected');
        setIsConnected(true);
      }
    }
    
    // Check connection status periodically
    const checkConnection = () => {
      if (globalPrinter) {
        const connected = globalPrinter.getConnectionStatus();
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      }
    };

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check immediately and then every 5 seconds
    checkConnection();
    intervalRef.current = setInterval(checkConnection, 5000);

  }, []);

  // Disconnect printer
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Decrement connection count
    globalConnectionCount = Math.max(0, globalConnectionCount - 1);
    console.log(`🔌 WebSocket connection count: ${globalConnectionCount}`);
    
    // Only disconnect if no more components are using it
    if (globalConnectionCount === 0 && globalPrinter) {
      console.log('🔌 No more components using WebSocket, disconnecting...');
      globalPrinter.disconnect();
      globalPrinter = null;
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