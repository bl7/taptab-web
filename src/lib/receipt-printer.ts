
import { io, Socket } from 'socket.io-client';
import { ReceiptGenerator } from './receipt-generator';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  tableNumber: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  customerName: string;
  customerPhone: string;
  orderSource?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderChanges {
  addedItems: Array<{
    name: string;
    quantity: number;
    price: number;
    notes: string;
  }>;
  removedItems: Array<{
    name: string;
    quantity: number;
    price: number;
    notes: string;
  }>;
  modifiedItems: Array<{
    name: string;
    oldQuantity: number;
    newQuantity: number;
    price: number;
    notes: string;
  }>;
  modificationType: 'add' | 'remove' | 'modify' | 'mixed';
  modifiedBy: string;
}

export interface WebSocketOrderEvent {
  type: 'PRINT_RECEIPT' | 'PRINT_MODIFIED_RECEIPT';
  order: OrderData;
  timestamp: string;
  changes?: OrderChanges;
  notificationId?: string; // Add unique notification ID from backend
}

export interface OrderNotification {
  id: string;
  order: OrderData;
  timestamp: string;
  isRead: boolean;
  changes?: OrderChanges;
}

// Add interface for backend data structure
interface BackendOrderData extends OrderData {
  total?: number;
}

export class ReceiptPrinter {
  private socket: Socket | null = null;
  private jwtToken: string | null = null;
  private isConnected: boolean = false;
  private retryAttempts: number = 0;
  private maxRetries: number = 5;
  private notifications: OrderNotification[] = [];
  private onNotificationCallback?: (notification: OrderNotification) => void;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private receiptGenerator: ReceiptGenerator;
  private printBridgeWebSocket: WebSocket | null = null;
  private processedNotificationIds: Map<string, number> = new Map(); // Track notification ID with timestamp

  constructor() {
    this.socket = null;
    this.jwtToken = null;
    this.isConnected = false;
    this.receiptGenerator = new ReceiptGenerator();
  }

  // Connect to WebSocket server
  connect(jwtToken: string) {
    // Prevent multiple connections
    if (this.socket && this.isConnected) {
      console.log('🔄 Already connected to WebSocket, skipping connection attempt');
      return;
    }

    // Check connection attempts limit
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
              console.warn('⚠️ Maximum connection attempts reached, stopping connection attempts');
      return;
    }

    // Clean up existing connection
    if (this.socket) {
      console.log('🧹 Cleaning up existing WebSocket connection');
      this.socket.disconnect();
      this.socket = null;
    }

    this.jwtToken = jwtToken;
    this.connectionAttempts++;
    
    // Get WebSocket URL from environment or fallback to localhost
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5050';
    
