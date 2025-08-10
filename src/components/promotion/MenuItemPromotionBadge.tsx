"use client";

import { Tag, Clock } from "lucide-react";
import { SimplePromotion } from "@/interfaces/promotion";

interface MenuItemPromotionBadgeProps {
  promotion: SimplePromotion;
  className?: string;
}

export default function MenuItemPromotionBadge({
  promotion,
  className = "",
}: MenuItemPromotionBadgeProps) {
  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return <Clock className="w-3 h-3" />;
      case "BOGO":
        return <Tag className="w-3 h-3" />;
      case "PERCENTAGE_OFF":
        return <Tag className="w-3 h-3" />;
      case "FIXED_OFF":
        return <Tag className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "BOGO":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "PERCENTAGE_OFF":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "FIXED_OFF":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPromotionText = (type: string, value: number) => {
    switch (type) {
      case "HAPPY_HOUR":
        return `${value}% OFF`;
      case "BOGO":
        return "BOGO";
      case "PERCENTAGE_OFF":
        return `${value}% OFF`;
      case "FIXED_OFF":
        return `$${value} OFF`;
      default:
        return "OFFER";
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPromotionColor(
        promotion.type
      )} ${className}`}
    >
      {getPromotionIcon(promotion.type)}
      <span>{getPromotionText(promotion.type, promotion.discount_value)}</span>
    </div>
  );
}
