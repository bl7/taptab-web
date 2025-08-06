"use client";

import React, { useState, useEffect } from "react";
import {
  Promotion,
  PromotionItem,
  PromotionMenuItem,
  Category,
} from "@/interfaces/promotion";
import { api } from "@/lib/api";

interface PromotionFormProps {
  promotion?: Promotion;
  onSave: (promotion: Partial<Promotion>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  promotion,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    type: "CART_DISCOUNT",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minCartValue: 0,
    minItems: 1,
    autoApply: true,
    priority: 0,
    canCombineWithOthers: false,
    isActive: true,
    items: [],
    requiresCode: false,
    usageCount: 0,
    customerSegments: [],
    customerTypes: [],
    daysOfWeek: [],
  });

  const [menuItems, setMenuItems] = useState<PromotionMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMenuData();
    if (promotion) {
      setFormData(promotion);
    }
  }, [promotion]);

  const loadMenuData = async () => {
    try {
      setDataLoading(true);
      const [menuResponse, categoriesResponse] = await Promise.all([
        api.getMenuItems(),
        api.getMenuCategories(),
      ]);

      if (menuResponse?.items) {
        setMenuItems(
          menuResponse.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            categoryId: item.categoryId,
            description: item.description,
            imageUrl: item.image,
            isActive: item.isActive,
          }))
        );
      }

      if (categoriesResponse?.categories) {
        setCategories(
          categoriesResponse.categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: "",
            displayOrder: cat.sortOrder,
            isActive: cat.isActive,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load menu data:", err);
      setError("Failed to load menu data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name?.trim()) {
      setError("Promotion name is required");
      return;
    }

    if (formData.requiresCode && !formData.promoCode?.trim()) {
      setError("Promo code is required when 'Requires Code' is enabled");
      return;
    }

    try {
      setError(null);
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save promotion");
    }
  };

  const addPromotionItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          requiredQuantity: 1,
          freeQuantity: 0,
          isRequired: false,
        },
      ],
    }));
  };

  const updatePromotionItem = (
    index: number,
    updates: Partial<PromotionItem>
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const removePromotionItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
  };

  const handleDayToggle = (dayValue: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(dayValue)
        ? prev.daysOfWeek.filter((d) => d !== dayValue)
        : [...(prev.daysOfWeek || []), dayValue],
    }));
  };

  const showItemSelection = ["ITEM_DISCOUNT", "BOGO", "COMBO_DEAL"].includes(
    formData.type || ""
  );

  return (
    <div className="promotion-form">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="name">Promotion Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              placeholder="e.g., Happy Hour 20% Off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the promotion for customers"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Promotion Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as Promotion["type"],
                }))
              }
              required
            >
              <option value="CART_DISCOUNT">Cart Discount</option>
              <option value="ITEM_DISCOUNT">Item Discount</option>
              <option value="BOGO">Buy One Get One</option>
              <option value="COMBO_DEAL">Combo Deal</option>
              <option value="FIXED_PRICE">Fixed Price</option>
              <option value="TIME_BASED">Time-Based</option>
              <option value="COUPON">Coupon Code</option>
            </select>
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="form-section">
          <h3>Discount Configuration</h3>

          <div className="form-group">
            <label htmlFor="discountType">Discount Type *</label>
            <select
              id="discountType"
              value={formData.discountType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  discountType: e.target.value as Promotion["discountType"],
                }))
              }
              required
            >
              <option value="PERCENTAGE">Percentage Off</option>
              <option value="FIXED_AMOUNT">Fixed Amount Off</option>
              <option value="FIXED_PRICE">Fixed Price</option>
              <option value="FREE_ITEM">Free Item</option>
            </select>
          </div>

          {formData.discountType === "PERCENTAGE" && (
            <div className="form-group">
              <label htmlFor="discountValue">Discount Percentage (%) *</label>
              <input
                id="discountValue"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discountValue || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountValue: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                placeholder="e.g., 20"
              />
            </div>
          )}

          {formData.discountType === "FIXED_AMOUNT" && (
            <div className="form-group">
              <label htmlFor="discountValue">Discount Amount (Rs.) *</label>
              <input
                id="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountValue: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                placeholder="e.g., 100"
              />
            </div>
          )}

          {formData.discountType === "FIXED_PRICE" && (
            <div className="form-group">
              <label htmlFor="fixedPrice">Fixed Price (Rs.) *</label>
              <input
                id="fixedPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.fixedPrice || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fixedPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                placeholder="e.g., 500"
              />
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="form-section">
          <h3>Conditions</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minCartValue">Minimum Cart Value (Rs.)</label>
              <input
                id="minCartValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.minCartValue || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minCartValue: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxDiscountAmount">
                Maximum Discount Amount (Rs.)
              </label>
              <input
                id="maxDiscountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxDiscountAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxDiscountAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minItems">Minimum Items</label>
              <input
                id="minItems"
                type="number"
                min="1"
                value={formData.minItems || 1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minItems: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxItems">Maximum Items</label>
              <input
                id="maxItems"
                type="number"
                min="1"
                value={formData.maxItems || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxItems: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="No limit"
              />
            </div>
          </div>
        </div>

        {/* Time-based Conditions */}
        <div className="form-section">
          <h3>Time-based Conditions</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="datetime-local"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="datetime-local"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Time Range</label>
            <div className="time-range">
              <input
                type="time"
                value={formData.timeRangeStart || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeRangeStart: e.target.value,
                  }))
                }
                placeholder="Start time"
              />
              <span>to</span>
              <input
                type="time"
                value={formData.timeRangeEnd || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeRangeEnd: e.target.value,
                  }))
                }
                placeholder="End time"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Days of Week</label>
            <div className="days-selector">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        formData.daysOfWeek?.includes(index + 1) || false
                      }
                      onChange={() => handleDayToggle(index + 1)}
                    />
                    {day}
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Promo Code Settings */}
        <div className="form-section">
          <h3>Promo Code Settings</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requiresCode || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requiresCode: e.target.checked,
                  }))
                }
              />
              Requires Promo Code
            </label>
          </div>

          {formData.requiresCode && (
            <div className="form-group">
              <label htmlFor="promoCode">Promo Code</label>
              <input
                id="promoCode"
                type="text"
                value={formData.promoCode || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    promoCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., WELCOME10"
                style={{ textTransform: "uppercase" }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.autoApply || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoApply: e.target.checked,
                  }))
                }
              />
              Auto Apply (if conditions met)
            </label>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="form-section">
          <h3>Usage Limits</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="usageLimit">Total Usage Limit</label>
              <input
                id="usageLimit"
                type="number"
                min="1"
                value={formData.usageLimit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    usageLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="Unlimited"
              />
            </div>

            <div className="form-group">
              <label htmlFor="perCustomerLimit">Per Customer Limit</label>
              <input
                id="perCustomerLimit"
                type="number"
                min="1"
                value={formData.perCustomerLimit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    perCustomerLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="Unlimited"
              />
            </div>
          </div>
        </div>

        {/* Promotion Items */}
        {showItemSelection && (
          <div className="form-section">
            <h3>Applicable Items</h3>

            {formData.items?.map((item, index) => (
              <div key={item.id || index} className="promotion-item">
                <div className="form-group">
                  <label>Target</label>
                  <select
                    value={item.menuItemId || item.categoryId || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isMenuItem = menuItems.some(
                        (mi) => mi.id === value
                      );
                      updatePromotionItem(index, {
                        menuItemId: isMenuItem ? value : undefined,
                        categoryId: isMenuItem ? undefined : value,
                        menuItemName: isMenuItem
                          ? menuItems.find((mi) => mi.id === value)?.name
                          : undefined,
                        categoryName: isMenuItem
                          ? undefined
                          : categories.find((cat) => cat.id === value)?.name,
                      });
                    }}
                  >
                    <option value="">Select item or category</option>
                    <optgroup label="Categories">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Menu Items">
                      {menuItems.map((menuItem) => (
                        <option key={menuItem.id} value={menuItem.id}>
                          {menuItem.name} - Rs. {menuItem.price}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Required Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.requiredQuantity}
                      onChange={(e) =>
                        updatePromotionItem(index, {
                          requiredQuantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  {formData.type === "BOGO" && (
                    <div className="form-group">
                      <label>Free Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={item.freeQuantity}
                        onChange={(e) =>
                          updatePromotionItem(index, {
                            freeQuantity: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}

                  {item.maxQuantity !== undefined && (
                    <div className="form-group">
                      <label>Max Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.maxQuantity}
                        onChange={(e) =>
                          updatePromotionItem(index, {
                            maxQuantity: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.isRequired}
                      onChange={(e) =>
                        updatePromotionItem(index, {
                          isRequired: e.target.checked,
                        })
                      }
                    />
                    Required for promotion
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removePromotionItem(index)}
                  className="remove-item-btn"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addPromotionItem}
              className="add-item-btn"
            >
              Add Item
            </button>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="form-section">
          <h3>Advanced Settings</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">
                Priority (higher = applied first)
              </label>
              <input
                id="priority"
                type="number"
                value={formData.priority || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.canCombineWithOthers || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    canCombineWithOthers: e.target.checked,
                  }))
                }
              />
              Can combine with other promotions
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              Active
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={isLoading}>
            {isLoading ? "Saving..." : promotion ? "Update" : "Create"}{" "}
            Promotion
          </button>
        </div>
      </form>
    </div>
  );
};
