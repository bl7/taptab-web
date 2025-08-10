"use client";

import { useState, useEffect } from "react";
import { Clock, Tag } from "lucide-react";
import { getPublicActivePromotions } from "@/lib/api";
import { SimplePromotion } from "@/interfaces/promotion";

interface PublicPromotionsBannerProps {
  tenantSlug: string;
}

export default function PublicPromotionsBanner({
  tenantSlug,
}: PublicPromotionsBannerProps) {
  const [promotions, setPromotions] = useState<SimplePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        setLoading(true);
        const promotions = await getPublicActivePromotions(tenantSlug);
        setPromotions(promotions || []);
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
  }, [tenantSlug]);

  // Client-side validation of promotion status
  const isPromotionActive = (promotion: SimplePromotion): boolean => {
    const now = currentTime;

    // Check date restrictions if they exist
    if (promotion.start_date && promotion.end_date) {
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);

      // Check if current time is within promotion period
      if (now < startDate || now > endDate) return false;
    }

    // Check specific time restrictions
    if (promotion.start_time && promotion.end_time) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = promotion.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = promotion.end_time.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      if (
        currentTimeInMinutes < startTimeInMinutes ||
        currentTimeInMinutes > endTimeInMinutes
      ) {
        return false;
      }
    }

    // Check day restrictions
    if (promotion.days_of_week && promotion.days_of_week.length > 0) {
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (!promotion.days_of_week.includes(currentDay)) return false;
    }

    return true;
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Tag className="w-4 h-4" />;
      case "FIXED_AMOUNT":
        return <Tag className="w-4 h-4" />;
      case "BUY_X_GET_Y":
        return <Tag className="w-4 h-4" />;
      case "TIME_BASED":
        return <Clock className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getPromotionDescription = (promotion: SimplePromotion): string => {
    switch (promotion.type) {
      case "PERCENTAGE_OFF":
        return `${promotion.discount_value}% off`;
      case "FIXED_OFF":
        return `$${promotion.discount_value} off`;
      case "BOGO":
        return `Buy ${promotion.buy_quantity || 2} Get ${
          promotion.get_quantity || 1
        } Free`;
      case "HAPPY_HOUR":
        return `${promotion.discount_value}% off during ${
          promotion.start_time || ""
        } - ${promotion.end_time || ""}`;
      default:
        return promotion.name;
    }
  };

  const getTimeRemaining = (promotion: SimplePromotion): string => {
    if (!promotion.end_time) return "";

    const now = currentTime;
    const [endHour, endMinute] = promotion.end_time.split(":").map(Number);
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (now >= endTime) return "Ended";

    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const activePromotions = promotions.filter(isPromotionActive);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">Loading promotions...</div>
        </div>
      </div>
    );
  }

  if (activePromotions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span className="font-semibold">Special Offers!</span>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto">
            {activePromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1 text-sm"
              >
                {getPromotionIcon(promotion.type)}
                <span>{getPromotionDescription(promotion)}</span>
                {promotion.end_time && (
                  <span className="text-xs opacity-90">
                    {getTimeRemaining(promotion)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
