import { tokenManager } from './token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  status: 'active' | 'paid' | 'cancelled';
  waiterId: string;
  waiterName: string;
  orderSource?: string;
  sourceDetails?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  currentOrderId?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSales {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface AnalyticsOrders {
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
}

export interface Settings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  timezone: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    colors: Record<string, string>;
    isActive: boolean;
  };
}

class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get valid token (auto-refresh if needed)
    const token = await tokenManager.getValidToken();
    
    console.log('🔗 API Request Details:');
    console.log('  Base URL:', this.baseURL);
    console.log('  Endpoint:', endpoint);
    console.log('  Full URL:', `${this.baseURL}${endpoint}`);
    console.log('  Token exists:', !!token);
    console.log('  Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('  Request method:', config.method || 'GET');
    console.log('  Request headers:', config.headers);

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data: APIResponse<T> = await response.json();

    console.log('📡 API Response Details:');
    console.log('  Status:', response.status);
    console.log('  Status text:', response.statusText);
    console.log('  Response data:', data);
    console.log('  Response data type:', typeof data);
    console.log('  Response data keys:', Object.keys(data || {}));

    if (!response.ok) {
      console.error('❌ API Error:', response.status, data);
      throw new APIError(
        response.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred'
      );
    }

    if (!data.success) {
      throw new APIError(
        response.status,
        data.error?.code || 'API_ERROR',
        data.error?.message || 'API request failed'
      );
    }

    return data.data as T;
  }

  // Auth endpoints
  async verifyToken(token: string): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Menu endpoints
  async getMenuItems(categoryId?: string): Promise<{ items: MenuItem[] }> {
    const params = categoryId ? `?category=${categoryId}` : '';
    console.log('🍽️ Fetching menu items from:', `${this.baseURL}/menu/items${params}`);
    const response = await this.request<{ items: MenuItem[] }>(`/menu/items${params}`);
    console.log('🍽️ Menu items response:', response);
    console.log('🍽️ Menu items array:', response.items);
    console.log('🍽️ Number of menu items:', response.items?.length || 0);
    if (response.items && response.items.length > 0) {
      console.log('🍽️ First menu item example:', response.items[0]);
    }
    return { items: response.items };
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    image?: string;
  }): Promise<{ item: MenuItem }> {
    const response = await this.request<{ item: MenuItem }>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { item: response.item };
  }

  async updateMenuItem(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
      isActive?: boolean;
    }
  ): Promise<{ item: MenuItem }> {
    const response = await this.request<{ item: MenuItem }>(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { item: response.item };
  }

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/menu/items/${id}`, {
      method: 'DELETE',
    });
    return { success: response.success };
  }

  async getMenuCategories(): Promise<{ categories: MenuCategory[] }> {
    console.log('📂 Fetching menu categories from:', `${this.baseURL}/menu/categories`);
    const response = await this.request<{ categories: MenuCategory[] }>('/menu/categories');
    console.log('📂 Menu categories response:', response);
    console.log('📂 Menu categories array:', response.categories);
    console.log('📂 Number of categories:', response.categories?.length || 0);
    if (response.categories && response.categories.length > 0) {
      console.log('📂 First category example:', response.categories[0]);
    }
    return { categories: response.categories };
  }

  async createMenuCategory(data: {
    name: string;
    sortOrder?: number;
  }): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ category: MenuCategory }>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { category: response.category };
  }

  async updateMenuCategory(id: string, data: {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ category: MenuCategory }>(`/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { category: response.category };
  }

  async deleteMenuCategory(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/menu/categories/${id}`, {
      method: 'DELETE',
    });
    return { success: response.success };
  }

  // Orders endpoints
  async getOrders(params?: {
    status?: string;
    tableId?: string;
  }): Promise<{ orders: Order[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tableId) queryParams.append('tableId', params.tableId);
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('🌐 Fetching orders from:', `${this.baseURL}${endpoint}`);
    const response = await this.request<{ data?: { orders: Order[] }; orders?: Order[] }>(endpoint);
    
    console.log('📡 Raw API response for orders:', response);
    console.log('📡 Response structure:', {
      hasData: !!response.data,
      hasOrders: !!response.data?.orders,
      ordersLength: response.data?.orders?.length || 0,
      directOrders: !!response.orders,
      directOrdersLength: response.orders?.length || 0
    });
    
    // Try different response structures
    let orders: Order[] = [];
    
    if (response.data && response.data.orders) {
      // Expected structure: { data: { orders: [...] } }
      orders = response.data.orders;
      console.log('✅ Using response.data.orders structure');
    } else if (response.orders) {
      // Alternative structure: { orders: [...] }
      orders = response.orders;
      console.log('✅ Using response.orders structure');
    } else {
      console.error('❌ Unexpected API response structure:', response);
      throw new Error('API response does not contain orders data in expected format');
    }
    
    console.log('📡 Orders array:', orders);
    
    // Log each order's structure
    orders.forEach((order, index) => {
      console.log(`📡 Order ${index + 1} total fields:`, {
        id: order.id,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount,
        total: order.total,
        calculatedTotal: order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0
      });
    });
    
    return { orders };
  }

  async createOrder(data: {
    tableId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      notes?: string;
    }>;
    orderSource?: string;
    customerName?: string;
    customerPhone?: string;
    specialInstructions?: string;
    taxAmount?: number;
    discountAmount?: number;
  }): Promise<{ order: Order }> {
    const response = await this.request<{ data?: { order: Order }; order?: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Handle different response structures
    const order = response.data?.order || response.order;
    if (!order) {
      throw new Error('API response does not contain order data');
    }
    
    return { order };
  }

  async updateOrderStatus(
    id: string,
    status: 'active' | 'paid' | 'cancelled'
  ): Promise<{ order: Order }> {
    const response = await this.request<{ data?: { order: Order }; order?: Order }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    // Handle different response structures
    const order = response.data?.order || response.order;
    if (!order) {
      throw new Error('API response does not contain order data');
    }
    
    return { order };
  }

  async cancelOrder(id: string, reason: string = 'Admin decision'): Promise<{ success: boolean }> {
    const response = await this.request<{ data?: { success: boolean }; success?: boolean }>(`/orders/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
    
    // Handle different response structures
    const success = response.data?.success || response.success;
    if (success === undefined) {
      throw new Error('API response does not contain success status');
    }
    
    return { success };
  }

  async markOrderAsPaid(id: string, paymentMethod: 'CASH' | 'CARD' | 'QR' | 'ONLINE'): Promise<{ success: boolean }> {
    const response = await this.request<{ data?: { success: boolean }; success?: boolean }>(`/orders/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ paymentMethod }),
    });
    
    // Handle different response structures
    const success = response.data?.success || response.success;
    if (success === undefined) {
      throw new Error('API response does not contain success data');
    }
    
    return { success };
  }

  async modifyOrder(
    id: string, 
    action: 'add_item' | 'remove_item' | 'change_quantity',
    itemId: string,
    quantity: number,
    notes?: string
  ): Promise<{ success: boolean; action: string; itemId: string; quantity: number }> {
    const response = await this.request<{ 
      data?: { 
        success: boolean; 
        action: string; 
        itemId: string; 
        quantity: number 
      }; 
      success?: boolean; 
      action?: string; 
      itemId?: string; 
      quantity?: number 
    }>(`/orders/${id}/modify`, {
      method: 'PUT',
      body: JSON.stringify({ action, itemId, quantity, notes }),
    });
    
    // Handle different response structures
    const result = response.data || response;
    if (result.success === undefined) {
      throw new Error('API response does not contain success data');
    }
    
    return {
      success: result.success,
      action: result.action || action,
      itemId: result.itemId || itemId,
      quantity: result.quantity || quantity
    };
  }

  // Tables endpoints
  async getTables(): Promise<{ tables: Table[] }> {
    console.log('🔍 Fetching tables from:', `${this.baseURL}/tables`);
    const response = await this.request<{ tables: Table[] }>('/tables');
    console.log('📋 Tables response:', response);
    console.log('📋 Tables array:', response.tables);
    console.log('📋 Number of tables:', response.tables?.length || 0);
    if (response.tables && response.tables.length > 0) {
      console.log('📋 First table example:', response.tables[0]);
    }
    return { tables: response.tables };
  }

  async createTable(data: {
    number: string;
    capacity: number;
    location?: string;
    status?: string;
  }): Promise<{ table: Table }> {
    console.log('➕ Creating table with data:', data);
    console.log('🔗 POST request to:', `${this.baseURL}/tables`);
    const response = await this.request<{ table: Table }>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ Create table response:', response);
    return { table: response.table };
  }

  async updateTable(id: string, data: {
    number?: string;
    capacity?: number;
    location?: string;
    status?: string;
  }): Promise<{ table: Table }> {
    const response = await this.request<{ table: Table }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { table: response.table };
  }

  async updateTableStatus(id: string, status: string): Promise<{ table: Table }> {
    const response = await this.request<{ table: Table }>(`/tables/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return { table: response.table };
  }

  async deleteTable(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/tables/${id}`, {
      method: 'DELETE',
    });
    return { success: response.success };
  }

  // Analytics endpoints
  async getSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsSales> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/sales?${queryString}` : '/analytics/sales';
    
    const response = await this.request<{ data: AnalyticsSales }>(endpoint);
    return response.data;
  }

  async getOrderAnalytics(): Promise<AnalyticsOrders> {
    const response = await this.request<{ data: AnalyticsOrders }>('/analytics/orders');
    return response.data;
  }

  // Settings endpoints
  async getSettings(): Promise<Settings> {
    const response = await this.request<{ data: Settings }>('/settings');
    return response.data;
  }

  async updateSettings(data: Partial<Settings>): Promise<{ settings: Settings }> {
    const response = await this.request<{ data: { settings: Settings } }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { settings: response.data.settings };
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
  }> {
    const response = await this.request<{ data: {
      status: string;
      timestamp: string;
      uptime: number;
      environment: string;
      version: string;
    } }>('/health');
    return response.data;
  }



}

