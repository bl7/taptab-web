import React, { useState } from "react";
import { useReceiptPrinter } from "@/lib/use-receipt-printer";
import {
  shouldReceivePrintNotifications,
  getPrintPermissionDescription,
} from "@/lib/print-permissions";
import { NotificationManager } from "./NotificationManager";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WebSocketStatusProps {
  jwtToken: string | null;
  userRole?: string;
}

export function WebSocketStatus({ jwtToken, userRole }: WebSocketStatusProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const {
    connect,
    disconnect,
    testNotification,
    markAsRead,
    notifications,
    isConnected,
    connectionStatus,
  } = useReceiptPrinter();

  // Check if user should receive print notifications
  const shouldReceivePrints = shouldReceivePrintNotifications(
    userRole || "READONLY"
  );

  React.useEffect(() => {
    if (jwtToken && shouldReceivePrints) {
      connect(jwtToken);
    } else if (!shouldReceivePrints) {
      disconnect();
    }
  }, [jwtToken, shouldReceivePrints, connect, disconnect]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600 bg-green-100";
      case "connecting":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return "🟢";
      case "connecting":
        return "🟡";
      case "error":
        return "🔴";
      default:
        return "⚪";
    }
  };

  if (!shouldReceivePrints) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              🔕 No print notifications
            </span>
            <span className="text-xs text-gray-500">
              ({userRole || "Unknown role"})
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
        {!isMinimized && (
          <div className="text-xs text-gray-500 mt-1">
            {getPrintPermissionDescription(userRole || "READONLY")}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px]">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <span>{getStatusIcon()}</span>
            <span className="text-sm text-black font-medium">
              Receipt Printer
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}
            >
              {connectionStatus}
            </span>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="px-3 pb-3">
            <div className="text-xs text-gray-600 mb-2">
              Role: {userRole || "Unknown"}
            </div>

            {isConnected && (
              <button
                onClick={testNotification}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                Test Notification
              </button>
            )}

            {/* Debug Info */}
            {isConnected && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                <div className="text-white">Debug Info:</div>
                <div>Notifications: {notifications.length}</div>
                <div>Role: {userRole}</div>
                <div>Can receive: {shouldReceivePrints ? "Yes" : "No"}</div>
              </div>
            )}

            {!isConnected && (
              <button
                onClick={() => jwtToken && connect(jwtToken)}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                🔄 Retry Connection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification Manager */}
      {shouldReceivePrints && (
        <NotificationManager
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={() => {
            notifications.forEach((notification) => {
              markAsRead(notification.id);
            });
          }}
          onClearAll={() => {
            // Clear all notifications
            notifications.forEach((notification) => {
              markAsRead(notification.id);
            });
          }}
        />
      )}
    </>
  );
}
