"use client";

import React, { useState, useEffect } from "react";
import { usePromotions } from "@/lib/use-promotions";
import { PromotionForm } from "@/components/promotion/PromotionForm";
import { PromotionsList } from "@/components/promotion/PromotionsList";
import { PromotionAnalytics } from "@/components/promotion/PromotionAnalytics";
import {
  PromotionTypeSelector,
  PromotionType,
} from "@/components/promotion/PromotionTypeSelector";
import { SimplePromotionForm } from "@/components/promotion/SimplePromotionForm";
import { Promotion, PromotionFilters } from "@/interfaces/promotion";

type ViewMode =
  | "list"
  | "select_type"
  | "create_simple"
  | "create_advanced"
  | "edit"
  | "analytics";

export default function PromotionsPage() {
  const {
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
  } = usePromotions();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [selectedPromotionType, setSelectedPromotionType] =
    useState<PromotionType | null>(null);
  const [filters, setFilters] = useState<PromotionFilters>({
    active: undefined,
    type: "",
    search: "",
    limit: 20,
    offset: 0,
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    fetchPromotions(filters);
  }, [filters, fetchPromotions]);

  const handleCreatePromotion = async (promotionData: Partial<Promotion>) => {
    try {
      setIsFormLoading(true);
      await createPromotion(promotionData);
      setViewMode("list");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCreateSimplePromotion = async (simpleData: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    discountValue?: number;
    minimumOrderAmount?: number;
    maxUsageLimit?: number;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: string[];
  }) => {
    // Convert simple form data to full promotion format
    const promotionData: Partial<Promotion> = {
      name: simpleData.name,
      description: simpleData.description,
      type:
        simpleData.type === "percentage_discount" ||
        simpleData.type === "minimum_order_discount"
          ? "CART_DISCOUNT"
          : simpleData.type === "fixed_amount_discount"
          ? "CART_DISCOUNT"
          : simpleData.type === "happy_hour"
          ? "TIME_BASED"
          : simpleData.type === "buy_one_get_one"
          ? "BOGO"
          : "CART_DISCOUNT",
      isActive: simpleData.isActive,
      startDate: simpleData.startDate,
      endDate: simpleData.endDate,
      // Convert simple discount to full structure
      discountType:
        simpleData.type === "percentage_discount" ||
        simpleData.type === "minimum_order_discount" ||
        simpleData.type === "happy_hour"
          ? "PERCENTAGE"
          : "FIXED_AMOUNT",
      discountValue: simpleData.discountValue || 0,
      minCartValue: simpleData.minimumOrderAmount || 0,
      usageLimit: simpleData.maxUsageLimit,
      minItems: 1,
      usageCount: 0,
      priority: 1,
      canCombineWithOthers: false,
      requiresCode: false,
      autoApply: true,
      customerSegments: [],
      customerTypes: [],
      // Time-based conditions for happy hour
      ...(simpleData.type === "happy_hour" && {
        timeRangeStart: simpleData.startTime,
        timeRangeEnd: simpleData.endTime,
        daysOfWeek: simpleData.daysOfWeek
          ?.map((day: string) =>
            [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ].indexOf(day)
          )
          .filter((index: number) => index !== -1),
      }),
    };

    await handleCreatePromotion(promotionData);
  };

  const handleSelectPromotionType = (type: PromotionType) => {
    setSelectedPromotionType(type);
    setViewMode("create_simple");
  };

  const handleUpdatePromotion = async (promotionData: Partial<Promotion>) => {
    if (!editingPromotion) return;

    try {
      setIsFormLoading(true);
      await updatePromotion(editingPromotion.id, promotionData);
      setViewMode("list");
      setEditingPromotion(null);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setViewMode("edit");
  };

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      await deletePromotion(id);
    }
  };

  const handleTogglePromotion = async (id: string, isActive: boolean) => {
    await togglePromotion(id, isActive);
  };

  const handleDuplicatePromotion = async (id: string) => {
    const newName = prompt("Enter name for the duplicated promotion:");
    if (newName) {
      await duplicatePromotion(id, newName);
    }
  };

  const handleFiltersChange = (newFilters: Partial<PromotionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleCancelForm = () => {
    setViewMode("list");
    setEditingPromotion(null);
    setSelectedPromotionType(null);
    clearError();
  };

  const handleBackToTypeSelection = () => {
    setViewMode("select_type");
    setSelectedPromotionType(null);
  };

  return (
    <div className="promotions-page text-black">
      <div className="page-header">
        <div className="header-content">
          <h1>Promotions</h1>
          <p>Manage your promotional offers and discounts</p>
        </div>

        <div className="header-actions">
          {viewMode === "list" && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setViewMode("analytics")}
              >
                View Analytics
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setViewMode("select_type")}
              >
                Create Promotion
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setViewMode("create_advanced")}
                title="For complex promotions"
              >
                Advanced Mode
              </button>
            </>
          )}

          {viewMode !== "list" && (
            <button className="btn btn-secondary" onClick={handleCancelForm}>
              Back to List
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <p>{error}</p>
            <button onClick={clearError}>×</button>
          </div>
        </div>
      )}

      <div className="page-content">
        {viewMode === "list" && (
          <PromotionsList
            promotions={promotions}
            loading={loading}
            filters={filters}
            pagination={pagination}
            onFiltersChange={handleFiltersChange}
            onPageChange={handlePageChange}
            onEdit={handleEditPromotion}
            onDelete={handleDeletePromotion}
            onToggle={handleTogglePromotion}
            onDuplicate={handleDuplicatePromotion}
          />
        )}

        {viewMode === "select_type" && (
          <PromotionTypeSelector
            onSelectType={handleSelectPromotionType}
            onCancel={handleCancelForm}
          />
        )}

        {viewMode === "create_simple" && selectedPromotionType && (
          <SimplePromotionForm
            promotionType={selectedPromotionType}
            onSave={handleCreateSimplePromotion}
            onCancel={handleCancelForm}
            onBack={handleBackToTypeSelection}
          />
        )}

        {viewMode === "create_advanced" && (
          <div className="form-container">
            <h2>Create Advanced Promotion</h2>
            <PromotionForm
              onSave={handleCreatePromotion}
              onCancel={handleCancelForm}
              isLoading={isFormLoading}
            />
          </div>
        )}

        {viewMode === "edit" && editingPromotion && (
          <div className="form-container">
            <h2>Edit Promotion</h2>
            <PromotionForm
              promotion={editingPromotion}
              onSave={handleUpdatePromotion}
              onCancel={handleCancelForm}
              isLoading={isFormLoading}
            />
          </div>
        )}

        {viewMode === "analytics" && <PromotionAnalytics />}
      </div>
    </div>
  );
}
