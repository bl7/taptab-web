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

// Dashboard interfaces
export interface DashboardSummary {
  totalOrders: { value: number; growth: number; period: string };
  activeOrders: { value: number; status: string };
  cancelledOrders: { value: number; status: string };
  totalRevenue: { value: number; growth: number; period: string };
  totalCustomers: { value: number; newToday: number };
  avgOrderValue: { value: number; growth: number };
  paymentMethods: {
    cash: { count: number; revenue: number };
    card: { count: number; revenue: number };
    qr: { count: number; revenue: number };
    online: { count: number; revenue: number };
  };
}

export interface LiveOrder {
  id: string;
  tableNumber: string;
  items: Array<{
    menuItemName: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  waiterName: string;
  createdAt: string;
  timeAgo: string;
  customerName?: string;
  specialInstructions?: string;
}

export interface RevenueTrend {
  growth: number;
  totalRevenue: number;
  dailyData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface PeakHours {
  peakHours: Array<{
    hour: number;
    orderCount: number;
    revenue: number;
    activity: number;
  }>;
}

export interface TopItem {
  rank: number;
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface TopItems {
  topItems: TopItem[];
  totalRevenue: number;
}

export interface StaffPerformance {
  userId: string;
  name: string;
  orderCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  rating: number;
}

export interface PopularCombination {
  combination: string;
  orderCount: number;
  revenue: number;
}

export interface ComprehensiveAnalytics {
  period: {
    start: string;
    end: string;
    type: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    orderStatus: {
      pending: number;
      preparing: number;
      ready: number;
      paid: number;
      cancelled: number;
    };
  };
  growth: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
    customers: number;
  };
  topItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
    orderCount: number;
  }>;
  dailyData: Array<{
    date: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
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

export interface OrderModificationChange {
  action: 'add_item' | 'remove_item' | 'change_quantity';
  itemId: string;
  quantity?: number;
  notes?: string;
  reason?: string;
}

export interface OrderModificationBatchRequest {
  changes: OrderModificationChange[];
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
    
    console.log('thisbitch', '🔗 API Request Details:');
    console.log('thisbitch', '  Base URL:', this.baseURL);
    console.log('thisbitch', '  Endpoint:', endpoint);
    console.log('thisbitch', '  Full URL:', `${this.baseURL}${endpoint}`);
    console.log('thisbitch', '  Token exists:', !!token);
    console.log('thisbitch', '  Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('thisbitch', '  Request method:', config.method || 'GET');
    console.log('thisbitch', '  Request headers:', config.headers);

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data: APIResponse<T> = await response.json();

    console.log('thisbitch', '📡 API Response Details:');
    console.log('thisbitch', '  Status:', response.status);
    console.log('thisbitch', '  Status text:', response.statusText);
    console.log('thisbitch', '  Response data:', data);
    console.log('thisbitch', '  Response data type:', typeof data);
    console.log('thisbitch', '  Response data keys:', Object.keys(data || {}));

    if (!response.ok) {
      console.error('thisbitch', '❌ API Error:', response.status, data);
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
    console.log('🍽️ Creating menu item with data:', data);
    console.log('🍽️ Image URL being sent:', data.image);
    
    const response = await this.request<{ item: MenuItem }>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('🍽️ Created menu item response:', response);
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

  async modifyOrderBatch(
    id: string,
    changes: OrderModificationChange[]
  ): Promise<{ success: boolean; changes: OrderModificationChange[] }> {
    const response = await this.request<{ 
      data?: { 
        success: boolean; 
        changes: OrderModificationChange[]; 
      }; 
      success?: boolean; 
      changes?: OrderModificationChange[]; 
    }>(`/orders/${id}/modify/batch`, {
      method: 'PUT',
      body: JSON.stringify({ changes }),
    });

    const result = response.data || response;
    if (result.success === undefined) {
      throw new Error('API response does not contain success data');
    }

    return {
      success: result.success,
      changes: result.changes || changes,
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

  // Dashboard endpoints
  async getDashboardOverview(period: 'week' | 'month' | 'year' = 'month'): Promise<{ summary: DashboardSummary }> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/overview?period=${period}`);
    console.log('thisbitch', 'Dashboard overview response:', response);
    
    // Handle different response structures
    if (response.summary) {
      return { summary: response.summary };
    } else if (response.data?.summary) {
      return { summary: response.data.summary };
    } else {
      console.error('thisbitch', 'Unexpected dashboard overview response structure:', response);
              return { summary: {
          totalOrders: { value: 0, growth: 0, period: "This month" },
          activeOrders: { value: 0, status: "Currently processing" },
          cancelledOrders: { value: 0, status: "Cancelled today" },
          totalRevenue: { value: 0, growth: 0, period: "This month" },
          totalCustomers: { value: 0, newToday: 0 },
          avgOrderValue: { value: 0, growth: 0 },
          paymentMethods: {
            cash: { count: 0, revenue: 0 },
            card: { count: 0, revenue: 0 },
            qr: { count: 0, revenue: 0 },
            online: { count: 0, revenue: 0 }
          }
        }};
    }
  }

  async getLiveOrders(): Promise<{ orders: LiveOrder[] }> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>('/dashboard/live-orders');
    console.log('thisbitch', 'Live orders response:', response);
    
    // Handle different response structures
    if (response.orders) {
      return { orders: response.orders };
    } else if (response.data?.orders) {
      return { orders: response.data.orders };
    } else {
      console.error('thisbitch', 'Unexpected live orders response structure:', response);
      return { orders: [] };
    }
  }

  async getRevenueTrend(days: number = 7): Promise<RevenueTrend> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/revenue-trend?days=${days}`);
    console.log('thisbitch', 'Revenue trend response:', response);
    
    // Handle different response structures
    if (response.growth !== undefined && response.totalRevenue !== undefined && response.dailyData) {
      return response;
    } else if (response.data?.growth !== undefined && response.data?.totalRevenue !== undefined && response.data?.dailyData) {
      return response.data;
    } else {
      console.error('thisbitch', 'Unexpected revenue trend response structure:', response);
      return {
        growth: 0,
        totalRevenue: 0,
        dailyData: []
      };
    }
  }

  async getPeakHours(days: number = 30): Promise<PeakHours> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/peak-hours?days=${days}`);
    console.log('thisbitch', 'Peak hours response:', response);
    
    // Handle different response structures
    if (response.peakHours) {
      return response;
    } else if (response.data?.peakHours) {
      return response.data;
    } else {
      console.error('thisbitch', 'Unexpected peak hours response structure:', response);
      return { peakHours: [] };
    }
  }

  async getTopItems(period: 'week' | 'month' | 'year' = 'month', limit: number = 10): Promise<TopItems> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/top-items?period=${period}&limit=${limit}`);
    console.log('thisbitch', 'Top items response:', response);
    
    // Handle different response structures
    if (response.topItems && response.totalRevenue !== undefined) {
      return response;
    } else if (response.data?.topItems && response.data?.totalRevenue !== undefined) {
      return response.data;
    } else {
      console.error('thisbitch', 'Unexpected top items response structure:', response);
      return { topItems: [], totalRevenue: 0 };
    }
  }

  async getStaffPerformance(period: 'week' | 'month' | 'year' = 'month'): Promise<{ staffPerformance: StaffPerformance[] }> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/staff-performance?period=${period}`);
    console.log('thisbitch', 'Staff performance response:', response);
    
    // Handle different response structures
    if (response.staffPerformance) {
      return { staffPerformance: response.staffPerformance };
    } else if (response.data?.staffPerformance) {
      return { staffPerformance: response.data.staffPerformance };
    } else {
      console.error('thisbitch', 'Unexpected staff performance response structure:', response);
      return { staffPerformance: [] };
    }
  }

  async getPopularCombinations(limit: number = 5): Promise<{ combinations: PopularCombination[] }> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(`/dashboard/popular-combinations?limit=${limit}`);
    console.log('thisbitch', 'Popular combinations response:', response);
    
    // Handle different response structures
    if (response.combinations) {
      return { combinations: response.combinations };
    } else if (response.data?.combinations) {
      return { combinations: response.data.combinations };
    } else {
      console.error('thisbitch', 'Unexpected popular combinations response structure:', response);
      return { combinations: [] };
    }
  }

  // Enhanced Analytics endpoints
  async getComprehensiveAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  }): Promise<ComprehensiveAnalytics> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.period) queryParams.append('period', params.period);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/comprehensive?${queryString}` : '/analytics/comprehensive';
    
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await this.request<any>(endpoint);
    console.log('thisbitch', 'Comprehensive analytics response:', response);
    
    // Handle different response structures
    if (response.period && response.summary && response.growth && response.topItems && response.dailyData) {
      return response;
    } else if (response.data?.period && response.data?.summary && response.data?.growth && response.data?.topItems && response.data?.dailyData) {
      return response.data;
    } else {
      console.error('thisbitch', 'Unexpected comprehensive analytics response structure:', response);
      return {
        period: { start: '', end: '', type: 'week' },
        summary: {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          uniqueCustomers: 0,
          orderStatus: { pending: 0, preparing: 0, ready: 0, paid: 0, cancelled: 0 }
        },
        growth: { orders: 0, revenue: 0, avgOrderValue: 0, customers: 0 },
        topItems: [],
        dailyData: []
      };
    }
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
    console.log('🏥 Performing health check...');
    const response = await this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      environment: string;
      version: string;
    }>('/health');
    console.log('🏥 Health check response:', response);
    return response;
  }

  async uploadImage(file: File): Promise<string> {
    console.log('📤 Uploading image to external backend...');
    
    const formData = new FormData();
    formData.append('image', file);

    const token = await tokenManager.getValidToken();
    const userData = localStorage.getItem('user');
    let tenantId = '';

    if (userData) {
      try {
        const user = JSON.parse(userData);
        tenantId = user.tenantId || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // For file uploads, we need to handle the request manually
    // because we can't set Content-Type for multipart/form-data
    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
        // Don't set Content-Type - let browser set it for multipart/form-data
      },
      body: formData,
    });

    const data: {
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
      size: number;
    } = await response.json();

    console.log('📤 Image upload response:', data);

    if (!response.ok) {
      throw new APIError(
        response.status,
        'UPLOAD_ERROR',
        'Upload failed'
      );
    }

    return data.url;
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