// Export singleton instance
export const api = new APIClient();

// Public API client for ordering page (no authentication required)
export class PublicAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    tenantSlug: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log('🔗 Public API Request Details:');
    console.log('  Base URL:', this.baseURL);
    console.log('  Endpoint:', endpoint);
    console.log('  Full URL:', `${this.baseURL}${endpoint}`);
    console.log('  Tenant Slug:', tenantSlug);
    console.log('  No authentication required for public endpoints');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': tenantSlug,
        ...options.headers,
      },
      ...options,
    };

    console.log('  Request headers:', config.headers);
    console.log('  Request method:', config.method || 'GET');

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data: APIResponse<T> = await response.json();

    console.log('📡 Public API Response Details:');
    console.log('  Status:', response.status);
    console.log('  Status text:', response.statusText);
    console.log('  Response data:', data);

    if (!response.ok) {
      console.error('❌ Public API Error:', response.status, data);
      throw new APIError(
        response.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred'
      );
    }

    if (!data.success) {
      throw new APIError(
        response.status,
        data.error?.code || 'API_ERROR',
        data.error?.message || 'API request failed'
      );
    }

    return data.data as T;
  }

  // Public menu endpoints (no authentication required)
  async getPublicMenuItems(tenantSlug: string, categoryId?: string): Promise<{ items: MenuItem[] }> {
    const params = categoryId ? `?category=${categoryId}` : '';
    console.log('🍽️ Fetching public menu items from:', `${this.baseURL}/menu/items${params}`);
    const response = await this.request<{ items: MenuItem[] }>(`/menu/items${params}`, tenantSlug);
    console.log('🍽️ Public menu items response:', response);
    console.log('🍽️ Public menu items array:', response.items);
    console.log('🍽️ Number of public menu items:', response.items?.length || 0);
    if (response.items && response.items.length > 0) {
      console.log('🍽️ First public menu item example:', response.items[0]);
    }
    return { items: response.items };
  }

  async getPublicMenuCategories(tenantSlug: string): Promise<{ categories: MenuCategory[] }> {
    console.log('📂 Fetching public menu categories from:', `${this.baseURL}/menu/categories`);
    const response = await this.request<{ categories: MenuCategory[] }>('/menu/categories', tenantSlug);
    console.log('📂 Public menu categories response:', response);
    console.log('📂 Public menu categories array:', response.categories);
    console.log('📂 Number of public categories:', response.categories?.length || 0);
    if (response.categories && response.categories.length > 0) {
      console.log('📂 First public category example:', response.categories[0]);
    }
    return { categories: response.categories };
  }

  async getPublicTables(tenantSlug: string): Promise<{ tables: Table[] }> {
    console.log('🔍 Fetching public tables from:', `${this.baseURL}/tables`);
    const response = await this.request<{ tables: Table[] }>('/tables', tenantSlug);
    console.log('📋 Public tables response:', response);
    console.log('📋 Public tables array:', response.tables);
    console.log('📋 Number of public tables:', response.tables?.length || 0);
    if (response.tables && response.tables.length > 0) {
      console.log('📋 First public table example:', response.tables[0]);
    }
    return { tables: response.tables };
  }

  async createPublicOrder(data: {
    tableId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      notes?: string;
    }>;
    orderSource?: string;
    customerName?: string;
    customerPhone?: string;
    specialInstructions?: string;
    taxAmount?: number;
    discountAmount?: number;
  }, tenantSlug: string): Promise<{ order: Order }> {
    console.log('📝 Creating public order:', data);
    const response = await this.request<{ order: Order }>('/orders', tenantSlug, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ Public order created:', response);
    return { order: response.order };
  }
}

export const publicApi = new PublicAPIClient(); 