    console.log(`🔌 Creating new WebSocket connection to ${wsUrl}... (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
    // Connect to WebSocket server
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.setupEventListeners();
    this.connectToPrintBridge();
  }

  // Connect to PrintBridge server
  private connectToPrintBridge() {
    try {
      // OS detection for PrintBridge connection
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      
      let printBridgeURL: string;
      if (platform.includes('mac') || userAgent.includes('mac')) {
        printBridgeURL = 'ws://localhost:8080';
      } else {
        printBridgeURL = 'ws://localhost:8080/ws';
      }
      
      this.printBridgeWebSocket = new WebSocket(printBridgeURL);

      this.printBridgeWebSocket.onopen = () => {
        // Connected to PrintBridge server
      };

      this.printBridgeWebSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // PrintBridge message received
        } catch (error) {
          // Error parsing PrintBridge message
        }
      };

      this.printBridgeWebSocket.onclose = () => {
        this.printBridgeWebSocket = null;
      };

      this.printBridgeWebSocket.onerror = () => {
        // PrintBridge server not running
      };
    } catch {
      // PrintBridge server not available
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('🔗 WebSocket ID:', this.socket?.id);
      console.log('🔍 Connection Details:', {
        socketId: this.socket?.id,
        isConnected: this.socket?.connected,
        eventListeners: this.socket ? 'Active' : 'None'
      });
      this.isConnected = true;
      this.retryAttempts = 0; // Reset retry attempts on successful connection
      this.connectionAttempts = 0; // Reset connection attempts on successful connection
      
      // Authenticate with JWT token
      console.log('🔐 Authenticating with JWT token...');
      this.socket?.emit('authenticate', { token: this.jwtToken });
    });

    // Authentication response
    this.socket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated successfully', data);
      console.log('🔍 Authentication Details:', {
        authenticated: true,
        data: data
      });
    });

    // Authentication error
    this.socket.on('authentication_error', (error) => {
      console.warn('⚠️ WebSocket authentication failed:', error);
      console.log('🔍 Authentication Error Details:', {
        error: error,
        jwtToken: this.jwtToken ? 'Present' : 'Missing'
      });
      this.isConnected = false;
    });

    // New order notification
    this.socket.on('newOrder', (data: WebSocketOrderEvent) => {
      console.log('🖨️ New order event received:', data);
      console.log('📋 New order details:', {
        orderNumber: data.order?.orderNumber,
        tableNumber: data.order?.tableNumber,
        items: data.order?.items?.length,
        total: data.order?.finalAmount,
        type: data.type,
        notificationId: data.notificationId
      });
      console.log('🔍 Full newOrder payload:', JSON.stringify(data, null, 2));
      
      if (data.type === 'PRINT_RECEIPT') {
        console.log('🖨️ Triggering notification for PRINT_RECEIPT (NEW ORDER)');
        console.log('🔍 Order details:', {
          orderId: data.order?.id,
          orderNumber: data.order?.orderNumber,
          notificationId: data.notificationId,
          hasChanges: !!data.changes
        });
        this.showOrderNotification(data.order, data.notificationId);
      } else if (data.type === 'PRINT_MODIFIED_RECEIPT') {
        console.log('⚠️ Received PRINT_MODIFIED_RECEIPT in newOrder event - handling as modified order');
        console.log('🔍 Backend is sending modified orders through newOrder event');
        this.showModifiedOrderNotification(data.order, data.changes, data.notificationId);
      } else {
        console.log('⚠️ Received newOrder but type is not recognized:', data.type);
      }
    });

    // Modified order notification (separate event)
    this.socket.on('orderModified', (data: WebSocketOrderEvent) => {
      console.log('🖨️ Order modified event received:', data);
      console.log('📋 Modified order details:', {
        orderNumber: data.order?.orderNumber,
        tableNumber: data.order?.tableNumber,
        items: data.order?.items?.length,
        total: data.order?.finalAmount,
        type: data.type,
        changes: data.changes,
        notificationId: data.notificationId
      });
      console.log('🔍 Full orderModified payload:', JSON.stringify(data, null, 2));
      
      // Handle the PRINT_MODIFIED_RECEIPT type
      if (data.type === 'PRINT_MODIFIED_RECEIPT') {
        console.log('🖨️ Processing PRINT_MODIFIED_RECEIPT event (MODIFIED ORDER)');
        console.log('🔍 WebSocket Event Details:');
        console.log('  - Event Type: orderModified');
        console.log('  - Order ID:', data.order?.id);
        console.log('  - Order Number:', data.order?.orderNumber);
        console.log('  - Changes Present:', !!data.changes);
        console.log('  - Changes Count:', {
          added: data.changes?.addedItems?.length || 0,
          removed: data.changes?.removedItems?.length || 0,
          modified: data.changes?.modifiedItems?.length || 0
        });
        console.log('  - Notification ID:', data.notificationId);
        
        this.showModifiedOrderNotification(data.order, data.changes, data.notificationId);
      } else {
        console.log('⚠️ Received orderModified but type is not PRINT_MODIFIED_RECEIPT:', data.type);
      }
    });

    // Listen for all events to debug
    this.socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log('🔍 WebSocket event received:', eventName, args);
      
      // Special handling for order-related events
      if (eventName === 'newOrder' || eventName === 'orderModified' || eventName === 'order_modified') {
        const eventData = args[0] as WebSocketOrderEvent;
        console.log('📋 Order event details:', {
          eventName,
          data: eventData,
          type: eventData?.type,
          orderId: eventData?.order?.id,
          changes: eventData?.changes,
          notificationId: eventData?.notificationId,
          timestamp: new Date().toISOString()
        });
        console.log('🔍 Full event payload:', JSON.stringify(eventData, null, 2));
        
        // Log if this is a modified order being sent as newOrder
        if (eventName === 'newOrder' && eventData?.type === 'PRINT_MODIFIED_RECEIPT') {
          console.log('🚨 WARNING: Backend is sending modified order as newOrder event!');
        }
      }
    });

    // Disconnection
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.isConnected = false;
    });

    // Connection error with retry logic
    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ WebSocket connection error:', error);
      this.isConnected = false;
      
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.log(`🔄 Retrying connection (${this.retryAttempts}/${this.maxRetries})...`);
        
        setTimeout(() => {
          if (this.jwtToken) {
            this.connect(this.jwtToken);
          }
        }, 2000 * this.retryAttempts); // Exponential backoff
      }
    });
  }

  // Show order notification popup
  async showOrderNotification(orderData: OrderData, notificationId?: string) {
    console.log('🖨️ New order notification for order:', orderData.orderNumber);
    console.log('📊 Notification callback set:', !!this.onNotificationCallback);
    console.log('🔍 Notification ID from backend:', notificationId);
    
    // Use unique notification ID from backend, fallback to order ID
    const uniqueId = notificationId || orderData.id;
    console.log('🔍 Using unique ID for tracking:', uniqueId);
    console.log('🔍 Current processed notification IDs:', Array.from(this.processedNotificationIds.keys()));
    
    // For new orders, we should always process them unless they have a unique notification ID
    // that was processed very recently (within 5 seconds) to prevent duplicate notifications
    const processedTime = this.processedNotificationIds.get(uniqueId);
    const timeSinceProcessed = processedTime ? Date.now() - processedTime : 0;
    const isRecentlyProcessed = timeSinceProcessed < 5 * 1000; // 5 seconds for new orders
    
    console.log('🔍 Processing details:', {
      uniqueId,
      processedTime: processedTime ? new Date(processedTime).toISOString() : 'Never',
      timeSinceProcessed: `${Math.round(timeSinceProcessed / 1000)}s`,
      isRecentlyProcessed,
      willSkip: isRecentlyProcessed && notificationId
    });
    
    // If this is a new notification ID (never processed before), always process it
    if (!processedTime && notificationId) {
      console.log('✅ New notification ID - always processing:', uniqueId);
    } else if (isRecentlyProcessed && notificationId) {
      console.log('⚠️ Notification ID processed recently, skipping:', uniqueId, `(${Math.round(timeSinceProcessed / 1000)}s ago)`);
      return;
    } else if (!notificationId) {
      console.log('✅ No notification ID from backend - always processing new order');
    } else {
      console.log('✅ Notification ID processed long ago - processing:', uniqueId, `(${Math.round(timeSinceProcessed / 1000)}s ago)`);
    }
    
    // Map backend data to our interface format
    const mappedOrderData: OrderData = {
      id: orderData.id,
      orderNumber: orderData.orderNumber || orderData.id, // Use id as orderNumber if not provided
      tableNumber: orderData.tableNumber,
      totalAmount: orderData.totalAmount || (orderData as BackendOrderData).total || 0, // Map 'total' to 'totalAmount'
      finalAmount: orderData.finalAmount || (orderData as BackendOrderData).total || 0, // Map 'total' to 'finalAmount'
      status: orderData.status,
      customerName: orderData.customerName || 'Walk-in Customer', // Default customer name
      customerPhone: orderData.customerPhone || 'No phone', // Default phone
      orderSource: orderData.orderSource || 'WAITER_ORDERING', // Default order source
      items: orderData.items || [],
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt
    };
    
    // Mark this notification ID as processed (only for new orders)
    this.processedNotificationIds.set(uniqueId, Date.now());
    console.log('✅ Marked notification ID as processed:', uniqueId);
    
    const notification: OrderNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: mappedOrderData,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications array
    this.notifications.unshift(notification);
    console.log('📝 Total notifications in memory:', this.notifications.length);
    
    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    // Trigger callback if set
    if (this.onNotificationCallback) {
      console.log('🔄 Triggering notification callback');
      this.onNotificationCallback(notification);
    } else {
      console.log('⚠️ No notification callback set');
    }

    // Show browser notification if supported
    try {
      this.showBrowserNotification(mappedOrderData);
    } catch (error) {
      console.warn('⚠️ Browser notification failed:', error);
    }

    // Print receipt via PrintBridge (with error handling)
    try {
      await this.printReceipt(mappedOrderData);
    } catch (error) {
      console.warn('⚠️ Receipt printing failed, but order was received:', error);
    }
  }

  // Show modified order notification popup
  async showModifiedOrderNotification(orderData: OrderData, changes?: OrderChanges, notificationId?: string) {
    console.log('🖨️ Modified order notification for order:', orderData.orderNumber);
    console.log('📊 Changes:', changes);
    console.log('🔍 Order ID:', orderData.id);
    console.log('🔍 Notification ID from backend:', notificationId);
    console.log('🔍 Processed notification IDs:', Array.from(this.processedNotificationIds.keys()));
    console.log('🔍 Changes summary:', {
      addedItems: changes?.addedItems?.length || 0,
      removedItems: changes?.removedItems?.length || 0,
      modifiedItems: changes?.modifiedItems?.length || 0,
      hasChanges: changes && (changes.addedItems.length > 0 || changes.removedItems.length > 0 || changes.modifiedItems.length > 0)
    });
    
    // Use unique notification ID from backend, fallback to order ID
    const uniqueId = notificationId || orderData.id;
    console.log('🔍 Using unique ID for tracking:', uniqueId);
    
    // For modified orders, we always allow notifications regardless of when the order was last processed
    // because modifications should always trigger a new notification
    const isModifiedOrder = changes && (changes.addedItems.length > 0 || changes.removedItems.length > 0 || changes.modifiedItems.length > 0);
    
    console.log('🔍 Is modified order?', isModifiedOrder);
    console.log('🔍 Notification Callback Status:', {
      callbackExists: !!this.onNotificationCallback,
      callbackType: typeof this.onNotificationCallback
    });
    
    // Always allow modified order notifications
    if (isModifiedOrder) {
      console.log('✅ Modified order - always allowing notification');
    } else {
      // For non-modified orders, check if recently processed
      const processedTime = this.processedNotificationIds.get(uniqueId);
      const timeSinceProcessed = processedTime ? Date.now() - processedTime : 0;
      const isRecentlyProcessed = timeSinceProcessed < 5 * 60 * 1000; // 5 minutes
      
      console.log('🔍 Processing Check:', {
        processedTime,
        timeSinceProcessed: Math.round(timeSinceProcessed / 1000) + 's',
        isRecentlyProcessed,
        threshold: '5 minutes'
      });
      
      if (isRecentlyProcessed) {
        console.log('⚠️ Notification ID processed recently, skipping:', uniqueId, `(${Math.round(timeSinceProcessed / 1000)}s ago)`);
        return;
      }
    }
    
    console.log('✅ Proceeding with notification');
    
    // Map backend data to our interface format
    const mappedOrderData: OrderData = {
      id: orderData.id,
      orderNumber: orderData.orderNumber || orderData.id, // Use id as orderNumber if not provided
      tableNumber: orderData.tableNumber,
      totalAmount: orderData.totalAmount || (orderData as BackendOrderData).total || 0, // Map 'total' to 'totalAmount'
      finalAmount: orderData.finalAmount || (orderData as BackendOrderData).total || 0, // Map 'total' to 'finalAmount'
      status: orderData.status,
      customerName: orderData.customerName || 'Walk-in Customer', // Default customer name
      customerPhone: orderData.customerPhone || 'No phone', // Default phone
      orderSource: orderData.orderSource || 'WAITER_ORDERING', // Default order source
      items: orderData.items || [],
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt
    };
    
    console.log('🔍 Mapped Order Data:', {
      id: mappedOrderData.id,
      orderNumber: mappedOrderData.orderNumber,
      tableNumber: mappedOrderData.tableNumber,
      finalAmount: mappedOrderData.finalAmount,
      itemsCount: mappedOrderData.items.length
    });
    
    // For modified orders, we don't add to processed IDs to allow future modifications
    // For new orders, we add to prevent duplicates
    if (!isModifiedOrder) {
      this.processedNotificationIds.set(uniqueId, Date.now());
      console.log('✅ Marked new order ID as processed:', uniqueId);
    } else {
      console.log('✅ Modified order - not adding to processed IDs to allow future modifications');
    }
    
    const notification: OrderNotification = {
      id: `modified_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: mappedOrderData,
      timestamp: new Date().toISOString(),
      isRead: false,
      changes: changes
    };

