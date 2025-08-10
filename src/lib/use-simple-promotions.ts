"use client";

import { useState, useCallback } from "react";
import { api as apiClient } from "./api";
import {
  SimplePromotion,
  SimplePromotionCreateRequest,
  PromotionFormData,
  PromotionFilters,
} from "@/interfaces/promotion";

interface UseSimplePromotionsReturn {
  promotions: SimplePromotion[];
  loading: boolean;
  error: string | null;
  fetchPromotions: (filters?: PromotionFilters) => Promise<void>;
  createPromotion: (
    promotion: SimplePromotionCreateRequest
  ) => Promise<SimplePromotion>;
  updatePromotion: (
    id: string,
    promotion: Partial<PromotionFormData>
  ) => Promise<SimplePromotion>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotion: (id: string, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export const useSimplePromotions = (): UseSimplePromotionsReturn => {
  const [promotions, setPromotions] = useState<SimplePromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async (filters?: PromotionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getSimplePromotions(
        filters as Record<string, string | number | boolean>
      );
      setPromotions(response.data.promotions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch promotions";
      setError(errorMessage);
      console.error("Failed to fetch promotions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromotion = useCallback(
    async (
      promotion: SimplePromotionCreateRequest
    ): Promise<SimplePromotion> => {
      try {
        setError(null);

        const response = await apiClient.createSimplePromotion(promotion);
        setPromotions((prev) => [response.data.promotion, ...prev]);
        return response.data.promotion;
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
    async (
      id: string,
      promotion: Partial<PromotionFormData>
    ): Promise<SimplePromotion> => {
      try {
        setError(null);

        const response = await apiClient.updateSimplePromotion(id, promotion);
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? response.data.promotion : p))
        );
        return response.data.promotion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update promotion";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deletePromotion = useCallback(async (id: string) => {
    try {
      setError(null);

      await apiClient.deleteSimplePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete promotion";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const togglePromotion = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        setError(null);

        await updatePromotion(id, { isActive });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to toggle promotion";
        setError(errorMessage);
        throw err;
      }
    },
    [updatePromotion]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    clearError,
  };
};
