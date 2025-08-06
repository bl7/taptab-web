"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { debounce } from "lodash";
import {
  Promotion,
  PromotionFilters,
  PromotionPreview,
  PromotionValidation,
  CartItem,
} from "@/interfaces/promotion";
import { PromotionAPI, OrderAPI } from "@/lib/promotion-api";

interface UsePromotionsReturn {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  } | null;
  fetchPromotions: (filters?: PromotionFilters) => Promise<void>;
  createPromotion: (promotion: Partial<Promotion>) => Promise<Promotion>;
  updatePromotion: (
    id: string,
    promotion: Partial<Promotion>
  ) => Promise<Promotion>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotion: (id: string, isActive: boolean) => Promise<void>;
  duplicatePromotion: (id: string, newName?: string) => Promise<Promotion>;
  clearError: () => void;
}

export const usePromotions = (): UsePromotionsReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
  } | null>(null);

  const fetchPromotions = useCallback(async (filters?: PromotionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await PromotionAPI.getPromotions(filters);

      if (response.success) {
        setPromotions(response.data);
        setPagination(response.pagination || null);
      } else {
        throw new Error("Failed to fetch promotions");
      }
    } catch (err) {
      let errorMessage = "Failed to fetch promotions";

      if (err instanceof Error) {
        if (err.message.includes("404")) {
          errorMessage =
            "Promotion API not yet implemented on backend. Please implement /api/v1/promotions endpoint.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Failed to fetch promotions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromotion = useCallback(
    async (promotion: Partial<Promotion>): Promise<Promotion> => {
      try {
        setError(null);

        const response = await PromotionAPI.createPromotion(promotion);

        if (response.success) {
          setPromotions((prev) => [response.data, ...prev]);
          return response.data;
        } else {
          throw new Error("Failed to create promotion");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create promotion";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updatePromotion = useCallback(
    async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
      try {
        setError(null);

        const response = await PromotionAPI.updatePromotion(id, promotion);

        if (response.success) {
          setPromotions((prev) =>
            prev.map((p) => (p.id === id ? response.data : p))
          );
          return response.data;
        } else {
          throw new Error("Failed to update promotion");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update promotion";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const response = await PromotionAPI.deletePromotion(id);

      if (response.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
      } else {
        throw new Error("Failed to delete promotion");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete promotion";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const togglePromotion = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      try {
        setError(null);

        const response = await PromotionAPI.togglePromotion(id, isActive);

        if (response.success) {
          setPromotions((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isActive } : p))
          );
        } else {
          throw new Error("Failed to toggle promotion");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to toggle promotion";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const duplicatePromotion = useCallback(
    async (id: string, newName?: string): Promise<Promotion> => {
      try {
        setError(null);

        const response = await PromotionAPI.duplicatePromotion(id, newName);

        if (response.success) {
          setPromotions((prev) => [response.data, ...prev]);
          return response.data;
        } else {
          throw new Error("Failed to duplicate promotion");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to duplicate promotion";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    promotions,
    loading,
    error,
    pagination,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    duplicatePromotion,
    clearError,
  };
};

interface UsePromotionPreviewReturn {
  preview: PromotionPreview | null;
  loading: boolean;
  error: string | null;
  previewPromotions: (
    items: CartItem[],
    promoCodes?: string[],
    customerPhone?: string
  ) => void;
  clearPreview: () => void;
}

export const usePromotionPreview = (
  tenantSlug: string
): UsePromotionPreviewReturn => {
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedPreview = useMemo(
    () =>
      debounce(
        async (
          items: CartItem[],
          promoCodes: string[] = [],
          customerPhone: string = ""
        ) => {
          if (items.length === 0) {
            setPreview(null);
            return;
          }

          setLoading(true);
          setError(null);

          try {
            const orderItems = items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            }));

            const data = await OrderAPI.previewPromotions({
              items: orderItems,
              tenantSlug,
              promoCodes,
              customerPhone,
            });

            setPreview(data);
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "Failed to preview promotions";
            setError(errorMessage);
            console.error("Preview failed:", err);
          } finally {
            setLoading(false);
          }
        },
        500
      ),
    [tenantSlug]
  );

  const previewPromotions = useCallback(
    (
      items: CartItem[],
      promoCodes: string[] = [],
      customerPhone: string = ""
    ) => {
      debouncedPreview(items, promoCodes, customerPhone);
    },
    [debouncedPreview]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    loading,
    error,
    previewPromotions,
    clearPreview,
  };
};

interface UsePromoCodeValidationReturn {
  validatePromoCode: (
    promoCode: string,
    orderItems?: CartItem[],
    cartTotal?: number,
    customerPhone?: string
  ) => Promise<PromotionValidation>;
  loading: boolean;
  error: string | null;
}

export const usePromoCodeValidation = (
  tenantSlug: string
): UsePromoCodeValidationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = useCallback(
    async (
      promoCode: string,
      orderItems: CartItem[] = [],
      cartTotal: number = 0,
      customerPhone: string = ""
    ): Promise<PromotionValidation> => {
      try {
        setLoading(true);
        setError(null);

        const result = await PromotionAPI.validatePromoCode({
          promoCode: promoCode.toUpperCase(),
          tenantSlug,
          customerPhone,
          orderItems,
          cartTotal,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to validate promo code";
        setError(errorMessage);

        return {
          valid: false,
          estimatedDiscount: 0,
          error: { code: "VALIDATION_ERROR", message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    [tenantSlug]
  );

  return {
    validatePromoCode,
    loading,
    error,
  };
};

interface UseAvailablePromotionsReturn {
  availablePromotions: Promotion[];
  loading: boolean;
  error: string | null;
  fetchAvailablePromotions: () => Promise<void>;
}

export const useAvailablePromotions = (
  tenantSlug: string
): UseAvailablePromotionsReturn => {
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailablePromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrderAPI.getAvailablePromotions(tenantSlug);

      if (response.success) {
        setAvailablePromotions(response.promotions);
      } else {
        throw new Error("Failed to fetch available promotions");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch available promotions";
      setError(errorMessage);
      console.error("Failed to fetch available promotions:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (tenantSlug) {
      fetchAvailablePromotions();
    }
  }, [tenantSlug, fetchAvailablePromotions]);

  return {
    availablePromotions,
    loading,
    error,
    fetchAvailablePromotions,
  };
};
