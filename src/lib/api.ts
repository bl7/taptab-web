const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  waiterId: string;
  waiterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  currentOrderId?: string;
  tenantId: string;
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
    const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data: APIResponse<T> = await response.json();

    if (!response.ok) {
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
    const response = await this.request<{ data: { items: MenuItem[] } }>(`/menu/items${params}`);
    return { items: response.data.items };
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    image?: string;
  }): Promise<{ item: MenuItem }> {
    const response = await this.request<{ data: { item: MenuItem } }>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { item: response.data.item };
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
    const response = await this.request<{ data: { item: MenuItem } }>(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { item: response.data.item };
  }

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ data: { success: boolean } }>(`/menu/items/${id}`, {
      method: 'DELETE',
    });
    return { success: response.data.success };
  }

  async getMenuCategories(): Promise<{ categories: MenuCategory[] }> {
    const response = await this.request<{ data: { categories: MenuCategory[] } }>('/menu/categories');
    return { categories: response.data.categories };
  }

  async createMenuCategory(data: {
    name: string;
    sortOrder?: number;
  }): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ data: { category: MenuCategory } }>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { category: response.data.category };
  }

  async updateMenuCategory(id: string, data: {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ data: { category: MenuCategory } }>(`/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { category: response.data.category };
  }

  async deleteMenuCategory(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ data: { success: boolean } }>(`/menu/categories/${id}`, {
      method: 'DELETE',
    });
    return { success: response.data.success };
  }

  // Orders endpoints
  async getOrders(params?: {
    status?: string;
    tableId?: string;
  }): Promise<{ orders: Order[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tableId) queryParams.append('tableId', params.tableId);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await this.request<{ data: { orders: Order[] } }>(endpoint);
    return { orders: response.data.orders };
  }

  async createOrder(data: {
    tableId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      notes?: string;
    }>;
  }): Promise<{ order: Order }> {
    const response = await this.request<{ data: { order: Order } }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { order: response.data.order };
  }

  async updateOrderStatus(
    id: string,
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ): Promise<{ order: Order }> {
    const response = await this.request<{ data: { order: Order } }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return { order: response.data.order };
  }

  async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'ready' | 'served'
  ): Promise<{ item: OrderItem }> {
    const response = await this.request<{ data: { item: OrderItem } }>(`/orders/${orderId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return { item: response.data.item };
  }

  async cancelOrder(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ data: { success: boolean } }>(`/orders/${id}`, {
      method: 'DELETE',
    });
    return { success: response.data.success };
  }

  // Tables endpoints
  async getTables(): Promise<{ tables: Table[] }> {
    console.log('🔍 Fetching tables from:', `${this.baseURL}/tables`);
    const response = await this.request<{ data: { tables: Table[] } }>('/tables');
    console.log('📋 Tables response:', response);
    return { tables: response.data.tables };
  }

  async createTable(data: {
    number: number;
    capacity: number;
    location?: string;
    status?: string;
  }): Promise<{ table: Table }> {
    console.log('➕ Creating table with data:', data);
    console.log('🔗 POST request to:', `${this.baseURL}/tables`);
    const response = await this.request<{ data: { table: Table } }>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ Create table response:', response);
    return { table: response.data.table };
  }

  async updateTable(id: string, data: {
    number?: number;
    capacity?: number;
    location?: string;
    status?: string;
  }): Promise<{ table: Table }> {
    const response = await this.request<{ data: { table: Table } }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { table: response.data.table };
  }

  async updateTableStatus(id: string, status: string): Promise<{ table: Table }> {
    const response = await this.request<{ data: { table: Table } }>(`/tables/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return { table: response.data.table };
  }

  async deleteTable(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ data: { success: boolean } }>(`/tables/${id}`, {
      method: 'DELETE',
    });
    return { success: response.data.success };
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