"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useReceiptPrinter } from "@/lib/use-receipt-printer";
import { usePrintBridgeContext } from "@/contexts/PrintBridgeContext";
import { shouldReceivePrintNotifications } from "@/lib/print-permissions";
import { NotificationManager } from "./NotificationManager";
import { Bell, Wifi, Printer, ChevronDown, ChevronUp, X } from "lucide-react";

interface DashboardHeaderProps {
  jwtToken: string | null;
  userRole?: string;
}

export function DashboardHeader({ jwtToken, userRole }: DashboardHeaderProps) {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<{ play: () => void } | null>(null);

  // Check if user should see the header (only tenant admin and kitchen)
  const shouldShowHeader =
    userRole === "TENANT_ADMIN" || userRole === "KITCHEN";

  const {
    connect,
    disconnect,
    testNotification,
    markAsRead,
    notifications,
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    printer,
  } = useReceiptPrinter();

  const {
    isConnected: pbConnected,
    printers,
    defaultPrinter,
  } = usePrintBridgeContext();

  // Check if user should receive print notifications
  const shouldReceivePrints = shouldReceivePrintNotifications(
    userRole || "READONLY"
  );

  // Initialize audio element with a simple notification sound
  useEffect(() => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (
        window as Window &
          typeof globalThis & { webkitAudioContext?: typeof AudioContext }
      ).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Store the audio context for reuse
    audioRef.current = {
      play: () => {
        try {
          const newOscillator = audioContext.createOscillator();
          const newGainNode = audioContext.createGain();

          newOscillator.connect(newGainNode);
          newGainNode.connect(audioContext.destination);

          newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          newOscillator.frequency.setValueAtTime(
            600,
            audioContext.currentTime + 0.1
          );
          newOscillator.frequency.setValueAtTime(
            800,
            audioContext.currentTime + 0.2
          );

          newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          newGainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );

          newOscillator.start(audioContext.currentTime);
          newOscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.log("thisbitch", "Audio play failed:", error);
        }
      },
    };
  }, []);

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0 && shouldReceivePrints) {
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      if (unreadCount > 0 && audioRef.current) {
        audioRef.current.play();
      }
    }
  }, [notifications, shouldReceivePrints]);

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
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPanel(false);
      }
    };

    if (showNotificationPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPanel]);

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPbStatusColor = () => {
    return pbConnected ? "text-green-600" : "text-red-600";
  };

  // Click outside handler for status details dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setShowStatusDetails(false);
      }
    };

    if (showStatusDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDetails]);

  const markAllAsRead = useCallback(() => {
    notifications.forEach((notification) => {
      markAsRead(notification.id);
    });
  }, [markAsRead, notifications]);

  const clearAllNotifications = useCallback(() => {
    if (printer) {
      printer.clearNotifications();
    }
  }, [printer]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // If user shouldn't see header, return null (header doesn't exist)
  if (!shouldShowHeader) {
    console.log("thisbitch", "Header hidden for user role:", userRole);
    return null;
  }

  return (
    <>
      <div className="h-full flex flex-col items-center py-4 space-y-4">
        {/* Status Indicators - Vertical Stack */}
        <div className="flex flex-col items-center space-y-3">
          {/* WebSocket Status */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
            title={`WebSocket: ${wsStatus}`}
          >
            <Wifi className={`h-5 w-5 ${getWsStatusColor()}`} />
          </div>

          {/* PrintBridge Status */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
            title={`PrintBridge: ${pbConnected ? "Connected" : "Disconnected"}`}
          >
            <Printer className={`h-5 w-5 ${getPbStatusColor()}`} />
          </div>

          {/* Status Details Toggle */}
          <button
            onClick={() => setShowStatusDetails(!showStatusDetails)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Toggle status details"
          >
            {showStatusDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-gray-300"></div>

        {/* Notification Bell */}
        {shouldReceivePrints && (
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            title={`${unreadCount} unread notifications`}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Test Notification Button */}
        {shouldReceivePrints && wsConnected && (
          <button
            onClick={() => {
              testNotification();
              // Also play sound immediately for testing
              if (audioRef.current) {
                audioRef.current.play();
              }
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            title="Test notification"
          >
            <span className="text-xs font-bold">T</span>
          </button>
        )}
      </div>

      {/* Status Details Panel */}
      {showStatusDetails && (
        <div
          ref={statusRef}
          className="fixed top-4 left-20 w-80 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-xl z-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WebSocket Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                WebSocket Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Connection:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    wsStatus === "connected"
                      ? "bg-green-100 text-green-700"
                      : wsStatus === "connecting"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {wsStatus}
                </span>
              </div>
            </div>

            {/* PrintBridge Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                PrintBridge Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Connection:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    pbConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {pbConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {pbConnected && (
                <div className="text-xs text-gray-600">
                  {printers.length} printer{printers.length !== 1 ? "s" : ""}
                  {defaultPrinter && ` • ${defaultPrinter}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && shouldReceivePrints && (
        <div
          className="fixed top-4 left-20 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden z-50"
          ref={panelRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-xs text-red-600 hover:text-red-700"
                title="Clear all notifications"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowNotificationPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <NotificationManager
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
