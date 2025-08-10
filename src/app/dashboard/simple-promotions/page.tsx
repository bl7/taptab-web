"use client";

import React, { useState, useEffect } from "react";
import { useSimplePromotions } from "@/lib/use-simple-promotions";
import { SimplePromotionFormV2 } from "@/components/promotion/SimplePromotionFormV2";
import { SimplePromotionsList } from "@/components/promotion/SimplePromotionsList";
import {
  SimplePromotion,
  SimplePromotionCreateRequest,
} from "@/interfaces/promotion";

type ViewMode = "list" | "create" | "edit";

export default function SimplePromotionsPage() {
  const {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    clearError,
  } = useSimplePromotions();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPromotion, setEditingPromotion] =
    useState<SimplePromotion | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleCreatePromotion = async (
    promotionData: SimplePromotionCreateRequest
  ) => {
    try {
      setIsFormLoading(true);
      await createPromotion(promotionData);
      setViewMode("list");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdatePromotion = async (
    promotionData: SimplePromotionCreateRequest
  ) => {
    if (!editingPromotion || !editingPromotion.id) return;

    try {
      setIsFormLoading(true);
      const updateData = { ...promotionData, id: editingPromotion.id };
      await updatePromotion(editingPromotion.id, updateData);
      setViewMode("list");
      setEditingPromotion(null);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditPromotion = (promotion: SimplePromotion) => {
    setEditingPromotion(promotion);
    setViewMode("edit");
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      await deletePromotion(id);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  const handleTogglePromotion = async (id: string, isActive: boolean) => {
    try {
      await togglePromotion(id, isActive);
    } catch (error) {
      console.error("Failed to toggle promotion:", error);
    }
  };

  const handleCancelForm = () => {
    setViewMode("list");
    setEditingPromotion(null);
    clearError();
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Promotion
              </h2>
              <p className="text-gray-600 mt-2">
                Set up a new promotion to attract customers and increase sales.
              </p>
            </div>
            <SimplePromotionFormV2
              onSubmit={handleCreatePromotion}
              onCancel={handleCancelForm}
              loading={isFormLoading}
            />
          </div>
        );

      case "edit":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Promotion
              </h2>
              <p className="text-gray-600 mt-2">
                Update the promotion details and settings.
              </p>
            </div>
            <SimplePromotionFormV2
              promotion={editingPromotion!}
              onSubmit={handleUpdatePromotion}
              onCancel={handleCancelForm}
              loading={isFormLoading}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Simple Promotions
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your restaurant promotions with our simple and
                  effective system.
                </p>
              </div>
              <button
                onClick={() => setViewMode("create")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Promotion
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Active Promotions
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {promotions.filter((p) => p.isActive).length} active,{" "}
                  {promotions.filter((p) => !p.isActive).length} inactive
                </p>
              </div>
              <div className="p-6">
                <SimplePromotionsList
                  promotions={promotions}
                  onEdit={handleEditPromotion}
                  onDelete={handleDeletePromotion}
                  onToggle={handleTogglePromotion}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
}
