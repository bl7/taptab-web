import { tokenManager } from "./token-manager";
import {
  SimplePromotion,
  PromotionFormData,
  PromotionCalculationRequest,
  PromotionCalculationResponse,
} from "@/interfaces/promotion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";

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
  ingredients?: MenuItemIngredient[];
  allergens?: MenuItemAllergen[];
  tags?: MenuTag[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ingredients and Allergens Interfaces
export interface Ingredient {
  id: string;
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Allergen {
  id: string;
  name: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isStandard: boolean;
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemIngredient {
  id: string;
  menuItemId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  ingredient?: Ingredient;
}

export interface IngredientAllergen {
  id: string;
  ingredientId: string;
  allergenId: string;
  createdAt: string;
  updatedAt: string;
  allergen?: Allergen;
}

export interface MenuItemAllergen {
  id: string;
  name: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isStandard: boolean;
  sources: Array<{
    ingredientId: string;
    ingredientName: string;
  }>;
}

export interface MenuTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemTag {
  id: string;
  menuItemId: string;
  tagId: string;
  assignedAt: string;
  tag?: MenuTag;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  total?: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
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
  status: "active" | "closed" | "cancelled" | "merged";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: "CASH" | "CARD" | "QR" | "STRIPE";
  waiterId: string;
  waiterName: string;
  orderSource?: "QR_ORDERING" | "WAITER" | "CASHIER" | "SPLIT";
  sourceDetails?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CancelledOrder extends Order {
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt: string;
}

export interface CancelledOrdersResponse {
  orders: CancelledOrder[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    startDate?: string;
    endDate?: string;
    period?: string;
  };
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  tableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableLayout {
  id: string;
  name: string;
  description?: string;
  locationId: string;
  locationDetails?: {
    name: string;
    description?: string;
  };
  layoutJson: {
    type: "grid" | "freeform";
    dimensions: {
      width: number;
      height: number;
      gridSize?: number;
    };
    tables?: Array<{
      tableId: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      shape: "round" | "rectangle" | "square";
      seats: number;
      rotation: number;
    }>;
    walls?: Array<{
      start: { x: number; y: number };
      end: { x: number; y: number };
    }>;
    objects?: Array<{
      type: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      [key: string]: unknown;
    }>;
    zones?: Array<{
      name: string;
      color: string;
      bounds: { x: number; y: number; width: number; height: number };
    }>;
    metadata?: {
      theme?: string;
      background?: string;
      version?: string;
      [key: string]: unknown;
    };
  };
  isActive: boolean;
  isDefault: boolean;
  createdByUserId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  location?: string; // Keep for backward compatibility
  locationId?: string; // New foreign key reference
  locationDetails?: {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
  };
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
    stripe: { count: number; revenue: number };
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
  status: "pending" | "preparing" | "ready" | "completed";
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
  stripeConfig?: StripeConnectConfig;
}

export interface StripeConnectConfig {
  isConnected: boolean;
  accountId?: string;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  currency: string;
  merchantName: string;
  merchantCountry: string;
  applePayEnabled: boolean;
  googlePayEnabled: boolean;
  merchantId?: string;
  merchantCapabilities?: string[];
  isStripeEnabled: boolean;
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
  action: "add_item" | "remove_item" | "change_quantity";
  itemId: string;
  quantity?: number;
  notes?: string;
  reason?: string;
}

export interface OrderModificationBatchRequest {
  changes: OrderModificationChange[];
}

class APIError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "APIError";
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
    console.log("🔑 API Request Debug:", {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "NO_TOKEN",
      localStorage_token: !!localStorage.getItem("token"),
      localStorage_bossToken: !!localStorage.getItem("bossToken"),
      localStorage_refreshToken: !!localStorage.getItem("refreshToken"),
    });

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response: Response;
    let data: APIResponse<T>;

    try {
      response = await fetch(`${this.baseURL}${endpoint}`, config);
    } catch (fetchError: unknown) {
      console.error("❌ Network error:", fetchError);
      throw new APIError(
        0,
        "NETWORK_ERROR",
        `Network error: ${
          (fetchError as Error)?.message || "Unable to connect to server"
        }`
      );
    }

    try {
      data = await response.json();
    } catch (parseError: unknown) {
      console.error("❌ JSON parse error:", parseError);
      throw new APIError(
        response.status,
        "PARSE_ERROR",
        `Invalid response format: ${
          (parseError as Error)?.message || "Unable to parse response"
        }`
      );
    }

    if (!response.ok) {
      console.error("❌ HTTP Error Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        responseData: data,
      });

      throw new APIError(
        response.status,
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (!data.success) {
      throw new APIError(
        response.status,
        data.error?.code || "API_ERROR",
        data.error?.message || "API request failed"
      );
    }

    return data.data as T;
  }

  // Auth endpoints
  async verifyToken(token: string): Promise<{ user: User }> {
    return this.request<{ user: User }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // Menu endpoints
  async getMenuItems(categoryId?: string): Promise<{ items: MenuItem[] }> {
    const params = categoryId ? `?category=${categoryId}` : "";
    const response = await this.request<{ items: MenuItem[] }>(
      `/menu/items${params}`
    );
    return { items: response.items };
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    image?: string;
    ingredients?: Array<{
      ingredientId: string;
      quantity: number; // ✅ Numeric value
      unit?: string; // ✅ Optional text unit
    }>;
    tags?: string[];
  }): Promise<{ item: MenuItem }> {
    const response = await this.request<{ item: MenuItem }>("/menu/items", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // ✅ ROBUST - Handle all possible response structures
    if (!response || !response.item) {
      throw new Error("Invalid response structure from server");
    }

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
      ingredients?: Array<{
        ingredientId: string;
        quantity: number;
        unit?: string;
      }>;
      tags?: string[];
    }
  ): Promise<{ item: MenuItem }> {
    const response = await this.request<{ item: MenuItem }>(
      `/menu/items/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    // ✅ ROBUST - Handle all possible response structures
    if (!response || !response.item) {
      throw new Error("Invalid response structure from server");
    }

    return { item: response.item };
  }

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/menu/items/${id}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  async getMenuCategories(): Promise<{ categories: MenuCategory[] }> {
    const response = await this.request<{ categories: MenuCategory[] }>(
      "/menu/categories"
    );
    return { categories: response.categories };
  }

  async createMenuCategory(data: {
    name: string;
    sortOrder?: number;
  }): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ category: MenuCategory }>(
      "/menu/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return { category: response.category };
  }

  async updateMenuCategory(
    id: string,
    data: {
      name?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ): Promise<{ category: MenuCategory }> {
    const response = await this.request<{ category: MenuCategory }>(
      `/menu/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return { category: response.category };
  }

  async deleteMenuCategory(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/menu/categories/${id}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  // Ingredients endpoints
  async getIngredients(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ingredients: Ingredient[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/ingredients${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await this.request<{
      ingredients: Ingredient[];
      pagination?: PaginationInfo;
    }>(endpoint);

    // Handle response structure based on your API format
    if (response && response.ingredients) {
      // Format ingredients to handle string costPerUnit from DB
      const formattedIngredients = response.ingredients.map((ingredient) => ({
        ...ingredient,
        costPerUnit: parseFloat(String(ingredient.costPerUnit || "0")),
        isActive: Boolean(ingredient.isActive),
      }));

      return {
        ingredients: formattedIngredients,
        pagination: response.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      ingredients: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }

  async getIngredient(id: string): Promise<{ ingredient: Ingredient }> {
    const response = await this.request<{ ingredient: Ingredient }>(
      `/ingredients/${id}`
    );
    return response;
  }

  async createIngredient(data: {
    name: string;
    description: string;
    unit: string;
    costPerUnit: number;
  }): Promise<{ ingredient: Ingredient }> {
    // Prepare data for API (ensure numbers are sent as numbers)
    const apiData = {
      name: data.name,
      description: data.description || "",
      unit: data.unit || "",
      costPerUnit: Number(data.costPerUnit) || 0,
      isActive: true,
    };

    console.log(
      "🔍 INGREDIENTS DEBUG - Creating ingredient with data:",
      apiData
    );

    const response = await this.request<{ ingredient: Ingredient }>(
      "/ingredients",
      {
        method: "POST",
        body: JSON.stringify(apiData),
      }
    );

    // Format the response to handle string costPerUnit from DB
    if (response && response.ingredient) {
      const formattedIngredient = {
        ...response.ingredient,
        costPerUnit: parseFloat(String(response.ingredient.costPerUnit || "0")),
        isActive: Boolean(response.ingredient.isActive),
      };
      return { ingredient: formattedIngredient };
    }

    throw new Error("Invalid response structure from server");
  }

  async updateIngredient(
    id: string,
    data: {
      name?: string;
      description?: string;
      unit?: string;
      costPerUnit?: number;
      isActive?: boolean;
    }
  ): Promise<{ ingredient: Ingredient }> {
    // Prepare data for API (ensure numbers are sent as numbers)
    const apiData = {
      ...data,
      costPerUnit:
        data.costPerUnit !== undefined ? Number(data.costPerUnit) : undefined,
      isActive:
        data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    };

    const response = await this.request<{ ingredient: Ingredient }>(
      `/ingredients/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(apiData),
      }
    );

    // Format the response to handle string costPerUnit from DB
    if (response && response.ingredient) {
      const formattedIngredient = {
        ...response.ingredient,
        costPerUnit: parseFloat(String(response.ingredient.costPerUnit || "0")),
        isActive: Boolean(response.ingredient.isActive),
      };
      return { ingredient: formattedIngredient };
    }

    throw new Error("Invalid response structure from server");
  }

  async deleteIngredient(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/ingredients/${id}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  // Allergens endpoints
  async getAllergens(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ allergens: Allergen[] }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/allergens${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const rawResponse = await this.request<{ allergens: Allergen[] }>(endpoint);

    // The API is returning { allergens: [...] } directly, not nested in data
    if (rawResponse && rawResponse.allergens) {
      return { allergens: rawResponse.allergens };
    } else {
      return { allergens: [] };
    }
  }

  async getAllergen(id: string): Promise<{ allergen: Allergen }> {
    const response = await this.request<{ data: { allergen: Allergen } }>(
      `/allergens/${id}`
    );
    return response.data;
  }

  async createAllergen(data: {
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }): Promise<{ allergen: Allergen }> {
    const response = await this.request<{ data: { allergen: Allergen } }>(
      "/allergens",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateAllergen(
    id: string,
    data: {
      name?: string;
      description?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      isActive?: boolean;
    }
  ): Promise<{ allergen: Allergen }> {
    const response = await this.request<{ data: { allergen: Allergen } }>(
      `/allergens/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async deleteAllergen(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/allergens/${id}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  // Menu Item Ingredients endpoints
  async getMenuItemIngredients(
    menuItemId: string
  ): Promise<{ ingredients: MenuItemIngredient[] }> {
    const response = await this.request<{
      data: { ingredients: MenuItemIngredient[] };
    }>(`/menu-items/${menuItemId}/ingredients`);
    return response.data;
  }

  async addIngredientToMenuItem(
    menuItemId: string,
    data: {
      ingredientId: string;
      quantity: number;
      unit: string;
    }
  ): Promise<{ menuItemIngredient: MenuItemIngredient }> {
    const response = await this.request<{
      data: { menuItemIngredient: MenuItemIngredient };
    }>(`/menu-items/${menuItemId}/ingredients`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateMenuItemIngredient(
    menuItemId: string,
    ingredientId: string,
    data: {
      quantity: number;
      unit: string;
    }
  ): Promise<{ menuItemIngredient: MenuItemIngredient }> {
    const response = await this.request<{
      data: { menuItemIngredient: MenuItemIngredient };
    }>(`/menu-items/${menuItemId}/ingredients/${ingredientId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async removeIngredientFromMenuItem(
    menuItemId: string,
    ingredientId: string
  ): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/menu-items/${menuItemId}/ingredients/${ingredientId}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  // Ingredient Allergens endpoints
  async getIngredientAllergens(
    ingredientId: string
  ): Promise<{ allergens: IngredientAllergen[] }> {
    const response = await this.request<{
      data: { allergens: IngredientAllergen[] };
    }>(`/ingredient-allergens/ingredients/${ingredientId}`);
    return response.data;
  }

  async addAllergenToIngredient(data: {
    ingredientId: string;
    allergenId: string;
  }): Promise<{ ingredientAllergen: IngredientAllergen }> {
    const response = await this.request<{
      data: { ingredientAllergen: IngredientAllergen };
    }>("/ingredient-allergens", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async removeAllergenFromIngredient(
    ingredientId: string,
    allergenId: string
  ): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/ingredient-allergens/${ingredientId}/${allergenId}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  async getMenuItemAllergens(
    menuItemId: string
  ): Promise<{ allergens: MenuItemAllergen[] }> {
    const response = await this.request<{
      data: { allergens: MenuItemAllergen[] };
    }>(`/ingredient-allergens/menu-items/${menuItemId}`);
    return response.data;
  }

  // Menu Tags endpoints (Global - read only)
  async getMenuTags(): Promise<{ tags: MenuTag[] }> {
    const response = await this.request<{ tags: MenuTag[] }>("/menu-tags");
    return response;
  }

  async getMenuTag(id: string): Promise<{ tag: MenuTag }> {
    const response = await this.request<{ tag: MenuTag }>(`/menu-tags/${id}`);
    return response;
  }

  // Menu Item Tags endpoints
  async getMenuItemTags(menuItemId: string): Promise<{ tags: MenuItemTag[] }> {
    const response = await this.request<{ tags: MenuItemTag[] }>(
      `/menu-item-tags/${menuItemId}`
    );
    return response;
  }

  async addTagToMenuItem(
    menuItemId: string,
    tagId: string
  ): Promise<{ menuItemTag: MenuItemTag }> {
    const response = await this.request<{ menuItemTag: MenuItemTag }>(
      `/menu-item-tags/${menuItemId}`,
      {
        method: "POST",
        body: JSON.stringify({ tagId }),
      }
    );
    return response;
  }

  async removeTagFromMenuItem(
    menuItemId: string,
    tagId: string
  ): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      `/menu-item-tags/${menuItemId}/${tagId}`,
      {
        method: "DELETE",
      }
    );
    return { success: response.success };
  }

  // Orders endpoints
  async getOrders(params?: {
    status?: string;
    tableId?: string;
  }): Promise<{ orders: Order[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.tableId) queryParams.append("tableId", params.tableId);

    const endpoint = `/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("🌐 Fetching orders from:", `${this.baseURL}${endpoint}`);
    const response = await this.request<{
      data?: { orders: Order[] };
      orders?: Order[];
    }>(endpoint);

    console.log("📡 Raw API response for orders:", response);
    console.log("📡 Response structure:", {
      hasData: !!response.data,
      hasOrders: !!response.data?.orders,
      ordersLength: response.data?.orders?.length || 0,
      directOrders: !!response.orders,
      directOrdersLength: response.orders?.length || 0,
    });

    // Try different response structures
    let orders: Order[] = [];

    if (response.data && response.data.orders) {
      // Expected structure: { data: { orders: [...] } }
      orders = response.data.orders;
      console.log("✅ Using response.data.orders structure");
    } else if (response.orders) {
      // Alternative structure: { orders: [...] }
      orders = response.orders;
      console.log("✅ Using response.orders structure");
    } else {
      console.error("❌ Unexpected API response structure:", response);
      throw new Error(
        "API response does not contain orders data in expected format"
      );
    }

    console.log("📡 Orders array:", orders);

    // Log each order's structure
    orders.forEach((order, index) => {
      console.log(`📡 Order ${index + 1} total fields:`, {
        id: order.id,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount,
        total: order.total,
        calculatedTotal:
          order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0,
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
    const response = await this.request<{
      data?: { order: Order };
      order?: Order;
    }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Handle different response structures
    const order = response.data?.order || response.order;
    if (!order) {
      throw new Error("API response does not contain order data");
    }

    return { order };
  }

  async updateOrderStatus(
    id: string,
    status: "active" | "closed" | "cancelled" | "merged"
  ): Promise<{ order: Order }> {
    const response = await this.request<{
      data?: { order: Order };
      order?: Order;
    }>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    // Handle different response structures
    const order = response.data?.order || response.order;
    if (!order) {
      throw new Error("API response does not contain order data");
    }

    return { order };
  }

  async cancelOrder(
    id: string,
    reason: string = "Admin decision"
  ): Promise<{ success: boolean }> {
    const response = await this.request<{
      data?: { success: boolean };
      success?: boolean;
    }>(`/orders/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });

    // Handle different response structures
    const success = response.data?.success || response.success;
    if (success === undefined) {
      throw new Error("API response does not contain success status");
    }

    return { success };
  }

  async markOrderAsPaid(
    id: string,
    paymentMethod: "CASH" | "CARD" | "QR" | "STRIPE"
  ): Promise<{ success: boolean }> {
    const response = await this.request<{
      data?: { success: boolean };
      success?: boolean;
    }>(`/orders/${id}/pay`, {
      method: "PUT",
      body: JSON.stringify({
        paymentMethod,
        paymentStatus: "paid",
        status: "closed", // Close the order when payment is taken
      }),
    });

    // Handle different response structures
    const success = response.data?.success || response.success;
    if (success === undefined) {
      throw new Error("API response does not contain success data");
    }

    return { success };
  }

  async closeOrder(id: string, reason?: string): Promise<{ order: Order }> {
    const response = await this.request<{
      data?: { order: Order };
      order?: Order;
    }>(`/orders/${id}/close`, {
      method: "PUT",
      body: JSON.stringify({ reason: reason || "Customer finished dining" }),
    });

    // Handle different response structures
    const order = response.data?.order || response.order;
    if (!order) {
      throw new Error("API response does not contain order data");
    }

    return { order };
  }

  async modifyOrder(
    id: string,
    action: "add_item" | "remove_item" | "change_quantity",
    itemId: string,
    quantity: number,
    notes?: string
  ): Promise<{
    success: boolean;
    action: string;
    itemId: string;
    quantity: number;
  }> {
    const response = await this.request<{
      data?: {
        success: boolean;
        action: string;
        itemId: string;
        quantity: number;
      };
      success?: boolean;
      action?: string;
      itemId?: string;
      quantity?: number;
    }>(`/orders/${id}/modify`, {
      method: "PUT",
      body: JSON.stringify({ action, itemId, quantity, notes }),
    });

    // Handle different response structures
    const result = response.data || response;
    if (result.success === undefined) {
      throw new Error("API response does not contain success data");
    }

    return {
      success: result.success,
      action: result.action || action,
      itemId: result.itemId || itemId,
      quantity: result.quantity || quantity,
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
      method: "PUT",
      body: JSON.stringify({ changes }),
    });

    const result = response.data || response;
    if (result.success === undefined) {
      throw new Error("API response does not contain success data");
    }

    return {
      success: result.success,
      changes: result.changes || changes,
    };
  }

  // Move Order to Table endpoint
  async moveOrderToTable(
    orderId: string,
    data: {
      tableId: string;
      reason?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      order: Order;
      fromTable: string;
      toTable: string;
      movedBy: string;
      movedAt: string;
    };
    message: string;
    timestamp: string;
  }> {
    console.log("🔄 API: Moving order to table:", {
      orderId,
      tableId: data.tableId,
      reason: data.reason,
      url: `${this.baseURL}/orders/${orderId}/move-table`,
    });

    try {
      // Make a direct fetch call with detailed logging for move table
      const token = await (
        await import("./token-manager")
      ).tokenManager.getValidToken();
      const fullUrl = `${this.baseURL}/orders/${orderId}/move-table`;

      console.log("🔍 Making direct fetch call:", {
        url: fullUrl,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      const rawResponse = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      console.log("📥 Raw response:", {
        status: rawResponse.status,
        statusText: rawResponse.statusText,
        ok: rawResponse.ok,
        headers: Object.fromEntries(rawResponse.headers.entries()),
      });

      const responseText = await rawResponse.text();
      console.log("📄 Raw response text:", responseText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
        console.log("✅ Parsed response:", parsedResponse);
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!rawResponse.ok) {
        throw new Error(
          `HTTP ${rawResponse.status}: ${
            parsedResponse?.error?.message ||
            parsedResponse?.message ||
            rawResponse.statusText
          }`
        );
      }

      return parsedResponse;
    } catch (error: unknown) {
      console.error("❌ API: Move order failed:", {
        error,
        orderId,
        tableId: data.tableId,
        reason: data.reason,
        url: `${this.baseURL}/orders/${orderId}/move-table`,
        errorType: error?.constructor?.name,
        errorMessage: (error as Record<string, unknown>)?.message,
        errorStatus: (error as Record<string, unknown>)?.status,
        errorCode: (error as Record<string, unknown>)?.code,
      });

      // Re-throw with additional context
      throw new Error(
        `Move order API failed: ${
          (error as Error)?.message || "Unknown error"
        } (Order: ${orderId}, Table: ${data.tableId})`
      );
    }
  }

  // Split Order endpoint
  async splitOrder(
    orderId: string,
    data: {
      itemsToSplit: Array<{
        itemId: string;
        quantity: number;
      }>;
      newTableId?: string;
      customerName?: string;
      customerPhone?: string;
      specialInstructions?: string;
      reason?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      newOrder: Order;
      updatedSourceOrder: Order;
      splitDetails: {
        sourceOrderId: string;
        newOrderId: string;
        itemsSplit: number;
        totalSplitAmount: number;
        sourceOrderRemainingTotal: number;
        fromTable: string;
        toTable: string;
        reason: string;
        splitBy: string;
        splitAt: string;
      };
    };
    message: string;
  }> {
    console.log("🔄 API: Splitting order:", {
      orderId,
      itemsToSplit: data.itemsToSplit,
      newTableId: data.newTableId,
      reason: data.reason,
      url: `${this.baseURL}/orders/${orderId}/split`,
    });

    try {
      // Make a direct fetch call with detailed logging for split order
      const token = await (
        await import("./token-manager")
      ).tokenManager.getValidToken();
      const fullUrl = `${this.baseURL}/orders/${orderId}/split`;

      console.log("🔍 Making direct fetch call for split:", {
        url: fullUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      const rawResponse = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      console.log("📥 Raw split response:", {
        status: rawResponse.status,
        statusText: rawResponse.statusText,
        ok: rawResponse.ok,
        headers: Object.fromEntries(rawResponse.headers.entries()),
      });

      const responseText = await rawResponse.text();
      console.log("📄 Raw split response text:", responseText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
        console.log("✅ Parsed split response:", parsedResponse);
      } catch (parseError) {
        console.error("❌ Failed to parse split response:", parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!rawResponse.ok) {
        throw new Error(
          `HTTP ${rawResponse.status}: ${
            parsedResponse?.error?.message ||
            parsedResponse?.message ||
            rawResponse.statusText
          }`
        );
      }

      return parsedResponse;
    } catch (error: unknown) {
      console.error("❌ API: Split order failed:", {
        error,
        orderId,
        itemsToSplit: data.itemsToSplit,
        newTableId: data.newTableId,
        reason: data.reason,
        url: `${this.baseURL}/orders/${orderId}/split`,
        errorType: error?.constructor?.name,
        errorMessage: (error as Record<string, unknown>)?.message,
        errorStatus: (error as Record<string, unknown>)?.status,
        errorCode: (error as Record<string, unknown>)?.code,
      });

      // Re-throw with additional context
      throw new Error(
        `Split order API failed: ${
          (error as Error)?.message || "Unknown error"
        } (Order: ${orderId}, Items: ${data.itemsToSplit.length})`
      );
    }
  }

  // Tables endpoints
  async getTables(): Promise<{ tables: Table[] }> {
    const response = await this.request<{ tables: Table[] }>("/tables");
    console.log("TABLES DATA:", response);
    return { tables: response.tables };
  }

  // Merge Bills API Methods
  async getAllOrders(): Promise<{
    orders: Order[];
    orderGroups: Array<{
      id: string;
      name: string;
      orders: string[];
      totalAmount: number;
      customerName?: string;
    }>;
    summary: {
      totalOrders: number;
      totalAmount: number;
      canMerge: boolean;
      mergeRestrictions: string[];
    };
  }> {
    return this.request<{
      orders: Order[];
      orderGroups: Array<{
        id: string;
        name: string;
        orders: string[];
        totalAmount: number;
        customerName?: string;
      }>;
      summary: {
        totalOrders: number;
        totalAmount: number;
        canMerge: boolean;
        mergeRestrictions: string[];
      };
    }>("/orders/all");
  }

  async getTableOrders(tableId: string): Promise<{
    table: {
      id: string;
      number: string;
      order_count: number;
    };
    orders: Order[];
    orderGroups: Array<{
      id: string;
      name: string;
      orders: string[];
      totalAmount: number;
      customerName?: string;
    }>;
    tableSummary: {
      totalOrders: number;
      totalAmount: number;
      canMerge: boolean;
      mergeRestrictions: string[];
    };
  }> {
    return this.request<{
      table: {
        id: string;
        number: string;
        order_count: number;
      };
      orders: Order[];
      orderGroups: Array<{
        id: string;
        name: string;
        orders: string[];
        totalAmount: number;
        customerName?: string;
      }>;
      tableSummary: {
        totalOrders: number;
        totalAmount: number;
        canMerge: boolean;
        mergeRestrictions: string[];
      };
    }>(`/orders/table/${tableId}`);
  }

  async validateMerge(data: { sourceOrderIds: string[] }): Promise<{
    canMerge: boolean;
    restrictions: string[];
    warnings: string[];
    preview: {
      mergedOrder: Order;
      totalAmount: number;
      itemCount: number;
    };
  }> {
    console.log("🔍 Validating merge with data:", data);
    const response = await this.request<{
      canMerge: boolean;
      restrictions: string[];
      warnings: string[];
      preview: {
        mergedOrder: Order;
        totalAmount: number;
        itemCount: number;
      };
    }>("/orders/validate-merge", {
      method: "POST",
      body: JSON.stringify({
        sourceOrderIds: data.sourceOrderIds,
      }),
    });
    console.log("✅ Validate merge response:", response);
    return response;
  }

  async mergeOrders(data: {
    sourceOrderIds: string[];
    targetOrderId?: string;
    mergeStrategy: "append" | "create_new";
    tableId?: string;
    customerName?: string;
    customerPhone?: string;
    specialInstructions?: string;
    waiterId?: string;
    waiterName?: string;
    createNewOrder?: boolean;
  }): Promise<{
    mergedOrder: Order;
    sourceOrders: Order[];
    mergeSummary: {
      totalItems: number;
      totalAmount: number;
      itemCount: number;
      customerCount: number;
      ordersMerged: number;
    };
  }> {
    return this.request<{
      mergedOrder: Order;
      sourceOrders: Order[];
      mergeSummary: {
        totalItems: number;
        totalAmount: number;
        itemCount: number;
        customerCount: number;
        ordersMerged: number;
      };
    }>("/orders/merge", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createTable(data: {
    number: string;
    capacity: number;
    location?: string; // Legacy support
    locationId?: string; // New location system
    status?: string;
  }): Promise<{ table: Table }> {
    console.log("➕ Creating table with data:", data);
    console.log("🔗 POST request to:", `${this.baseURL}/tables`);
    const response = await this.request<{ table: Table }>("/tables", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("✅ Create table response:", response);
    return { table: response.table };
  }

  async updateTable(
    id: string,
    data: {
      number?: string;
      capacity?: number;
      location?: string; // Legacy support
      locationId?: string; // New location system
      status?: string;
    }
  ): Promise<{ table: Table }> {
    const response = await this.request<{ table: Table }>(`/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return { table: response.table };
  }

  async updateTableStatus(
    id: string,
    status: string
  ): Promise<{ table: Table }> {
    const response = await this.request<{ table: Table }>(
      `/tables/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
    return { table: response.table };
  }

  async deleteTable(id: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/tables/${id}`, {
      method: "DELETE",
    });
    return { success: response.success };
  }

  // Location management methods
  async getLocations(
    includeInactive = false
  ): Promise<{ locations: Location[] }> {
    const params = includeInactive ? "?includeInactive=true" : "";
    const response = await this.request<{ locations: Location[] }>(
      `/locations${params}`
    );
    console.log("LOCATIONS DATA:", response);
    return { locations: response.locations };
  }

  async createLocation(data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<{ location: Location; message: string }> {
    const response = await this.request<{
      location: Location;
      message: string;
    }>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("CREATE LOCATION RESPONSE:", response);
    return { location: response.location, message: response.message };
  }

  async updateLocation(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<{ location: Location; message: string }> {
    const response = await this.request<{
      location: Location;
      message: string;
    }>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return { location: response.location, message: response.message };
  }

  async deleteLocation(
    id: string,
    force = false
  ): Promise<{ success: boolean; message: string }> {
    const params = force ? "?force=true" : "";
    const response = await this.request<{
      success: boolean;
      message: string;
    }>(`/locations/${id}${params}`, {
      method: "DELETE",
    });
    return { success: response.success, message: response.message };
  }

  // Table Layout management methods
  async getTableLayouts(params?: {
    locationId?: string;
    includeInactive?: boolean;
  }): Promise<{ layouts: TableLayout[] }> {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.append("locationId", params.locationId);
    if (params?.includeInactive) queryParams.append("includeInactive", "true");

    const endpoint = `/table-layouts${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await this.request<{ layouts: TableLayout[] }>(endpoint);
    console.log("TABLE LAYOUTS DATA:", response);
    return { layouts: response.layouts };
  }

  async getTableLayout(id: string): Promise<{ layout: TableLayout }> {
    const response = await this.request<{ layout: TableLayout }>(
      `/table-layouts/${id}`
    );
    return { layout: response.layout };
  }

  async createTableLayout(data: {
    name: string;
    description?: string;
    locationId: string;
    layoutJson: TableLayout["layoutJson"];
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<{ layout: TableLayout; message: string }> {
    const response = await this.request<{
      layout: TableLayout;
      message: string;
    }>("/table-layouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("CREATE LAYOUT RESPONSE:", response);
    return { layout: response.layout, message: response.message };
  }

  async updateTableLayout(
    id: string,
    data: {
      name?: string;
      description?: string;
      locationId?: string;
      layoutJson?: TableLayout["layoutJson"];
      isActive?: boolean;
      isDefault?: boolean;
    }
  ): Promise<{ layout: TableLayout; message: string }> {
    const response = await this.request<{
      layout: TableLayout;
      message: string;
    }>(`/table-layouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return { layout: response.layout, message: response.message };
  }

  async deleteTableLayout(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{
      success: boolean;
      message: string;
    }>(`/table-layouts/${id}`, {
      method: "DELETE",
    });
    return { success: response.success, message: response.message };
  }

  async setDefaultTableLayout(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{
      success: boolean;
      message: string;
    }>(`/table-layouts/${id}/set-default`, {
      method: "PUT",
    });
    return { success: response.success, message: response.message };
  }

  // Analytics endpoints
  async getSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsSales> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/analytics/sales?${queryString}`
        : "/analytics/sales";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(endpoint);
      console.log("Sales analytics response:", response);

      // New external API structure: { success: true, data: { totalOrders, totalSales, averageOrderValue, topItems } }
      if (
        response.totalOrders !== undefined &&
        response.totalSales !== undefined
      ) {
        return {
          totalOrders: response.totalOrders,
          totalSales: response.totalSales,
          averageOrderValue: response.averageOrderValue || 0,
          topItems: response.topItems || [],
          dailySales: [], // External API doesn't provide dailySales, using empty array
        };
      } else {
        console.error(
          "Unexpected sales analytics response structure:",
          response
        );
        return {
          totalOrders: 0,
          totalSales: 0,
          averageOrderValue: 0,
          topItems: [],
          dailySales: [],
        };
      }
    } catch (error) {
      console.warn("Sales analytics API failed, using fallback data:", error);
      return {
        totalOrders: 0,
        totalSales: 0,
        averageOrderValue: 0,
        topItems: [],
        dailySales: [],
      };
    }
  }

  async getOrderAnalytics(): Promise<AnalyticsOrders> {
    const response = await this.request<{ data: AnalyticsOrders }>(
      "/analytics/orders"
    );
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardOverview(
    period: "week" | "month" | "year" = "month"
  ): Promise<{ summary: DashboardSummary }> {
    try {
      // Since the overview endpoint is still failing, construct overview from individual endpoints
      console.log(
        "Constructing dashboard overview from individual endpoints..."
      );

      const [
        ,
        ,
        revenueTrend,
        ,
        ,
      ] = await Promise.all([
        this.getTopItems(period, 10),
        this.getPeakHours(30),
        this.getRevenueTrend(30),
        this.getStaffPerformance(period),
        this.getPopularCombinations(5),
      ]);

      // Calculate totals from revenue trend
      const totalSales = revenueTrend.dailyData.reduce(
        (sum, day) => sum + (day.revenue || 0),
        0
      );
      const totalOrders = revenueTrend.dailyData.reduce(
        (sum, day) => sum + (day.orders || 0),
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Transform to internal format
      const summary: DashboardSummary = {
        totalOrders: {
          value: totalOrders,
          growth: 0,
          period: `${period} period`,
        },
        activeOrders: {
          value: 0, // Not available from individual endpoints
          status: "Currently processing",
        },
        cancelledOrders: {
          value: 0, // Not available from individual endpoints
          status: "Cancelled today",
        },
        totalRevenue: {
          value: totalSales,
          growth: 0,
          period: `${period} period`,
        },
        totalCustomers: {
          value: 0, // Not available from individual endpoints
          newToday: 0,
        },
        avgOrderValue: {
          value: averageOrderValue,
          growth: 0,
        },
        paymentMethods: {
          cash: { count: 0, revenue: 0 },
          card: { count: 0, revenue: 0 },
          qr: { count: 0, revenue: 0 },
          online: { count: 0, revenue: 0 },
          stripe: { count: 0, revenue: 0 },
        },
      };

      console.log("Dashboard overview constructed successfully:", summary);
      return { summary };
    } catch (error) {
      console.warn(
        "Dashboard overview construction failed, using fallback data:",
        error
      );
      return this.getDefaultDashboardSummary(period);
    }
  }

  private getDefaultDashboardSummary(period: string): {
    summary: DashboardSummary;
  } {
    return {
      summary: {
        totalOrders: { value: 0, growth: 0, period: `${period} period` },
        activeOrders: { value: 0, status: "Currently processing" },
        cancelledOrders: { value: 0, status: "Cancelled today" },
        totalRevenue: { value: 0, growth: 0, period: `${period} period` },
        totalCustomers: { value: 0, newToday: 0 },
        avgOrderValue: { value: 0, growth: 0 },
        paymentMethods: {
          cash: { count: 0, revenue: 0 },
          card: { count: 0, revenue: 0 },
          qr: { count: 0, revenue: 0 },
          online: { count: 0, revenue: 0 },
          stripe: { count: 0, revenue: 0 },
        },
      },
    };
  }

  async getLiveOrders(): Promise<{ orders: LiveOrder[] }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>("/dashboard/live-orders");
      console.log("Live orders response:", response);

      // Handle different response structures
      if (response.orders) {
        return { orders: response.orders };
      } else if (response.data?.orders) {
        return { orders: response.data.orders };
      } else if (response && Object.keys(response).length === 0) {
        // Empty response - likely endpoint not implemented yet
        console.warn(
          "Live orders endpoint returned empty response - likely not implemented yet"
        );
        return { orders: [] };
      } else {
        console.warn("Unexpected live orders response structure:", response);
        return { orders: [] };
      }
    } catch (error) {
      console.warn("Live orders API failed, using fallback data:", error);
      return { orders: [] };
    }
  }

  async getCancelledOrders(params?: {
    period?: "today" | "yesterday" | "week" | "month" | "year";
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<CancelledOrdersResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.period) queryParams.append("period", params.period);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/orders/cancelled?${queryString}`
        : "/orders/cancelled";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(endpoint);
      console.log("Cancelled orders response:", response);

      // Handle the response structure: { success: true, data: { orders, pagination, filters } }
      if (response.data?.orders && response.data?.pagination) {
        return {
          orders: response.data.orders,
          pagination: response.data.pagination,
          filters: response.data.filters || {},
        };
      } else if (response.orders && response.pagination) {
        // Handle direct response structure: { orders, pagination, filters }
        return {
          orders: response.orders,
          pagination: response.pagination,
          filters: response.filters || {},
        };
      } else {
        console.error(
          "Unexpected cancelled orders response structure:",
          response
        );
        return {
          orders: [],
          pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
          filters: {},
        };
      }
    } catch (error) {
      console.warn("Cancelled orders API failed, using fallback data:", error);
      return {
        orders: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
        filters: {},
      };
    }
  }

  async getRevenueTrend(days: number = 7): Promise<RevenueTrend> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(
        `/dashboard/revenue-trend?days=${days}`
      );
      console.log("Revenue trend response:", response);

      // New external API structure: { success: true, data: { revenueTrend: [...] } }
      if (response.revenueTrend) {
        return {
          growth: 0, // Calculate from revenueTrend data if needed
          totalRevenue: response.revenueTrend.reduce(
            (sum: number, item: { revenue?: number }) => sum + (item.revenue || 0),
            0
          ),
          dailyData: response.revenueTrend,
        };
      } else {
        console.error("Unexpected revenue trend response structure:", response);
        return {
          growth: 0,
          totalRevenue: 0,
          dailyData: [],
        };
      }
    } catch (error) {
      console.warn("Revenue trend API failed, using fallback data:", error);
      return {
        growth: 0,
        totalRevenue: 0,
        dailyData: [],
      };
    }
  }

  async getPeakHours(days: number = 30): Promise<PeakHours> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(
        `/dashboard/peak-hours?days=${days}`
      );
      console.log("Peak hours response:", response);

      // New external API structure: { success: true, data: { peakHours: [...] } }
      if (response.peakHours) {
        return { peakHours: response.peakHours };
      } else {
        console.error("Unexpected peak hours response structure:", response);
        return { peakHours: [] };
      }
    } catch (error) {
      console.warn("Peak hours API failed, using fallback data:", error);
      return { peakHours: [] };
    }
  }

  async getTopItems(
    period: "week" | "month" | "year" = "month",
    limit: number = 10
  ): Promise<TopItems> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(
        `/dashboard/top-items?period=${period}&limit=${limit}`
      );
      console.log("Top items response:", response);

      // New external API structure: { success: true, data: { topItems: [...] } }
      if (response.topItems) {
        // Transform external API response to internal format
        const topItems = response.topItems.map((item: { menuItemId: string; name: string; quantity: number; revenue: number; orderCount: number }) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          revenue: item.revenue,
          orderCount: item.orderCount,
        }));

        return {
          topItems,
          totalRevenue: topItems.reduce(
            (sum: number, item: { revenue: number }) => sum + item.revenue,
            0
          ),
        };
      } else {
        console.error("Unexpected top items response structure:", response);
        return { topItems: [], totalRevenue: 0 };
      }
    } catch (error) {
      console.warn("Top items API failed, using fallback data:", error);
      return { topItems: [], totalRevenue: 0 };
    }
  }

  async getStaffPerformance(
    period: "week" | "month" | "year" = "month"
  ): Promise<{ staffPerformance: StaffPerformance[] }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(
        `/dashboard/staff-performance?period=${period}`
      );
      console.log("Staff performance response:", response);

      // New external API structure: { success: true, data: { staffPerformance: [...] } }
      if (response.staffPerformance) {
        return { staffPerformance: response.staffPerformance };
      } else {
        console.error(
          "Unexpected staff performance response structure:",
          response
        );
        return { staffPerformance: [] };
      }
    } catch (error) {
      console.warn("Staff performance API failed, using fallback data:", error);
      return { staffPerformance: [] };
    }
  }

  async getPopularCombinations(
    limit: number = 5
  ): Promise<{ combinations: PopularCombination[] }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(
        `/dashboard/popular-combinations?limit=${limit}`
      );
      console.log("Popular combinations response:", response);

      // New external API structure: { success: true, data: { combinations: [...] } }
      if (response.combinations) {
        return { combinations: response.combinations };
      } else {
        console.error(
          "Unexpected popular combinations response structure:",
          response
        );
        return { combinations: [] };
      }
    } catch (error) {
      console.warn(
        "Popular combinations API failed, using fallback data:",
        error
      );
      return { combinations: [] };
    }
  }

  // Enhanced Analytics endpoints
  async getComprehensiveAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?:
      | "today"
      | "yesterday"
      | "week"
      | "month"
      | "quarter"
      | "year"
      | "custom";
  }): Promise<ComprehensiveAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.period) queryParams.append("period", params.period);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/analytics/comprehensive?${queryString}`
        : "/analytics/comprehensive";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request<any>(endpoint);
      console.log("Comprehensive analytics response:", response);

      // New external API structure: { success: true, data: { period, summary, growth, topItems, dailyData } }
      if (
        response.period &&
        response.summary &&
        response.growth &&
        response.topItems &&
        response.dailyData
      ) {
        return response;
      } else {
        console.error(
          "Unexpected comprehensive analytics response structure:",
          response
        );
        return this.getDefaultComprehensiveAnalytics();
      }
    } catch (error) {
      console.warn(
        "Comprehensive analytics API failed, using fallback data:",
        error
      );
      return this.getDefaultComprehensiveAnalytics();
    }
  }

  private getDefaultComprehensiveAnalytics(): ComprehensiveAnalytics {
    return {
      period: { start: "", end: "", type: "week" },
      summary: {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        uniqueCustomers: 0,
        orderStatus: {
          pending: 0,
          preparing: 0,
          ready: 0,
          paid: 0,
          cancelled: 0,
        },
      },
      growth: { orders: 0, revenue: 0, avgOrderValue: 0, customers: 0 },
      topItems: [],
      dailyData: [],
    };
  }

  // Settings endpoints
  async getSettings(): Promise<Settings> {
    const token = await tokenManager.getValidToken();

    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get settings: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateSettings(settings: Settings): Promise<{ success: boolean }> {
    const token = await tokenManager.getValidToken();

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  // Stripe Connect API functions
  async getStripeConnectConfig(): Promise<StripeConnectConfig> {
    const token = await tokenManager.getValidToken();
    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(`${API_BASE_URL}/stripe/admin/config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get Stripe Connect config: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("stripeDebug", "GET config response:", result);
    return result.data || result;
  }

  async createStripeConnectAccount(): Promise<{
    accountId: string;
    accountLink: string;
  }> {
    const token = await tokenManager.getValidToken();
    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(
      `${API_BASE_URL}/stripe/admin/create-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create Stripe Connect account: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateStripeConnectConfig(
    config: Partial<StripeConnectConfig>
  ): Promise<{ success: boolean }> {
    const token = await tokenManager.getValidToken();
    if (!token) {
      throw new Error("No valid token available");
    }

    const url = `${API_BASE_URL}/stripe/admin/config`;
    const requestBody = JSON.stringify(config);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      await response.text(); // Consume the error response
      throw new Error(
        `Failed to update Stripe Connect config: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data || result;
  }

  async testStripeConnection(): Promise<{
    success: boolean;
    message?: string;
    accountId?: string;
    testPaymentIntentId?: string;
    currency?: string;
    publishableKey?: string;
  }> {
    const token = await tokenManager.getValidToken();
    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(
      `${API_BASE_URL}/stripe/admin/test-connection`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to test Stripe connection: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("stripeDebug", "Test connection response:", result);

    if (result.success && result.data) {
      return result.data;
    } else if (result.success) {
      return result;
    } else {
      throw new Error(result.error?.message || "Test connection failed");
    }
  }

  async disconnectStripeAccount(): Promise<{ success: boolean }> {
    const token = await tokenManager.getValidToken();
    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(`${API_BASE_URL}/stripe/admin/config`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to disconnect Stripe account: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data || result;
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
  }> {
    console.log("🏥 Performing health check...");
    const response = await this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      environment: string;
      version: string;
    }>("/health");
    console.log("🏥 Health check response:", response);
    return response;
  }

  async uploadImage(file: File): Promise<string> {
    console.log("📤 Uploading image to external backend...");

    const formData = new FormData();
    formData.append("image", file);

    const token = await tokenManager.getValidToken();
    const userData = localStorage.getItem("user");
    let tenantId = "";

    if (userData) {
      try {
        const user = JSON.parse(userData);
        tenantId = user.tenantId || "";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // For file uploads, we need to handle the request manually
    // because we can't set Content-Type for multipart/form-data
    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Tenant-ID": tenantId,
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

    console.log("📤 Image upload response:", data);

    if (!response.ok) {
      throw new APIError(response.status, "UPLOAD_ERROR", "Upload failed");
    }

    return data.url;
  }

  // Promotion methods
  async getSimplePromotions(
    filters?: Record<string, string | number | boolean>
  ): Promise<{ success: boolean; data: { promotions: SimplePromotion[] } }> {
    const params = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : "";
    const promotions = await this.request<{ promotions: SimplePromotion[] }>(
      `/simple-promotions${params}`
    );
    return { success: true, data: promotions };
  }

  async getActiveSimplePromotions(): Promise<{
    promotions: SimplePromotion[];
  }> {
    const response = await this.request<{ promotions: SimplePromotion[] }>(
      "/simple-promotions/active"
    );
    return { promotions: response.promotions };
  }

  async createSimplePromotion(
    promotion: PromotionFormData
  ): Promise<{ success: boolean; data: { promotion: SimplePromotion } }> {
    console.log("🔗 Creating Simple Promotion - Data being sent:");
    console.log("  Promotion data:", JSON.stringify(promotion, null, 2));
    console.log("  API endpoint:", "/simple-promotions");

    const response = await this.request<{ promotion: SimplePromotion }>(
      "/simple-promotions",
      {
        method: "POST",
        body: JSON.stringify(promotion),
      }
    );
    return { success: true, data: response };
  }

  async updateSimplePromotion(
    id: string,
    promotion: Partial<PromotionFormData>
  ): Promise<{ success: boolean; data: { promotion: SimplePromotion } }> {
    const response = await this.request<{ promotion: SimplePromotion }>(
      `/simple-promotions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(promotion),
      }
    );
    return { success: true, data: response };
  }

  async deleteSimplePromotion(id: string): Promise<{ success: boolean }> {
    await this.request(`/simple-promotions/${id}`, {
      method: "DELETE",
    });
    return { success: true };
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
    console.log("🔗 Public API Request Details:");
    console.log("  Base URL:", this.baseURL);
    console.log("  Endpoint:", endpoint);
    console.log("  Full URL:", `${this.baseURL}${endpoint}`);
    console.log("  Tenant Slug:", tenantSlug);
    console.log("  No authentication required for public endpoints");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    console.log("  Request headers:", config.headers);
    console.log("  Request method:", config.method || "GET");

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data: APIResponse<T> = await response.json();

    console.log("📡 Public API Response Details:");
    console.log("  Status:", response.status);
    console.log("  Status text:", response.statusText);
    console.log("  Response data:", data);

    if (!response.ok) {
      console.error("❌ Public API Error:", response.status, data);
      throw new APIError(
        response.status,
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || "An unknown error occurred"
      );
    }

    if (!data.success) {
      throw new APIError(
        response.status,
        data.error?.code || "API_ERROR",
        data.error?.message || "API request failed"
      );
    }

    return data.data as T;
  }

  // Public menu endpoints (no authentication required)
  async getPublicMenuItems(
    tenantSlug: string,
    categoryId?: string
  ): Promise<{ items: MenuItem[] }> {
    const params = categoryId ? `?category=${categoryId}` : "";
    console.log(
      "🍽️ Fetching public menu items from:",
      `${this.baseURL}/menu/items${params}`
    );
    const response = await this.request<{ items: MenuItem[] }>(
      `/menu/items${params}`,
      tenantSlug
    );
    console.log("🍽️ Public menu items response:", response);
    console.log("🍽️ Public menu items array:", response.items);
    console.log("🍽️ Number of public menu items:", response.items?.length || 0);
    if (response.items && response.items.length > 0) {
      console.log("🍽️ First public menu item example:", response.items[0]);
    }
    return { items: response.items };
  }

  async getPublicMenuCategories(
    tenantSlug: string
  ): Promise<{ categories: MenuCategory[] }> {
    console.log(
      "📂 Fetching public menu categories from:",
      `${this.baseURL}/menu/categories`
    );
    const response = await this.request<{ categories: MenuCategory[] }>(
      "/menu/categories",
      tenantSlug
    );
    console.log("📂 Public menu categories response:", response);
    console.log("📂 Public menu categories array:", response.categories);
    console.log(
      "📂 Number of public categories:",
      response.categories?.length || 0
    );
    if (response.categories && response.categories.length > 0) {
      console.log("📂 First public category example:", response.categories[0]);
    }
    return { categories: response.categories };
  }

  async getPublicTables(tenantSlug: string): Promise<{ tables: Table[] }> {
    console.log("🔍 Fetching public tables from:", `${this.baseURL}/tables`);
    const response = await this.request<{ tables: Table[] }>(
      "/tables",
      tenantSlug
    );
    console.log("📋 Public tables response:", response);
    console.log("📋 Public tables array:", response.tables);
    console.log("📋 Number of public tables:", response.tables?.length || 0);
    if (response.tables && response.tables.length > 0) {
      console.log("📋 First public table example:", response.tables[0]);
    }
    return { tables: response.tables };
  }

  async getPublicTableByNumber(
    tenantSlug: string,
    tableNumber: string
  ): Promise<{ table: Table }> {
    console.log(
      "🪑 Fetching public table by number from:",
      `${this.baseURL}/public/tables/${tableNumber}?tenant=${tenantSlug}`
    );
    const response = await this.request<{ table: Table }>(
      `/public/tables/${tableNumber}?tenant=${tenantSlug}`,
      tenantSlug
    );
    console.log("🪑 Public table response:", response);
    return { table: response.table };
  }

  async createPublicOrder(
    data: {
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
    },
    tenantSlug: string
  ): Promise<{ order: Order }> {
    console.log("📝 Creating public order:", data);
    const response = await this.request<{ order: Order }>(
      "/orders",
      tenantSlug,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    console.log("✅ Public order created:", response);
    return { order: response.order };
  }
}

export const publicApi = new PublicAPIClient();

// Promotions API functions
export const getSimplePromotions = async (
  token: string,
  filters?: Record<string, string | number | boolean>
): Promise<{ success: boolean; data: { promotions: SimplePromotion[] } }> => {
  const params = filters
    ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
    : "";

  const response = await fetch(`${API_BASE_URL}/simple-promotions${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch promotions: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export const getActivePromotions = async (
  token: string,
  tenantId: string
): Promise<SimplePromotion[]> => {
  const response = await fetch(
    `${API_BASE_URL}/simple-promotions/active?tenantId=${tenantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch active promotions: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result.data || [];
};

export const createSimplePromotion = async (
  token: string,
  promotion: PromotionFormData
): Promise<{ success: boolean; data: { promotion: SimplePromotion } }> => {
  const response = await fetch(`${API_BASE_URL}/simple-promotions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promotion),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message ||
        `Failed to create promotion: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result;
};

export const updateSimplePromotion = async (
  token: string,
  id: string,
  promotion: Partial<PromotionFormData>
): Promise<{ success: boolean; data: { promotion: SimplePromotion } }> => {
  const response = await fetch(`${API_BASE_URL}/simple-promotions/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promotion),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message ||
        `Failed to update promotion: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result;
};

export const deleteSimplePromotion = async (
  token: string,
  id: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/simple-promotions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete promotion: ${response.statusText}`);
  }

  return { success: true };
};

// Public promotions API (no authentication required)
export const getPublicActivePromotions = async (
  tenantId: string
): Promise<SimplePromotion[]> => {
  const response = await fetch(
    `${API_BASE_URL}/simple-promotions/public/active?tenantId=${tenantId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch public promotions: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result.data || [];
};

export const calculatePublicPromotions = async (
  request: PromotionCalculationRequest
): Promise<PromotionCalculationResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/simple-promotions/public/calculate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message ||
        `Failed to calculate promotions: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result.data;
};
