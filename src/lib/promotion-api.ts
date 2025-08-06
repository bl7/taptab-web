import {
  Promotion,
  PromotionAnalytics,
  PromotionFilters,
  PromotionValidation,
  PromotionPreview,
  OrderData,
} from "@/interfaces/promotion";
import { tokenManager } from "./token-manager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";

export class PromotionAPI {
  private static baseURL = `${API_BASE_URL}/promotions`;

  /**
   * Get all promotions with optional filters
   */
  static async getPromotions(filters?: PromotionFilters): Promise<{
    success: boolean;
    data: Promotion[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const token = await tokenManager.getValidToken();

      const response = await fetch(`${this.baseURL}?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      throw error;
    }
  }

  /**
   * Get a single promotion by ID
   */
  static async getPromotion(id: string): Promise<{
    success: boolean;
    data: Promotion;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch promotion:", error);
      throw error;
    }
  }

  /**
   * Create a new promotion
   */
  static async createPromotion(promotion: Partial<Promotion>): Promise<{
    success: boolean;
    data: Promotion;
  }> {
    try {
      const token = await tokenManager.getValidToken();

      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(promotion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create promotion:", error);
      throw error;
    }
  }

  /**
   * Update an existing promotion
   */
  static async updatePromotion(
    id: string,
    promotion: Partial<Promotion>
  ): Promise<{
    success: boolean;
    data: Promotion;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update promotion:", error);
      throw error;
    }
  }

  /**
   * Delete a promotion
   */
  static async deletePromotion(id: string): Promise<{
    success: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      throw error;
    }
  }

  /**
   * Validate a promo code
   */
  static async validatePromoCode(data: {
    promoCode: string;
    tenantSlug: string;
    customerPhone?: string;
    orderItems?: Array<{ menuItemId: string; quantity: number }>;
    cartTotal?: number;
  }): Promise<PromotionValidation> {
    try {
      const response = await fetch(`${this.baseURL}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          estimatedDiscount: 0,
          error: result.error || {
            code: "VALIDATION_FAILED",
            message: "Validation failed",
          },
        };
      }

      return result;
    } catch (error) {
      console.error("Failed to validate promo code:", error);
      return {
        valid: false,
        estimatedDiscount: 0,
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to validate promo code",
        },
      };
    }
  }

  /**
   * Get promotion analytics
   */
  static async getAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    promotionId?: string;
  }): Promise<{
    success: boolean;
    data: PromotionAnalytics[];
  }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseURL}/analytics?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch promotion analytics:", error);
      throw error;
    }
  }

  /**
   * Toggle promotion active status
   */
  static async togglePromotion(
    id: string,
    isActive: boolean
  ): Promise<{
    success: boolean;
    data: Promotion;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to toggle promotion:", error);
      throw error;
    }
  }

  /**
   * Duplicate a promotion
   */
  static async duplicatePromotion(
    id: string,
    newName?: string
  ): Promise<{
    success: boolean;
    data: Promotion;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to duplicate promotion:", error);
      throw error;
    }
  }
}

export class OrderAPI {
  /**
   * Preview promotions for cart items
   */
  static async previewPromotions(data: {
    items: Array<{ menuItemId: string; quantity: number }>;
    tenantSlug: string;
    promoCodes?: string[];
    customerPhone?: string;
  }): Promise<PromotionPreview> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/preview-promotions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to preview promotions:", error);
      throw error;
    }
  }

  /**
   * Get available promotions for a tenant
   */
  static async getAvailablePromotions(tenantSlug: string): Promise<{
    success: boolean;
    promotions: Promotion[];
  }> {
    try {
      const response = await fetch(
        `/api/v1/orders/available-promotions?tenantSlug=${tenantSlug}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch available promotions:", error);
      throw error;
    }
  }

  /**
   * Create order with promotion support
   */
  static async createOrderWithPromotions(
    orderData: OrderData,
    tenantSlug: string
  ): Promise<{
    success: boolean;
    data: unknown;
    appliedPromotions?: Array<{
      promotionId: string;
      promotionName: string;
      discountAmount: number;
    }>;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": tenantSlug,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }
}
