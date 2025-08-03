// Import the main API client
import { api } from './api';

// Types based on the API documentation
export type OrderStatus = 'active' | 'paid' | 'cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  total?: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: string;
  orderNumber?: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  totalAmount?: number;
  finalAmount?: number;
  status: OrderStatus;
  waiterId: string;
  waiterName: string;
  orderSource?: string;
  sourceDetails?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  tableId: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
  orderSource?: string;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  taxAmount?: number;
  discountAmount?: number;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  items?: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  message: string;
  timestamp: string;
}

export interface OrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Orders API Client - Now using the main API client
export class OrdersApi {
  // Get all orders
  static async getOrders(params?: {
    status?: OrderStatus;
    table?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrdersResponse> {
    try {
      const response = await api.getOrders({
        status: params?.status,
        tableId: params?.table
      });
      
      console.log('🔍 Raw orders from API:', response.orders);
      
      // Log each order's total fields to debug
      response.orders.forEach((order, index) => {
        console.log(`🔍 Order ${index + 1} total fields:`, {
          id: order.id,
          totalAmount: order.totalAmount,
          finalAmount: order.finalAmount,
          total: order.total,
          calculatedTotal: order.items.reduce((sum, item) => sum + (item.total || 0), 0),
          items: order.items.map(item => ({
            menuItemName: item.menuItemName,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            calculatedItemTotal: (item.price * item.quantity)
          }))
        });
      });
      
      // Transform the data to match expected format
      const transformedOrders = response.orders.map(order => {
        // Calculate order total from items if not provided
        const calculatedOrderTotal = order.items.reduce((sum, item) => 
          sum + (item.total || (item.price * item.quantity)), 0
        );
        
        const transformedOrder = {
          ...order,
          // API returns 'total' but we need 'totalAmount' for consistency
          totalAmount: order.total || order.totalAmount || calculatedOrderTotal,
          finalAmount: order.total || order.finalAmount || calculatedOrderTotal,
          total: order.total || calculatedOrderTotal,
          // Transform items to include totals
          items: order.items.map(item => ({
            ...item,
            total: item.total || (item.price * item.quantity)
          }))
        };
        
        return transformedOrder;
      });
      
      console.log('🔍 Transformed orders:', transformedOrders);
      
      return {
        success: true,
        data: {
          orders: transformedOrders
        },
        message: 'Orders retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Try to get orders from public API (fallback)
  static async getOrdersFromPublicAPI(tenantSlug: string): Promise<OrdersResponse> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`);
    
    console.log('🌐 Public Orders API URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Public Orders API response status:', response.status);
    console.log('📡 Public Orders API response status text:', response.statusText);

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data as OrdersResponse;
  }

  // Get a specific order
  static async getOrder(): Promise<OrderResponse> {
    try {
      // Note: The main API client doesn't have getOrder method yet
      // This would need to be added to the main API client
      throw new Error('getOrder method not implemented in main API client');
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Create a new order
  static async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await api.createOrder(orderData);
      
      return {
        success: true,
        data: {
          order: response.order
        },
        message: 'Order created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update an existing order
  static async updateOrder(): Promise<OrderResponse> {
    try {
      // Note: The main API client doesn't have updateOrder method yet
      // This would need to be added to the main API client
      throw new Error('updateOrder method not implemented in main API client');
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Cancel an order
  static async cancelOrder(orderId: string, reason: string = 'Admin decision'): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.cancelOrder(orderId, reason);
      
      return {
        success: response.success,
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Update order status (convenience method)
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    try {
      const response = await api.updateOrderStatus(orderId, status);
      
      return {
        success: true,
        data: {
          order: response.order
        },
        message: 'Order status updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
} 