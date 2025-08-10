"use client";

import { useState, useEffect } from "react";
import { Clock, Tag } from "lucide-react";
import { api } from "@/lib/api";
import { SimplePromotion } from "@/interfaces/promotion";

interface PromotionsBannerProps {
  tenantId: string;
}

export default function PromotionsBanner({ tenantId }: PromotionsBannerProps) {
  const [promotions, setPromotions] = useState<SimplePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        setLoading(true);
        const response = await api.getActiveSimplePromotions();
        setPromotions(response.promotions || []);
      } catch (error) {
        console.error("Failed to fetch active promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePromotions();

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh promotions every 5 minutes
    const promotionInterval = setInterval(() => {
      fetchActivePromotions();
    }, 300000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(promotionInterval);
    };
  }, [tenantId]);

  const isPromotionActive = (promotion: SimplePromotion): boolean => {
    const now = currentTime;
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Check if promotion is within date range
    if (promotion.start_date && promotion.end_date) {
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);
      if (now < startDate || now > endDate) return false;
    }

    // Check if promotion is within time range (for daily promotions like Happy Hour)
    if (promotion.start_time && promotion.end_time) {
      const [startHour, startMinute] = promotion.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = promotion.end_time.split(":").map(Number);

      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      if (
        currentTimeMinutes < startTimeMinutes ||
        currentTimeMinutes > endTimeMinutes
      ) {
        return false;
      }
    }

    // Check if current day is in allowed days
    if (promotion.days_of_week && promotion.days_of_week.length > 0) {
      if (!promotion.days_of_week.includes(currentDay)) return false;
    }

    return true;
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return <Clock className="w-4 h-4" />;
      case "BOGO":
        return <Tag className="w-4 h-4" />;
      case "PERCENTAGE_OFF":
        return <Tag className="w-4 h-4" />;
      case "FIXED_OFF":
        return <Tag className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getPromotionDescription = (promotion: SimplePromotion): string => {
    switch (promotion.type) {
      case "HAPPY_HOUR":
        return `${promotion.discount_value}% off during Happy Hour`;
      case "BOGO":
        return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity} Free`;
      case "PERCENTAGE_OFF":
        return `${promotion.discount_value}% off`;
      case "FIXED_OFF":
        return `$${promotion.discount_value} off`;
      default:
        return promotion.description || "Special offer";
    }
  };

  const getTimeRemaining = (promotion: SimplePromotion): string | null => {
    if (!promotion.end_time) return null;

    const [endHour, endMinute] = promotion.end_time.split(":").map(Number);
    const now = currentTime;
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (now >= endTime) return null;

    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const activePromotions = promotions.filter(isPromotionActive);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <div className="w-32 h-4 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (activePromotions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-green-700">
              <Tag className="w-5 h-5" />
              <span className="font-semibold text-sm">Active Promotions</span>
            </div>
            <div className="flex items-center space-x-4">
              {activePromotions.slice(0, 3).map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-green-200 shadow-sm"
                >
                  <div className="text-green-600">
                    {getPromotionIcon(promotion.type)}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {promotion.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {getPromotionDescription(promotion)}
                    </div>
                  </div>
                  {promotion.end_time && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRemaining(promotion)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {activePromotions.length > 3 && (
            <div className="text-xs text-green-600 bg-white px-2 py-1 rounded border border-green-200">
              +{activePromotions.length - 3} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
