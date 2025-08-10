"use client";

import { Tag, Clock, Info } from "lucide-react";
import { AppliedPromotion } from "@/interfaces/promotion";

interface PromotionsDisplayProps {
  promotions: AppliedPromotion[];
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
  loading?: boolean;
}

export default function PromotionsDisplay({
  promotions,
  subtotal,
  totalDiscount,
  finalAmount,
  loading = false,
}: PromotionsDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

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

  const getPromotionColor = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "BOGO":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "PERCENTAGE_OFF":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "FIXED_OFF":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      {/* Promotions Applied Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Promotions Applied
          </span>
        </div>

        <div className="space-y-2">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className={`flex items-center justify-between p-2 rounded border ${getPromotionColor(
                promotion.type
              )}`}
            >
              <div className="flex items-center space-x-2">
                {getPromotionIcon(promotion.type)}
                <div>
                  <div className="text-sm font-medium">{promotion.name}</div>
                  <div className="text-xs opacity-75">
                    {promotion.applied_items.length > 0 && (
                      <span>
                        Applied to: {promotion.applied_items.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold">
                -${promotion.discount_amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Summary */}
      {totalDiscount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              You&apos;re saving ${totalDiscount.toFixed(2)}!
            </span>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-600">Promotions:</span>
            <span className="font-medium text-green-600">
              -${totalDiscount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-gray-900">
              ${finalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
