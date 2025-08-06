"use client";

import React, { useState } from "react";
import { PromotionType } from "./PromotionTypeSelector";

interface SimplePromotionData {
  name: string;
  description: string;
  type: string;
  // Common fields
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  // Type-specific fields
  discountValue?: number;
  minimumOrderAmount?: number;
  maxUsageLimit?: number;
  // Time-based
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
}

interface SimplePromotionFormProps {
  promotionType: PromotionType;
  onSave: (data: SimplePromotionData) => Promise<void>;
  onCancel: () => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export const SimplePromotionForm: React.FC<SimplePromotionFormProps> = ({
  promotionType,
  onSave,
  onCancel,
  onBack,
}) => {
  const [formData, setFormData] = useState<SimplePromotionData>({
    name: "",
    description: "",
    type: promotionType.id,
    isActive: true,
    daysOfWeek: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Promotion name is required";
    }

    if (promotionType.id === "percentage_discount" && !formData.discountValue) {
      newErrors.discountValue = "Discount percentage is required";
    } else if (
      promotionType.id === "percentage_discount" &&
      (formData.discountValue! < 1 || formData.discountValue! > 100)
    ) {
      newErrors.discountValue = "Discount must be between 1% and 100%";
    }

    if (
      promotionType.id === "fixed_amount_discount" &&
      !formData.discountValue
    ) {
      newErrors.discountValue = "Discount amount is required";
    }

    if (
      promotionType.id === "minimum_order_discount" &&
      !formData.minimumOrderAmount
    ) {
      newErrors.minimumOrderAmount = "Minimum order amount is required";
    }

    if (promotionType.id === "happy_hour") {
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";
      if (formData.daysOfWeek?.length === 0)
        newErrors.daysOfWeek = "Select at least one day";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Failed to save promotion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof SimplePromotionData,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDayToggle = (dayId: string) => {
    const currentDays = formData.daysOfWeek || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter((d) => d !== dayId)
      : [...currentDays, dayId];
    handleInputChange("daysOfWeek", newDays);
  };

  const renderTypeSpecificFields = () => {
    switch (promotionType.id) {
      case "percentage_discount":
        return (
          <div className="form-group">
            <label htmlFor="discountValue">Discount Percentage *</label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="discountValue"
                min="1"
                max="100"
                value={formData.discountValue || ""}
                onChange={(e) =>
                  handleInputChange("discountValue", parseFloat(e.target.value))
                }
                className={errors.discountValue ? "error" : ""}
                placeholder="10"
              />
              <span className="input-suffix">%</span>
            </div>
            {errors.discountValue && (
              <span className="error-message">{errors.discountValue}</span>
            )}
          </div>
        );

      case "fixed_amount_discount":
        return (
          <div className="form-group">
            <label htmlFor="discountValue">Discount Amount *</label>
            <div className="input-with-prefix">
              <span className="input-prefix">Rs.</span>
              <input
                type="number"
                id="discountValue"
                min="1"
                value={formData.discountValue || ""}
                onChange={(e) =>
                  handleInputChange("discountValue", parseFloat(e.target.value))
                }
                className={errors.discountValue ? "error" : ""}
                placeholder="100"
              />
            </div>
            {errors.discountValue && (
              <span className="error-message">{errors.discountValue}</span>
            )}
          </div>
        );

      case "minimum_order_discount":
        return (
          <>
            <div className="form-group">
              <label htmlFor="discountValue">Discount Percentage *</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="discountValue"
                  min="1"
                  max="100"
                  value={formData.discountValue || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "discountValue",
                      parseFloat(e.target.value)
                    )
                  }
                  className={errors.discountValue ? "error" : ""}
                  placeholder="15"
                />
                <span className="input-suffix">%</span>
              </div>
              {errors.discountValue && (
                <span className="error-message">{errors.discountValue}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="minimumOrderAmount">Minimum Order Amount *</label>
              <div className="input-with-prefix">
                <span className="input-prefix">Rs.</span>
                <input
                  type="number"
                  id="minimumOrderAmount"
                  min="1"
                  value={formData.minimumOrderAmount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "minimumOrderAmount",
                      parseFloat(e.target.value)
                    )
                  }
                  className={errors.minimumOrderAmount ? "error" : ""}
                  placeholder="500"
                />
              </div>
              {errors.minimumOrderAmount && (
                <span className="error-message">
                  {errors.minimumOrderAmount}
                </span>
              )}
            </div>
          </>
        );

      case "happy_hour":
        return (
          <>
            <div className="form-group">
              <label htmlFor="discountValue">Discount Percentage *</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="discountValue"
                  min="1"
                  max="100"
                  value={formData.discountValue || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "discountValue",
                      parseFloat(e.target.value)
                    )
                  }
                  className={errors.discountValue ? "error" : ""}
                  placeholder="20"
                />
                <span className="input-suffix">%</span>
              </div>
              {errors.discountValue && (
                <span className="error-message">{errors.discountValue}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="time"
                  id="startTime"
                  value={formData.startTime || ""}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={errors.startTime ? "error" : ""}
                />
                {errors.startTime && (
                  <span className="error-message">{errors.startTime}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  value={formData.endTime || ""}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={errors.endTime ? "error" : ""}
                />
                {errors.endTime && (
                  <span className="error-message">{errors.endTime}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Days of Week *</label>
              <div className="days-of-week">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day.id} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek?.includes(day.id) || false}
                      onChange={() => handleDayToggle(day.id)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && (
                <span className="error-message">{errors.daysOfWeek}</span>
              )}
            </div>
          </>
        );

      default:
        return (
          <div className="form-group">
            <label htmlFor="discountValue">Discount Value</label>
            <input
              type="number"
              id="discountValue"
              value={formData.discountValue || ""}
              onChange={(e) =>
                handleInputChange("discountValue", parseFloat(e.target.value))
              }
              placeholder="Enter discount value"
            />
          </div>
        );
    }
  };

  return (
    <div className="simple-promotion-form">
      <div className="form-header">
        <div className="promotion-type-badge">
          <span className="type-icon">{promotionType.icon}</span>
          <div>
            <h2>{promotionType.name}</h2>
            <p>{promotionType.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="promotion-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="name">Promotion Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "error" : ""}
              placeholder="e.g., Weekend Special, Happy Hour Discount"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description for customers"
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Discount Details</h3>
          {renderTypeSpecificFields()}
        </div>

        <div className="form-section">
          <h3>Validity Period</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate || ""}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate || ""}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Usage Limits</h3>

          <div className="form-group">
            <label htmlFor="maxUsageLimit">Maximum Uses</label>
            <input
              type="number"
              id="maxUsageLimit"
              min="1"
              value={formData.maxUsageLimit || ""}
              onChange={(e) =>
                handleInputChange("maxUsageLimit", parseInt(e.target.value))
              }
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
              />
              <span>Activate this promotion immediately</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back to Types
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Promotion"}
          </button>
        </div>
      </form>
    </div>
  );
};
