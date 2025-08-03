import { useState, useEffect, useRef, useCallback } from 'react';

// Simple OS detection for PrintBridge connection
const getPrintBridgeURL = (): string => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (platform.includes('mac') || userAgent.includes('mac')) {
    console.log('🖥️ Mac detected - using ws://localhost:8080');
    return 'ws://localhost:8080';
  } else {
    console.log('🖥️ Windows/Linux detected - using ws://localhost:8080/ws');
    return 'ws://localhost:8080/ws';
  }
};

interface PrintBridgeMessage {
  type?: string;
  status?: string;
  message?: string;
  printers?: string[];
  defaultPrinter?: string;
  success?: boolean;
  printerName?: string;
  errorMessage?: string;
}

export const usePrintBridge = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState<string>('');
  const [lastPrintResult, setLastPrintResult] = useState<{ success?: boolean; message?: string; errorMessage?: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const printBridgeURL = getPrintBridgeURL();
      console.log('🔌 Connecting to PrintBridge server...');
      const ws = new WebSocket(printBridgeURL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to PrintBridge server');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: PrintBridgeMessage = JSON.parse(event.data);
          console.log('📨 PrintBridge received:', data);

          if (data.type === 'connection') {
            setPrinters(data.printers || []);
            setDefaultPrinter(data.defaultPrinter || '');
            console.log('🖨️ Printers discovered:', data.printers);
          }

          if (data.success !== undefined) {
            setLastPrintResult(data);
            console.log('🖨️ Print job result:', data);
          }
        } catch (error) {
          console.error('❌ Error parsing PrintBridge message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 Disconnected from PrintBridge');
        setIsConnected(false);
        setPrinters([]);
        setDefaultPrinter('');
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        console.warn('⚠️ PrintBridge server not running on localhost:8080');
        console.log('💡 To enable printing, start the PrintBridge server');
        setIsConnected(false);
      };
    } catch {
      console.warn('⚠️ PrintBridge server not available');
      console.log('💡 To enable printing, start the PrintBridge server');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const sendPrintJob = (base64Image: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🖨️ Sending print job to PrintBridge...');
      wsRef.current.send(base64Image);
      return true;
    } else {
      console.warn('⚠️ PrintBridge not connected - print job skipped');
      return false;
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    printers,
    defaultPrinter,
    lastPrintResult,
    sendPrintJob,
    connect,
    disconnect
  };
}; 