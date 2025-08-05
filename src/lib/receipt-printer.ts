
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
  waiterName?: string;
  sourceDetails?: string;
  waiterId?: string;
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
        console.log('🔌 PrintBridge WebSocket connected successfully');
      };

      this.printBridgeWebSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 PrintBridge message received:', data);
        } catch (error) {
          console.warn('⚠️ Error parsing PrintBridge message:', error);
        }
      };

      this.printBridgeWebSocket.onclose = () => {
        console.log('🔌 PrintBridge WebSocket disconnected');
        this.printBridgeWebSocket = null;
      };

      this.printBridgeWebSocket.onerror = () => {
        console.warn('⚠️ PrintBridge WebSocket connection error');
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
      this.isConnected = true;
      this.retryAttempts = 0;
      this.connectionAttempts = 0;
      
      // Authenticate with JWT token
      console.log('🔐 Authenticating with JWT token...');
      this.socket?.emit('authenticate', { token: this.jwtToken });
    });

    // Authentication response
    this.socket.on('authenticated', () => {
      console.log('✅ WebSocket authenticated successfully');
    });

    // Authentication error
    this.socket.on('authentication_error', (error) => {
      console.warn('⚠️ WebSocket authentication failed:', error);
      this.isConnected = false;
    });

    // NEW ORDER EVENT HANDLER
    // Backend sends: newOrder event with type: "PRINT_RECEIPT"
    this.socket.on('newOrder', (data: WebSocketOrderEvent) => {
      console.log('🖨️ New order event received');
      console.log('📋 Event details:', {
        type: data.type,
        orderId: data.order?.id,
        notificationId: data.notificationId,
        itemsCount: data.order?.items?.length,
        total: (data.order as BackendOrderData)?.total || data.order?.finalAmount
      });
      
      // Only process PRINT_RECEIPT type for new orders
      if (data.type === 'PRINT_RECEIPT') {
        console.log('✅ Processing new order notification');
        this.processNewOrderNotification(data.order, data.notificationId);
      } else {
        console.log('⚠️ Ignoring newOrder event with unexpected type:', data.type);
      }
    });

    // MODIFIED ORDER EVENT HANDLER
    // Backend sends: orderModified event with type: "PRINT_MODIFIED_RECEIPT"
    this.socket.on('orderModified', (data: WebSocketOrderEvent) => {
      console.log('🔄 Order modified event received');
      console.log('📋 Event details:', {
        type: data.type,
        orderId: data.order?.id,
        notificationId: data.notificationId,
        hasChanges: !!data.changes,
        changesType: data.changes?.modificationType
      });
      
      // Only process PRINT_MODIFIED_RECEIPT type for modified orders
      if (data.type === 'PRINT_MODIFIED_RECEIPT') {
        console.log('✅ Processing modified order notification');
        this.processModifiedOrderNotification(data.order, data.changes, data.notificationId);
      } else {
        console.log('⚠️ Ignoring orderModified event with unexpected type:', data.type);
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
      
      // Implement exponential backoff retry
      if (this.retryAttempts < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
        console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.retryAttempts + 1}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.retryAttempts++;
          this.connect(this.jwtToken!);
        }, delay);
      } else {
        console.error('❌ Max retry attempts reached. Connection failed.');
      }
    });
  }

  // Process new order notification (PRINT_RECEIPT)
  private async processNewOrderNotification(orderData: OrderData, notificationId?: string) {
    console.log('🖨️ Processing new order notification');
    console.log('📋 Order details:', {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      notificationId: notificationId,
      itemsCount: orderData.items?.length,
      total: (orderData as BackendOrderData)?.total || orderData.finalAmount
    });

    // Validate notification ID
    if (!notificationId) {
      console.warn('⚠️ No notification ID provided for new order');
      return;
    }

    // Check for duplicate processing
    if (this.isNotificationProcessed(notificationId)) {
      console.log('⚠️ Notification already processed, skipping:', notificationId);
      return;
    }

    // Mark as processed immediately to prevent duplicates
    this.markNotificationAsProcessed(notificationId);
    console.log('✅ Marked notification as processed:', notificationId);

    // Map backend data to our interface
    const mappedOrderData = this.mapBackendOrderData(orderData);
    
    // Create notification
    const notification: OrderNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: mappedOrderData,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications array
    this.addNotification(notification);
    console.log('📝 Added new order notification to list');

    // Trigger callback
    if (this.onNotificationCallback) {
      console.log('🔄 Triggering notification callback');
      this.onNotificationCallback(notification);
    }

    // Show browser notification
    this.showBrowserNotification(mappedOrderData);

    // Print receipt
    try {
      console.log('🖨️ Attempting to print receipt for new order...');
      await this.printReceipt(mappedOrderData);
      console.log('✅ Receipt printing completed for new order');
    } catch (error) {
      console.error('❌ Receipt printing failed for new order:', error);
    }
  }

  // Process modified order notification (PRINT_MODIFIED_RECEIPT)
  private async processModifiedOrderNotification(orderData: OrderData, changes?: OrderChanges, notificationId?: string) {
    console.log('🔄 Processing modified order notification');
    console.log('📋 Order details:', {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      notificationId: notificationId,
      changesType: changes?.modificationType,
      hasChanges: !!changes
    });

    // Validate changes object
    if (!changes) {
      console.warn('⚠️ No changes object provided for modified order');
      return;
    }

    // Validate notification ID
    if (!notificationId) {
      console.warn('⚠️ No notification ID provided for modified order');
      return;
    }

    // Check for duplicate processing
    if (this.isNotificationProcessed(notificationId)) {
      console.log('⚠️ Notification already processed, skipping:', notificationId);
      return;
    }

    // Mark as processed immediately to prevent duplicates
    this.markNotificationAsProcessed(notificationId);
    console.log('✅ Marked notification as processed:', notificationId);

    // Map backend data to our interface
    const mappedOrderData = this.mapBackendOrderData(orderData);
    
    // Create notification with changes
    const notification: OrderNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: mappedOrderData,
      timestamp: new Date().toISOString(),
      isRead: false,
      changes: changes
    };

    // Add to notifications array
    this.addNotification(notification);
    console.log('📝 Added modified order notification to list');

    // Trigger callback
    if (this.onNotificationCallback) {
      console.log('🔄 Triggering notification callback');
      this.onNotificationCallback(notification);
    }

    // Show browser notification
    this.showModifiedBrowserNotification(mappedOrderData, changes);

    // Print receipt
    try {
      console.log('🖨️ Attempting to print receipt for modified order...');
      await this.printReceipt(mappedOrderData, changes);
      console.log('✅ Receipt printing completed for modified order');
    } catch (error) {
      console.error('❌ Receipt printing failed for modified order:', error);
    }
  }

  // Check if notification was already processed
  private isNotificationProcessed(notificationId: string): boolean {
    const processedTime = this.processedNotificationIds.get(notificationId);
    if (!processedTime) return false;
    
    const timeSinceProcessed = Date.now() - processedTime;
    const isRecentlyProcessed = timeSinceProcessed < 10 * 1000; // 10 seconds
    
    if (isRecentlyProcessed) {
      console.log('⚠️ Notification processed recently:', notificationId, `(${Math.round(timeSinceProcessed / 1000)}s ago)`);
      return true;
    }
    
    return false;
  }

  // Mark notification as processed
  private markNotificationAsProcessed(notificationId: string): void {
    this.processedNotificationIds.set(notificationId, Date.now());
    
    // Clean up old entries (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [id, timestamp] of this.processedNotificationIds.entries()) {
      if (timestamp < oneHourAgo) {
        this.processedNotificationIds.delete(id);
      }
    }
  }

  // Map backend order data to our interface
  private mapBackendOrderData(orderData: OrderData): OrderData {
    // Debug waiter data
    console.log('LOOKFORTHIS 🔍 Waiter Data Debug:', {
      waiterName: orderData.waiterName,
      sourceDetails: orderData.sourceDetails,
      waiterId: orderData.waiterId,
      hasWaiterName: !!orderData.waiterName,
      hasSourceDetails: !!orderData.sourceDetails,
      fallbackName: orderData.waiterName || orderData.sourceDetails || 'Unknown Waiter',
      orderKeys: Object.keys(orderData),
      orderId: orderData.id,
      tableNumber: orderData.tableNumber
    });

    return {
      id: orderData.id,
      orderNumber: orderData.orderNumber || orderData.id,
      tableNumber: orderData.tableNumber,
      totalAmount: orderData.totalAmount || (orderData as BackendOrderData).total || 0,
      finalAmount: orderData.finalAmount || (orderData as BackendOrderData).total || 0,
      status: orderData.status,
      customerName: orderData.customerName || 'Walk-in Customer',
      customerPhone: orderData.customerPhone || 'No phone',
      orderSource: orderData.orderSource || 'WAITER_ORDERING',
      waiterName: orderData.waiterName,
      sourceDetails: orderData.sourceDetails,
      waiterId: orderData.waiterId,
      items: orderData.items || [],
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt
    };
  }

  // Add notification to list with proper management
  private addNotification(notification: OrderNotification): void {
    // Check if notification already exists to prevent duplicates
    const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
    if (existingIndex !== -1) {
      console.log('⚠️ Notification already exists, skipping:', notification.id);
      return;
    }
    
    this.notifications.unshift(notification);
    
    // Keep only last 20 notifications
    if (this.notifications.length > 20) {
      this.notifications = this.notifications.slice(0, 20);
    }
    
    console.log('📊 Total notifications in memory:', this.notifications.length);
  }

  // Show order notification popup


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
        
        if (changes.addedItems && changes.addedItems.length > 0) {
          notificationBody += `\n➕ Added: ${changes.addedItems.map(item => `${item.name} x${item.quantity}`).join(', ')}`;
        }
        
        if (changes.removedItems && changes.removedItems.length > 0) {
          notificationBody += `\n➖ Removed: ${changes.removedItems.map(item => `${item.name} x${item.quantity}`).join(', ')}`;
        }
        
        if (changes.modifiedItems && changes.modifiedItems.length > 0) {
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
      // Mark as read instead of removing
      this.notifications[notificationIndex].isRead = true;
      console.log('✅ Notification marked as read');
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

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    console.log('✅ All notifications marked as read');
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

  // Check PrintBridge connection status
  getPrintBridgeStatus(): { connected: boolean; readyState?: number } {
    return {
      connected: !!(this.printBridgeWebSocket && this.printBridgeWebSocket.readyState === WebSocket.OPEN),
      readyState: this.printBridgeWebSocket?.readyState
    };
  }

  // Reset connection attempts (useful for manual reconnection)
  resetConnectionAttempts() {
    this.connectionAttempts = 0;
    console.log('🔄 Connection attempts reset');
  }

  // Print receipt via PrintBridge
  private async printReceipt(orderData: OrderData, changes?: OrderChanges) {
    try {
      console.log('🖨️ Starting receipt printing process for order:', orderData.orderNumber);
      console.log('🔍 Print details:', {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        hasChanges: !!changes,
        changesType: changes?.modificationType
      });
      
      // Generate receipt PNG
      console.log('📄 Generating receipt PNG...');
      const receiptDataURL = await this.receiptGenerator.generateReceiptPNG(orderData, changes);
      console.log('✅ Receipt PNG generated successfully');
      
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
        console.log('🍎 Using Mac format for PrintBridge');
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer"
        };
        console.log('🪟 Using Windows/Linux format for PrintBridge');
      }
      
      // Check PrintBridge connection status
      console.log('🔌 PrintBridge connection status:', {
        exists: !!this.printBridgeWebSocket,
        readyState: this.printBridgeWebSocket?.readyState,
        isOpen: this.printBridgeWebSocket?.readyState === WebSocket.OPEN
      });
      
      // Send to PrintBridge if connected
      if (this.printBridgeWebSocket && this.printBridgeWebSocket.readyState === WebSocket.OPEN) {
        console.log('📤 Sending receipt to PrintBridge...');
        this.printBridgeWebSocket.send(JSON.stringify(printData));
        console.log('✅ Receipt sent to PrintBridge successfully');
      } else {
        console.warn('⚠️ PrintBridge not connected - receipt not printed');
        console.log('💡 To enable receipt printing, ensure PrintBridge server is running on localhost:8080');
      }
    } catch (error) {
      console.error('❌ Error printing receipt:', error);
      console.log('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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

    // Use the new robust notification system
    this.processNewOrderNotification(testOrder, `test_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }

  // Test receipt printing function for debugging
  testReceiptPrinting() {
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

    console.log('🧪 Testing receipt printing...');
    console.log('🔍 PrintBridge status:', this.getPrintBridgeStatus());
    this.printReceipt(testOrder);
  }
} 