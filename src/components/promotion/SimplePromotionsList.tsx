"use client";

import React, { useState } from "react";
import { SimplePromotion } from "@/interfaces/promotion";

interface SimplePromotionsListProps {
  promotions: SimplePromotion[];
  onEdit: (promotion: SimplePromotion) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  loading?: boolean;
}

export const SimplePromotionsList: React.FC<SimplePromotionsListProps> = ({
  promotions,
  onEdit,
  onDelete,
  onToggle,
  loading = false,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return "Happy Hour";
      case "BOGO":
        return "Buy X Get Y";
      case "PERCENTAGE_OFF":
        return "Percentage Off";
      case "FIXED_OFF":
        return "Fixed Amount Off";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "HAPPY_HOUR":
        return "bg-orange-100 text-orange-800";
      case "BOGO":
        return "bg-purple-100 text-purple-800";
      case "PERCENTAGE_OFF":
        return "bg-blue-100 text-blue-800";
      case "FIXED_OFF":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDiscountValue = (promotion: SimplePromotion) => {
    switch (promotion.type) {
      case "HAPPY_HOUR":
      case "PERCENTAGE_OFF":
        return `${promotion.discount_value}%`;
      case "FIXED_OFF":
        return `$${promotion.discount_value.toFixed(2)}`;
      case "BOGO":
        return `Buy ${promotion.buy_quantity}, Get ${promotion.get_quantity} Free`;
      default:
        return promotion.discount_value.toString();
    }
  };

  const formatTimeRange = (promotion: SimplePromotion) => {
    if (
      promotion.type === "HAPPY_HOUR" &&
      promotion.start_time &&
      promotion.end_time
    ) {
      return `${promotion.start_time} - ${promotion.end_time}`;
    }
    return null;
  };

  const formatDaysOfWeek = (days: number[]) => {
    if (!days || days.length === 0) return null;

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => dayLabels[day - 1]).join(", ");
  };

  const formatDateRange = (promotion: SimplePromotion) => {
    if (promotion.start_date && promotion.end_date) {
      return `${promotion.start_date} to ${promotion.end_date}`;
    } else if (promotion.start_date) {
      return `From ${promotion.start_date}`;
    } else if (promotion.end_date) {
      return `Until ${promotion.end_date}`;
    }
    return "No date restrictions";
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async (id: string) => {
    await onDelete(id);
    setDeleteConfirmId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No promotions found</div>
        <div className="text-gray-400 text-sm">
          Create your first promotion to get started
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <div
          key={promotion.id}
          className={`bg-white rounded-lg border p-6 transition-all ${
            promotion.isActive
              ? "border-green-200 shadow-sm"
              : "border-gray-200 opacity-75"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {promotion.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    promotion.type
                  )}`}
                >
                  {getTypeLabel(promotion.type)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    promotion.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {promotion.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {promotion.description && (
                <p className="text-gray-600 mb-3">{promotion.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Discount:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDiscountValue(promotion)}
                  </span>
                </div>

                {promotion.min_order_amount &&
                  promotion.min_order_amount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Min Order:
                      </span>
                      <span className="ml-2 text-gray-900">
                        ${Number(promotion.min_order_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                {promotion.max_discount_amount &&
                  promotion.max_discount_amount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Max Discount:
                      </span>
                      <span className="ml-2 text-gray-900">
                        ${Number(promotion.max_discount_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                {formatTimeRange(promotion) && (
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <span className="ml-2 text-gray-900">
                      {formatTimeRange(promotion)}
                    </span>
                  </div>
                )}

                {formatDaysOfWeek(promotion.days_of_week || []) && (
                  <div>
                    <span className="font-medium text-gray-700">Days:</span>
                    <span className="ml-2 text-gray-900">
                      {formatDaysOfWeek(promotion.days_of_week || [])}
                    </span>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">Target:</span>
                  <span className="ml-2 text-gray-900">
                    {promotion.target_type === "ALL" && "All Items"}
                    {promotion.target_type === "CATEGORY" &&
                      "Specific Category"}
                    {promotion.target_type === "PRODUCTS" &&
                      "Specific Products"}
                  </span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className="ml-2 text-gray-900">
                    {promotion.priority}
                  </span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Date Range:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDateRange(promotion)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() =>
                  promotion.id && onToggle(promotion.id, !promotion.isActive)
                }
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  promotion.isActive
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {promotion.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => onEdit(promotion)}
                className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => promotion.id && handleDeleteClick(promotion.id)}
                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {promotion.id && deleteConfirmId === promotion.id && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete &quot;{promotion.name}&quot;?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      promotion.id && handleDeleteConfirm(promotion.id)
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
