"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { calculatePublicPromotions } from "@/lib/api";
import {
  PromotionCalculationRequest,
  PromotionCalculationResponse,
  OrderItemForPromotion,
  AppliedPromotion,
} from "@/interfaces/promotion";

interface UsePromotionsCalculationReturn {
  calculation: PromotionCalculationResponse | null;
  loading: boolean;
  error: string | null;
  calculatePromotions: (orderItems: OrderItemForPromotion[]) => Promise<void>;
  clearCalculation: () => void;
  appliedPromotions: AppliedPromotion[];
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
}

export const usePromotionsCalculation = (tenantId: string): UsePromotionsCalculationReturn => {
  const [calculation, setCalculation] =
    useState<PromotionCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromotions, setAppliedPromotions] = useState<
    AppliedPromotion[]
  >([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, PromotionCalculationResponse>>(new Map());

  // Debounced calculation function
  const calculatePromotions = useCallback(
    async (orderItems: OrderItemForPromotion[]) => {
      if (orderItems.length === 0) {
        setCalculation(null);
        setAppliedPromotions([]);
        setSubtotal(0);
        setTotalDiscount(0);
        setFinalAmount(0);
        return;
      }

      // Create cache key based on order items
      const cacheKey = JSON.stringify(
        orderItems.sort((a, b) => a.menuItemId.localeCompare(b.menuItemId))
      );

      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        const cachedResult = cacheRef.current.get(cacheKey)!;
        setCalculation(cachedResult);
        setAppliedPromotions(cachedResult.applicablePromotions);
        setSubtotal(cachedResult.final_total);
        setTotalDiscount(cachedResult.total_discount);
        setFinalAmount(cachedResult.final_total);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const request: PromotionCalculationRequest = { 
          orderItems, 
          tenantId, 
          orderTime: new Date().toISOString() 
        };
        const response = await calculatePublicPromotions(request);

        // Cache the result
        cacheRef.current.set(cacheKey, response);

        // Limit cache size to prevent memory issues
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) {
            cacheRef.current.delete(firstKey);
          }
        }

        setCalculation(response);
        setAppliedPromotions(response.applicablePromotions);
        setSubtotal(response.final_total);
        setTotalDiscount(response.total_discount);
        setFinalAmount(response.final_total);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to calculate promotions";
        setError(errorMessage);
        console.error("Failed to calculate promotions:", err);

        // Fallback to basic calculation without promotions
        const fallbackSubtotal = orderItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        setSubtotal(fallbackSubtotal);
        setTotalDiscount(0);
        setFinalAmount(fallbackSubtotal);
        setAppliedPromotions([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  const debouncedCalculate = useCallback(
    async (orderItems: OrderItemForPromotion[]): Promise<void> => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      return new Promise((resolve) => {
        debounceTimeoutRef.current = setTimeout(async () => {
          await calculatePromotions(orderItems);
          resolve();
        }, 500); // 500ms debounce
      });
    },
    [calculatePromotions]
  );

  const clearCalculation = useCallback(() => {
    setCalculation(null);
    setAppliedPromotions([]);
    setSubtotal(0);
    setTotalDiscount(0);
    setFinalAmount(0);
    setError(null);
  }, []);

  // Clear cache when component unmounts
  useEffect(() => {
    const cache = cacheRef.current;
    const timeout = debounceTimeoutRef.current;

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      cache.clear();
    };
  }, []);

  return {
    calculation,
    loading,
    error,
    calculatePromotions: debouncedCalculate,
    clearCalculation,
    appliedPromotions,
    subtotal,
    totalDiscount,
    finalAmount,
  };
};
