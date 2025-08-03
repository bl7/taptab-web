
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

export interface WebSocketOrderEvent {
  type: 'PRINT_RECEIPT';
  order: OrderData;
  timestamp: string;
}

export interface OrderNotification {
  id: string;
  order: OrderData;
  timestamp: string;
  isRead: boolean;
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
        console.log('🖥️ Mac detected - using ws://localhost:8080');
        printBridgeURL = 'ws://localhost:8080';
      } else {
        console.log('🖥️ Windows/Linux detected - using ws://localhost:8080/ws');
        printBridgeURL = 'ws://localhost:8080/ws';
      }
      
      console.log('🔌 Connecting to PrintBridge server...');
      this.printBridgeWebSocket = new WebSocket(printBridgeURL);

      this.printBridgeWebSocket.onopen = () => {
        console.log('✅ Connected to PrintBridge server');
      };

      this.printBridgeWebSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 PrintBridge received:', data);
        } catch (error) {
          console.warn('⚠️ Error parsing PrintBridge message:', error);
        }
      };

      this.printBridgeWebSocket.onclose = () => {
        console.log('🔌 Disconnected from PrintBridge');
        this.printBridgeWebSocket = null;
      };

      this.printBridgeWebSocket.onerror = () => {
        console.warn('⚠️ PrintBridge server not running on localhost:8080');
        console.log('💡 To enable receipt printing, start the PrintBridge server');
      };
    } catch (error) {
      console.warn('⚠️ PrintBridge server not available');
      console.log('💡 To enable receipt printing, start the PrintBridge server');
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
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
    });

    // Authentication error
    this.socket.on('authentication_error', (error) => {
      console.warn('⚠️ WebSocket authentication failed:', error);
      this.isConnected = false;
    });

    // New order notification (for printing)
    this.socket.on('newOrder', (data: WebSocketOrderEvent) => {
      console.log('🖨️ New order received for printing:', data);
      console.log('📋 Order details:', {
        orderNumber: data.order?.orderNumber,
        tableNumber: data.order?.tableNumber,
        items: data.order?.items?.length,
        total: data.order?.finalAmount
      });
      
      if (data.type === 'PRINT_RECEIPT') {
        console.log('🖨️ Triggering notification for PRINT_RECEIPT');
        this.showOrderNotification(data.order);
      } else {
        console.log('⚠️ Received newOrder but type is not PRINT_RECEIPT:', data.type);
      }
    });

    // Listen for all events to debug
    this.socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log('🔍 WebSocket event received:', eventName, args);
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
  async showOrderNotification(orderData: OrderData) {
    console.log('🖨️ New order notification for order:', orderData.orderNumber);
    console.log('📊 Notification callback set:', !!this.onNotificationCallback);
    
    const notification: OrderNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: orderData,
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
      this.showBrowserNotification(orderData);
    } catch (error) {
      console.warn('⚠️ Browser notification failed:', error);
    }

    // Print receipt via PrintBridge (with error handling)
    try {
      await this.printReceipt(orderData);
    } catch (error) {
      console.warn('⚠️ Receipt printing failed, but order was successful:', error);
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

  // Set notification callback
  onNotification(callback: (notification: OrderNotification) => void) {
    // Only set callback if not already set to prevent duplicates
    if (!this.onNotificationCallback) {
      console.log('🎯 Setting notification callback');
      this.onNotificationCallback = callback;
    } else {
      console.log('⚠️ Notification callback already set, skipping');
    }
  }

  // Get all notifications
  getNotifications(): OrderNotification[] {
    return [...this.notifications];
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
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
      this.socket.offAny();
      
      // Disconnect the socket
      this.socket.disconnect();
      this.socket = null;
    }

    // Disconnect from PrintBridge
    if (this.printBridgeWebSocket) {
      console.log('🔌 Disconnecting from PrintBridge...');
      this.printBridgeWebSocket.close();
      this.printBridgeWebSocket = null;
    }
    
    this.isConnected = false;
    this.jwtToken = null;
    console.log('✅ WebSocket and PrintBridge disconnected');
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
  private async printReceipt(orderData: OrderData) {
    try {
      console.log('🖨️ Generating receipt PNG for order:', orderData.orderNumber);
      
      // Generate receipt PNG
      const receiptDataURL = await this.receiptGenerator.generateReceiptPNG(orderData);
      console.log('✅ Receipt PNG generated');
      
      // Get dimensions in millimeters (56mm width is standard receipt width)
      const labelWidth = 56; // 56mm receipt width
      const actualHeightPixels = this.receiptGenerator.getHeight(orderData);
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
        console.log('🖨️ Sending Mac-format receipt to PrintBridge');
      } else {
        // Windows/Linux format: full data URL with dimensions
        printData = {
          labelWidth: labelWidth,
          labelHeight: labelHeight,
          image: receiptDataURL,
          selectedPrinter: "Receipt Printer"
        };
        console.log('🖨️ Sending Windows/Linux-format receipt to PrintBridge:', { labelWidth: printData.labelWidth, labelHeight: printData.labelHeight });
      }
      
      // Send to PrintBridge if connected
      if (this.printBridgeWebSocket && this.printBridgeWebSocket.readyState === WebSocket.OPEN) {
        this.printBridgeWebSocket.send(JSON.stringify(printData));
        console.log('✅ Receipt sent to PrintBridge');
      } else {
        console.warn('⚠️ PrintBridge not connected, receipt not printed');
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