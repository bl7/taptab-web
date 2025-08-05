import { useState, useEffect, useRef, useCallback } from 'react';

// Simple OS detection for PrintBridge connection
const getPrintBridgeURL = (): string => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'ws://localhost:8080';
  } else {
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
      const ws = new WebSocket(printBridgeURL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: PrintBridgeMessage = JSON.parse(event.data);

          if (data.type === 'connection') {
            setPrinters(data.printers || []);
            setDefaultPrinter(data.defaultPrinter || '');
          }

          if (data.success !== undefined) {
            setLastPrintResult(data);
          }
        } catch {
          // Error parsing PrintBridge message
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setPrinters([]);
        setDefaultPrinter('');
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
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
      wsRef.current.send(base64Image);
      return true;
    } else {
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