    console.log('🔍 Created Notification:', {
      id: notification.id,
      orderId: notification.order.id,
      hasChanges: !!notification.changes,
      timestamp: notification.timestamp
    });

    // Add to notifications array
    this.notifications.unshift(notification);
    console.log('📝 Total notifications in memory:', this.notifications.length);
    
    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    // Trigger callback if set
    if (this.onNotificationCallback) {
      console.log('🔄 Triggering modified order notification callback');
      console.log('🔍 Callback Details:', {
        callbackType: typeof this.onNotificationCallback,
        notificationId: notification.id,
        orderNumber: notification.order.orderNumber
      });
      this.onNotificationCallback(notification);
    } else {
      console.log('⚠️ No notification callback set - this is why no notification appears!');
      console.log('🔍 Callback Status:', {
        callbackExists: !!this.onNotificationCallback,
        callbackType: typeof this.onNotificationCallback
      });
    }

    // Show browser notification for modified order
    try {
      console.log('🔍 Attempting browser notification...');
      this.showModifiedBrowserNotification(mappedOrderData, changes);
      console.log('✅ Browser notification sent successfully');
    } catch (error) {
      console.warn('⚠️ Browser notification failed:', error);
    }

    // Print receipt via PrintBridge (with error handling)
    try {
      console.log('🔍 Attempting receipt printing...');
      await this.printReceipt(mappedOrderData, changes);
      console.log('✅ Receipt printed successfully');
    } catch (error) {
      console.warn('⚠️ Receipt printing failed, but order modification was successful:', error);
    }
  }

  // Show browser notification
  private showBrowserNotification(orderData: OrderData) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const itemsList = orderData.items.map(item => 
        `${item.menuItemName} x${item.quantity}`
      ).join(', ');

      new Notification('New Order Received!', {
        body: `Order #${orderData.orderNumber} - Table ${orderData.tableNumber}\n${itemsList}\nTotal: $${orderData.finalAmount.toFixed(2)}`,
        icon: '/icon.png',
        tag: orderData.orderNumber,
        requireInteraction: true
      });
    }
  }

  // Show modified browser notification
  private showModifiedBrowserNotification(orderData: OrderData, changes?: OrderChanges) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const itemsList = orderData.items.map(item => 
        `${item.menuItemName} x${item.quantity}`
      ).join(', ');

      let notificationBody = `Order #${orderData.orderNumber} - Table ${orderData.tableNumber}\n\nComplete Order:\n${itemsList}\n\nTotal: $${orderData.finalAmount.toFixed(2)}`;
      
      if (changes) {
        notificationBody += '\n\nChanges:';
        
        if (changes.addedItems.length > 0) {
          notificationBody += `\n➕ Added: ${changes.addedItems.map(item => `${item.name} x${item.quantity}`).join(', ')}`;
        }
        
        if (changes.removedItems.length > 0) {
          notificationBody += `\n➖ Removed: ${changes.removedItems.map(item => `${item.name} x${item.quantity}`).join(', ')}`;
        }
        
        if (changes.modifiedItems.length > 0) {
          notificationBody += `\n✏️ Modified: ${changes.modifiedItems.map(item => `${item.name} ${item.oldQuantity}→${item.newQuantity}`).join(', ')}`;
        }
      }

      new Notification('Order Modified!', {
        body: notificationBody,
        icon: '/icon.png',
        tag: `modified_${orderData.orderNumber}`,
        requireInteraction: true
      });
    }
  }

  // Set notification callback
  onNotification(callback: (notification: OrderNotification) => void) {
    // Only set callback if not already set to prevent duplicates
    if (!this.onNotificationCallback) {
      console.log('🎯 Setting notification callback');
      console.log('🔍 Callback Setup Details:', {
        callbackType: typeof callback,
        callbackExists: !!callback,
        previousCallback: !!this.onNotificationCallback
      });
      this.onNotificationCallback = callback;
    } else {
      console.log('⚠️ Notification callback already set, skipping');
      console.log('🔍 Callback Already Set Details:', {
        existingCallbackType: typeof this.onNotificationCallback,
        newCallbackType: typeof callback
      });
    }
  }

  // Get all notifications
  getNotifications(): OrderNotification[] {
    return [...this.notifications];
  }

  // Mark notification as read and remove it
  markAsRead(notificationId: string) {
    console.log('📝 Marking notification as read:', notificationId);
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications.splice(notificationIndex, 1);
      console.log('✅ Notification removed from memory');
    } else {
      console.log('⚠️ Notification not found for marking as read:', notificationId);
    }
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
    this.processedNotificationIds.clear(); // Also clear processed order IDs
    console.log('🧹 Cleared all notifications and processed order IDs');
  }

  // Clear processed order IDs (useful for testing)
  clearProcessedOrderIds() {
    this.processedNotificationIds.clear();
    console.log('🧹 Cleared processed order IDs');
  }

  // Disconnect from WebSocket
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    
    if (this.socket) {
      // Remove all event listeners
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.off('authenticated');
      this.socket.off('authentication_error');
      this.socket.off('newOrder');
      this.socket.off('orderModified'); // Added this line
      this.socket.offAny();
      
      // Disconnect the socket
      this.socket.disconnect();
      this.socket = null;
    }

    // Disconnect from PrintBridge
    if (this.printBridgeWebSocket) {
      this.printBridgeWebSocket.close();
      this.printBridgeWebSocket = null;
    }
    
    this.isConnected = false;
    this.jwtToken = null;
  }

  // Check connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Reset connection attempts (useful for manual reconnection)
  resetConnectionAttempts() {
    this.connectionAttempts = 0;
    console.log('🔄 Connection attempts reset');
  }

  // Print receipt via PrintBridge
  private async printReceipt(orderData: OrderData, changes?: OrderChanges) {
    try {
      console.log('🖨️ Generating receipt PNG for order:', orderData.orderNumber);
      
      // Generate receipt PNG
      const receiptDataURL = await this.receiptGenerator.generateReceiptPNG(orderData, changes);
      console.log('✅ Receipt PNG generated');
      
      // Get dimensions in millimeters (56mm width is standard receipt width)
      const labelWidth = 56; // 56mm receipt width
      const actualHeightPixels = this.receiptGenerator.getHeight(orderData, changes);
      const labelHeight = Math.ceil(actualHeightPixels * 25.4 / 120); // Convert pixels to mm at 120 DPI
      
      console.log('📏 Receipt dimensions:', {
        width: labelWidth + 'mm',
        height: labelHeight + 'mm',
        heightPixels: actualHeightPixels + 'px'
      });
      
      // OS-specific data format
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      const isMac = platform.includes('mac') || userAgent.includes('mac');
      
      let printData: { type?: string; images?: string[]; labelWidth?: number; labelHeight?: number; image?: string; selectedPrinter: string };
      if (isMac) {
        // Mac format: base64-only image
        const base64Only = receiptDataURL.replace('data:image/png;base64,', '');
        printData = {
          type: 'print',
          images: [base64Only],
          selectedPrinter: "Receipt Printer"
        };
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer"
        };
      }
      
      // Send to PrintBridge if connected
      if (this.printBridgeWebSocket && this.printBridgeWebSocket.readyState === WebSocket.OPEN) {
        this.printBridgeWebSocket.send(JSON.stringify(printData));
      }
    } catch (error) {
      console.warn('⚠️ Error printing receipt:', error);
    }
  }

  // Test notification function for debugging
  testNotification() {
    const testOrder: OrderData = {
      id: 'test_order_123',
      orderNumber: 'TEST-001',
      tableNumber: '5',
      totalAmount: 25.50,
      finalAmount: 25.50,
      status: 'PENDING',
      customerName: 'Test Customer',
      customerPhone: '1234567890',
      items: [
        {
          id: 'test_item_1',
          menuItemId: 'item_1',
          menuItemName: 'Burger',
          quantity: 2,
          price: 12.75,
          total: 25.50,
          notes: 'No onions please'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.showOrderNotification(testOrder);
  }
} 