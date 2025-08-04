'use client';

import React, { useState, useCallback } from 'react';
import { useReceiptPrinter } from '@/lib/use-receipt-printer';
import { usePrintBridgeContext } from '@/contexts/PrintBridgeContext';
import { shouldReceivePrintNotifications, getPrintPermissionDescription } from '@/lib/print-permissions';
import { NotificationManager } from './NotificationManager';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface UnifiedStatusPanelProps {
  jwtToken: string | null;
  userRole?: string;
}

export function UnifiedStatusPanel({ jwtToken, userRole }: UnifiedStatusPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { 
    connect, 
    disconnect, 
    testNotification, 
    markAsRead, 
    notifications, 
    isConnected: wsConnected, 
    connectionStatus: wsStatus,
    printer 
  } = useReceiptPrinter();

  const { 
    isConnected: pbConnected, 
    printers, 
    defaultPrinter, 
    lastPrintResult 
  } = usePrintBridgeContext();

  // Check if user should receive print notifications
  const shouldReceivePrints = shouldReceivePrintNotifications(userRole || 'READONLY');

  React.useEffect(() => {
    if (jwtToken && shouldReceivePrints) {
      connect(jwtToken);
    } else if (!shouldReceivePrints) {
      disconnect();
    }
  }, [jwtToken, shouldReceivePrints, connect, disconnect]);

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getWsStatusIcon = () => {
    switch (wsStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getPbStatusColor = () => {
    return pbConnected 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const getPbStatusIcon = () => {
    return pbConnected ? '🖨️' : '❌';
  };

  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      markAsRead(notification.id);
    });
  }, [markAsRead, notifications]);

  const clearAllNotifications = useCallback(() => {
    // Use the clearNotifications method from the receipt printer
    if (printer) {
      printer.clearNotifications();
    }
  }, [printer]);

  if (!shouldReceivePrints) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-lg min-w-[250px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-black">🔕 No print notifications</span>
            <span className="text-xs text-black">({userRole || 'Unknown role'})</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        {!isMinimized && (
          <div className="text-xs text-black mt-1">
            {getPrintPermissionDescription(userRole || 'READONLY')}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="text-black fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[280px]">
        {/* Header with minimize button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status Panel</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {!isMinimized && (
          <div className="p-3">
            {/* WebSocket Status */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span>{getWsStatusIcon()}</span>
                  <span className="text-sm font-medium">WebSocket</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getWsStatusColor()}`}>
                  {wsStatus}
                </span>
              </div>
              
              <div className="text-xs text-black mb-2">
                Role: {userRole || 'Unknown'}
              </div>
              
              {wsConnected && (
                <button
                  onClick={testNotification}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors mb-2"
                >
                  Test Notification
                </button>
              )}
            </div>

            {/* PrintBridge Status */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getPbStatusIcon()}</span>
                  <span className="text-sm font-medium">PrintBridge</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPbStatusColor()}`}>
                  {pbConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {pbConnected && (
                <div className="text-xs space-y-1">
                  <div className="text-black">
                    Available Printers: {printers.length}
                  </div>
                  {defaultPrinter && (
                    <div className="text-black">
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
              
              {!pbConnected && (
                <div className="text-xs text-black">
                  Make sure PrintBridge server is running on localhost:8080
                </div>
              )}
            </div>

            {/* Debug Info */}
            {wsConnected && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="text-black">Debug Info:</div>
                <div>Notifications: {notifications.length}</div>
                <div>Role: {userRole}</div>
                <div>Can receive: {shouldReceivePrints ? 'Yes' : 'No'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Manager */}
      {shouldReceivePrints && (
        <NotificationManager
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />
      )}
    </>
  );
} 