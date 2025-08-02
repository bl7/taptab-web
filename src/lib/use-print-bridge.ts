import { useState, useEffect, useRef, useCallback } from 'react';

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
      console.log('🔌 Connecting to PrintBridge server...');
      const ws = new WebSocket('ws://localhost:8080/ws');
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

      ws.onerror = (error) => {
        console.error('❌ PrintBridge WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('❌ PrintBridge connection error:', error);
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
      console.error('❌ PrintBridge WebSocket not connected');
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