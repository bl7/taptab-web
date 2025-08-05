'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReceiptPrinter } from '@/lib/use-receipt-printer';
import { usePrintBridgeContext } from '@/contexts/PrintBridgeContext';
import { shouldReceivePrintNotifications } from '@/lib/print-permissions';
import { NotificationManager } from './NotificationManager';
import { Bell, Wifi, Printer, ChevronDown, ChevronUp, X, Check, Trash2 } from 'lucide-react';

interface UnifiedStatusPanelProps {
  jwtToken: string | null;
  userRole?: string;
}

export function UnifiedStatusPanel({ jwtToken, userRole }: UnifiedStatusPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
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
    defaultPrinter
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

  // Click outside handler for notification panel
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

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPbStatusColor = () => {
    return pbConnected ? 'text-green-600' : 'text-red-600';
  };

  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      markAsRead(notification.id);
    });
  }, [markAsRead, notifications]);

  const clearAllNotifications = useCallback(() => {
    if (printer) {
      printer.clearNotifications();
    }
  }, [printer]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!shouldReceivePrints) {
    return (
      <div className="fixed top-0 right-0 bg-white border border-gray-300 rounded-bl-lg p-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">🔕 No print notifications</span>
          <span className="text-xs text-gray-500">({userRole || 'Unknown role'})</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Compact Status Panel */}
      <div className="fixed top-0 right-0 bg-white border border-gray-300 rounded-bl-lg shadow-lg">
        <div className="flex items-center space-x-2 p-2">
          {/* WebSocket Status Icon */}
          <div className="flex items-center space-x-1" title={`WebSocket: ${wsStatus}`}>
            <Wifi className={`h-4 w-4 ${getWsStatusColor()}`} />
          </div>

          {/* PrintBridge Status Icon */}
          <div className="flex items-center space-x-1" title={`PrintBridge: ${pbConnected ? 'Connected' : 'Disconnected'}`}>
            <Printer className={`h-4 w-4 ${getPbStatusColor()}`} />
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-300"></div>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative p-1 hover:bg-gray-100 rounded transition-colors"
            title={`${unreadCount} unread notifications`}
          >
            <Bell className="h-4 w-4 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Expanded Details */}
        {!isMinimized && (
          <div className="border-t border-gray-200 p-2 space-y-2">
            {/* WebSocket Details */}
            <div className="text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">WebSocket:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  wsStatus === 'connected' ? 'bg-green-100 text-green-700' :
                  wsStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {wsStatus}
                </span>
              </div>
            </div>

            {/* PrintBridge Details */}
            <div className="text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">PrintBridge:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  pbConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {pbConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {pbConnected && (
                <div className="text-gray-500 mt-1">
                  {printers.length} printer{printers.length !== 1 ? 's' : ''}
                  {defaultPrinter && ` • ${defaultPrinter}`}
                </div>
              )}
            </div>

            {/* Test Button */}
            {wsConnected && (
              <button
                onClick={testNotification}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                Test Notification
              </button>
            )}
          </div>
        )}

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden" ref={panelRef}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium ${
                            notification.changes ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {notification.changes ? 'Order Modified' : 'New Order'}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-800 truncate">
                          Order #{notification.order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Table {notification.order.tableNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${notification.order.finalAmount.toFixed(2)}
                        </div>
                        {notification.changes && (
                          <div className="mt-1 text-xs text-gray-600">
                            {notification.changes.addedItems?.length > 0 && (
                              <span className="text-green-600">+{notification.changes.addedItems.length} added</span>
                            )}
                            {notification.changes.removedItems?.length > 0 && (
                              <span className="text-red-600 ml-2">-{notification.changes.removedItems.length} removed</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Manager for popup notifications */}
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