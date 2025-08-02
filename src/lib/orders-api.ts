// Types based on the API documentation
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  totalAmount: number;
  finalAmount: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  orderSource?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  tableNumber: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
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

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // Check if token is expired
  const { isTokenExpired, logoutUser } = await import('./token-utils');
  if (isTokenExpired(token)) {
    console.log('🔐 Token expired during API call, logging out user');
    logoutUser();
    throw new Error('Token expired');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data as ApiError;
    let errorMessage = error.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    
    // Handle specific database errors
    if (errorMessage.includes('deliverooOrderId does not exist')) {
      errorMessage = 'Database schema error: Missing column. Please contact support.';
    } else if (errorMessage.includes('Database operation failed')) {
      errorMessage = 'Database connection error. Please try again later.';
    } else if (response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (response.status === 404) {
      errorMessage = 'API endpoint not found. Please check the server configuration.';
    }
    
    console.error('🚨 API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: error,
      message: errorMessage
    });
    
    throw new Error(errorMessage);
  }
  
  return data as T;
};

// Orders API Client
export class OrdersApi {
  // Get all orders
  static async getOrders(params?: {
    status?: OrderStatus;
    table?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrdersResponse> {
    const url = new URL(`${API_BASE_URL}/orders`);
    
    if (params?.status) url.searchParams.append('status', params.status);
    if (params?.table) url.searchParams.append('table', params.table);
    if (params?.limit) url.searchParams.append('limit', params.limit.toString());
    if (params?.offset) url.searchParams.append('offset', params.offset.toString());

    console.log('🌐 Orders API URL:', url.toString());
    const headers = await getAuthHeaders();
    console.log('🔑 Auth headers:', headers);

    const response = await fetch(url.toString(), {
      headers,
    });

    console.log('📡 Orders API response status:', response.status);
    console.log('📡 Orders API response status text:', response.statusText);

    return handleApiResponse<OrdersResponse>(response);
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

    return handleApiResponse<OrdersResponse>(response);
  }

  // Get a specific order
  static async getOrder(orderId: string): Promise<OrderResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers,
    });

    return handleApiResponse<OrderResponse>(response);
  }

  // Create a new order
  static async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    return handleApiResponse<OrderResponse>(response);
  }

  // Update an existing order
  static async updateOrder(orderId: string, updateData: UpdateOrderRequest): Promise<OrderResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    return handleApiResponse<OrderResponse>(response);
  }

  // Delete an order
  static async deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers,
    });

    return handleApiResponse<{ success: boolean; message: string }>(response);
  }

  // Update order status (convenience method)
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    return this.updateOrder(orderId, { status });
  }
} 