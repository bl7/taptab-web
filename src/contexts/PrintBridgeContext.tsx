'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePrintBridge } from '@/lib/use-print-bridge';

interface PrintBridgeContextType {
  isConnected: boolean;
  printers: string[];
  defaultPrinter: string;
  lastPrintResult: { success?: boolean; message?: string; errorMessage?: string } | null;
  sendPrintJob: (base64Image: string) => boolean;
}

const PrintBridgeContext = createContext<PrintBridgeContextType | undefined>(undefined);

export const PrintBridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const printBridge = usePrintBridge();

  return (
    <PrintBridgeContext.Provider value={printBridge}>
      {children}
    </PrintBridgeContext.Provider>
  );
};

export const usePrintBridgeContext = () => {
  const context = useContext(PrintBridgeContext);
  if (context === undefined) {
    throw new Error('usePrintBridgeContext must be used within a PrintBridgeProvider');
  }
  return context;
}; 