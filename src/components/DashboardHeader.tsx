'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReceiptPrinter } from '@/lib/use-receipt-printer';
import { usePrintBridgeContext } from '@/contexts/PrintBridgeContext';
import { shouldReceivePrintNotifications } from '@/lib/print-permissions';
import { NotificationManager } from './NotificationManager';
import { Bell, Wifi, Printer, ChevronDown, ChevronUp, X } from 'lucide-react';

interface DashboardHeaderProps {
  jwtToken: string | null;
  userRole?: string;
}

export function DashboardHeader({ jwtToken, userRole }: DashboardHeaderProps) {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
  const [title, setTitle] = useState<string>('Dashboard');
  const [subtitle, setSubtitle] = useState<string>('Manage your restaurant operations');
  const panelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Initialize audio element with a simple notification sound
  useEffect(() => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
         // Store the audio context for reuse
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     audioRef.current = { play: () => {
      const newOscillator = audioContext.createOscillator();
      const newGainNode = audioContext.createGain();
      
      newOscillator.connect(newGainNode);
      newGainNode.connect(audioContext.destination);
      
      newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      newOscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      newOscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      newOscillator.start(audioContext.currentTime);
      newOscillator.stop(audioContext.currentTime + 0.3);
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
     } } as any;
  }, []);

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0 && shouldReceivePrints) {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      if (unreadCount > 0 && audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log('thisbitch', 'Audio play failed:', error);
        });
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

  // Set title based on current route
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/analytics')) {
      setTitle('Analytics');
      setSubtitle('View detailed restaurant analytics and insights');
    } else if (pathname.includes('/orders')) {
      setTitle('Orders');
      setSubtitle('Manage and track restaurant orders');
    } else if (pathname.includes('/menu')) {
      setTitle('Menu Management');
      setSubtitle('Manage your restaurant menu items');
    } else if (pathname.includes('/staff')) {
      setTitle('Staff Management');
      setSubtitle('Manage restaurant staff and roles');
    } else if (pathname.includes('/tables')) {
      setTitle('Table Management');
      setSubtitle('Manage restaurant tables and seating');
    } else if (pathname.includes('/settings')) {
      setTitle('Settings');
      setSubtitle('Configure restaurant settings');
    } else if (pathname.includes('/order-taking')) {
      setTitle('Order Taking');
      setSubtitle('Take orders from customers');
    } else {
      setTitle('Dashboard');
      setSubtitle('Manage your restaurant operations');
    }
  }, []);

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

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Title and subtitle */}
        <div className="flex-1">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Right side - Status indicators and notifications */}
        <div className="flex items-center space-x-4">
          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            {/* WebSocket Status */}
            <div className="flex items-center space-x-1" title={`WebSocket: ${wsStatus}`}>
              <Wifi className={`h-4 w-4 ${getWsStatusColor()}`} />
              {showStatusDetails && (
                <span className="text-xs text-gray-600">{wsStatus}</span>
              )}
            </div>

            {/* PrintBridge Status */}
            <div className="flex items-center space-x-1" title={`PrintBridge: ${pbConnected ? 'Connected' : 'Disconnected'}`}>
              <Printer className={`h-4 w-4 ${getPbStatusColor()}`} />
              {showStatusDetails && (
                <span className="text-xs text-gray-600">
                  {pbConnected ? 'Connected' : 'Disconnected'}
                </span>
              )}
            </div>

            {/* Status Details Toggle */}
            <button
              onClick={() => setShowStatusDetails(!showStatusDetails)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title="Toggle status details"
            >
              {showStatusDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Notification Bell */}
          {shouldReceivePrints && (
            <button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={`${unreadCount} unread notifications`}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                  audioRef.current.play().catch(error => {
                    console.log('thisbitch', 'Test audio play failed:', error);
                  });
                }
              }}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
              title="Test notification"
            >
              Test
            </button>
          )}
        </div>
      </div>

      {/* Status Details Panel */}
      {showStatusDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WebSocket Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">WebSocket Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Connection:</span>
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
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">PrintBridge Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Connection:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  pbConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {pbConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {pbConnected && (
                <div className="text-xs text-gray-600">
                  {printers.length} printer{printers.length !== 1 ? 's' : ''}
                  {defaultPrinter && ` • ${defaultPrinter}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && shouldReceivePrints && (
        <div className="absolute top-full right-6 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden z-50" ref={panelRef}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
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
    </div>
  );
} 