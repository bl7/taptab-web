'use client';

import React, { useState } from 'react';
import { usePrintBridgeContext } from '@/contexts/PrintBridgeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const PrintBridgeStatus: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { isConnected, printers, defaultPrinter, lastPrintResult } = usePrintBridgeContext();

  const getStatusColor = () => {
    return isConnected 
      ? 'text-green-600 bg-green-100 border-green-300' 
      : 'text-red-600 bg-red-100 border-red-300';
  };

  const getStatusIcon = () => {
    return isConnected ? '🖨️' : '❌';
  };

  return (
    <div className={`fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg min-w-[250px] ${getStatusColor()}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium">PrintBridge</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="px-3 pb-3">
          {isConnected && (
            <div className="text-xs space-y-1">
              <div className="text-gray-600">
                Available Printers: {printers.length}
              </div>
              {defaultPrinter && (
                <div className="text-gray-600">
                  Default: {defaultPrinter}
                </div>
              )}
              {lastPrintResult && (
                <div className={`text-xs ${lastPrintResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  Last Print: {lastPrintResult.success ? 'Success' : 'Failed'}
                </div>
              )}
            </div>
          )}
          
          {!isConnected && (
            <div className="text-xs text-gray-600">
              Make sure PrintBridge server is running on localhost:8080
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 