"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { api } from "@/lib/api";
import { MenuCategory } from "@/lib/api";

interface PromotionFormData {
  name: string;
  description?: string;
  type: "BOGO" | "HAPPY_HOUR" | "PERCENTAGE_OFF" | "FIXED_OFF";
  priority?: number;
  startDate?: string;
  endDate?: string;
  tenantId?: string;

  // BOGO-specific fields
  buy_quantity?: number;
  get_quantity?: number;
  buy_target_type?: "ALL" | "CATEGORY" | "PRODUCTS";
  buy_target_category_id?: string;
  buy_target_product_ids?: string[];
  get_target_type?: "ALL" | "CATEGORY" | "PRODUCTS";
  get_target_category_id?: string;
  get_target_product_ids?: string[];

  // Happy Hour fields
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];

  // Discount fields
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number;

  // General targeting fields
  target_type?: "ALL" | "CATEGORY" | "PRODUCTS";
  target_category_id?: string;
  target_product_ids?: string[];
}

interface SimplePromotionFormV2Props {
  promotion?: PromotionFormData;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const SimplePromotionFormV2: React.FC<SimplePromotionFormV2Props> = ({
  promotion,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [formData, setFormData] = useState<PromotionFormData>({
    name: "",
    description: "",
    type: "PERCENTAGE_OFF",
    priority: 1,
    startDate: "",
    endDate: "",
    start_time: "",
    end_time: "",
    days_of_week: [] as number[],
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    buy_quantity: 1,
    get_quantity: 1,
    buy_target_type: "ALL",
    buy_target_category_id: "",
    buy_target_product_ids: [],
    get_target_type: "ALL",
    get_target_category_id: "",
    get_target_product_ids: [],
    target_type: "ALL",
    target_category_id: "",
    target_product_ids: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.getMenuCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load promotion data if editing
  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        type: promotion.type || "PERCENTAGE_OFF",
        priority: promotion.priority || 1,
        startDate: promotion.startDate || "",
        endDate: promotion.endDate || "",
        start_time: promotion.start_time || "",
        end_time: promotion.end_time || "",
        days_of_week: promotion.days_of_week || [],
        discount_value: promotion.discount_value || 0,
        min_order_amount: promotion.min_order_amount || 0,
        max_discount_amount: promotion.max_discount_amount || 0,
        buy_quantity: promotion.buy_quantity || 1,
        get_quantity: promotion.get_quantity || 1,
        buy_target_type: promotion.buy_target_type || "ALL",
        buy_target_category_id: promotion.buy_target_category_id || "",
        buy_target_product_ids: promotion.buy_target_product_ids || [],
        get_target_type: promotion.get_target_type || "ALL",
        get_target_category_id: promotion.get_target_category_id || "",
        get_target_product_ids: promotion.get_target_product_ids || [],
        target_type: promotion.target_type || "ALL",
        target_category_id: promotion.target_category_id || "",
        target_product_ids: promotion.target_product_ids || [],
      });
    }
  }, [promotion]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Type-specific validation
    if (formData.type === "BOGO") {
      if (!formData.buy_quantity || formData.buy_quantity < 1) {
        newErrors.buy_quantity = "Buy quantity must be at least 1";
      }
      if (!formData.get_quantity || formData.get_quantity < 1) {
        newErrors.get_quantity = "Get quantity must be at least 1";
      }
    }

    if (formData.type === "HAPPY_HOUR") {
      if (!formData.start_time) {
        newErrors.start_time = "Start time is required";
      }
      if (!formData.end_time) {
        newErrors.end_time = "End time is required";
      }
      if (!formData.days_of_week || formData.days_of_week.length === 0) {
        newErrors.days_of_week = "At least one day must be selected";
      }
    }

    if (formData.type === "PERCENTAGE_OFF" || formData.type === "FIXED_OFF") {
      if (!formData.discount_value || formData.discount_value <= 0) {
        newErrors.discount_value = "Discount value must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Clean up the data before sending - only include relevant fields
      const submissionData: PromotionFormData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tenantId: user?.tenantId || "",
      };

      // Add type-specific fields
      if (formData.type === "BOGO") {
        submissionData.buy_quantity = formData.buy_quantity;
        submissionData.get_quantity = formData.get_quantity;
        submissionData.buy_target_type = formData.buy_target_type;
        submissionData.get_target_type = formData.get_target_type;

        if (formData.buy_target_type === "CATEGORY") {
          submissionData.buy_target_category_id =
            formData.buy_target_category_id;
        }
        if (formData.buy_target_type === "PRODUCTS") {
          submissionData.buy_target_product_ids =
            formData.buy_target_product_ids;
        }
        if (formData.get_target_type === "CATEGORY") {
          submissionData.get_target_category_id =
            formData.get_target_category_id;
        }
        if (formData.get_target_type === "PRODUCTS") {
          submissionData.get_target_product_ids =
            formData.get_target_product_ids;
        }
      }

      if (formData.type === "HAPPY_HOUR") {
        submissionData.start_time = formData.start_time;
        submissionData.end_time = formData.end_time;
        submissionData.days_of_week = formData.days_of_week;
        submissionData.target_type = formData.target_type;

        if (formData.target_type === "CATEGORY") {
          submissionData.target_category_id = formData.target_category_id;
        }
        if (formData.target_type === "PRODUCTS") {
          submissionData.target_product_ids = formData.target_product_ids;
        }
      }

      if (formData.type === "PERCENTAGE_OFF" || formData.type === "FIXED_OFF") {
        submissionData.discount_value = formData.discount_value;
        submissionData.min_order_amount = formData.min_order_amount;
        submissionData.max_discount_amount = formData.max_discount_amount;
        submissionData.target_type = formData.target_type;

        if (formData.target_type === "CATEGORY") {
          submissionData.target_category_id = formData.target_category_id;
        }
        if (formData.target_type === "PRODUCTS") {
          submissionData.target_product_ids = formData.target_product_ids;
        }
      }

      console.log("Submitting promotion data:", submissionData);
      await onSubmit(submissionData);
    } catch (error) {
      console.error("Failed to submit promotion:", error);
      setErrors({ submit: "Failed to create promotion. Please try again." });
    }
  };

  const handleInputChange = (
    field: keyof PromotionFormData,
    value: string | number | string[] | number[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDayToggle = (day: number) => {
    const currentDays = formData.days_of_week || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    handleInputChange("days_of_week", newDays);
  };

  const handleAddProduct = (
    field: keyof PromotionFormData,
    productName: string
  ) => {
    if (!productName.trim()) return;

    const currentProducts = (formData[field] as string[]) || [];
    if (!currentProducts.includes(productName)) {
      const newProducts = [...currentProducts, productName];
      handleInputChange(field, newProducts);
    }
  };

  const handleRemoveProduct = (
    field: keyof PromotionFormData,
    index: number
  ) => {
    const currentProducts = (formData[field] as string[]) || [];
    const newProducts = currentProducts.filter((_, i) => i !== index);
    handleInputChange(field, newProducts);
  };

  const renderCategoryOptions = (
    field: keyof PromotionFormData,
    placeholder: string = "Select a category..."
  ) => (
    <select
      value={(formData[field] as string) || ""}
      onChange={(e) => handleInputChange(field, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
      disabled={isLoadingCategories}
    >
      <option value="">{placeholder}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );

  const renderProductInput = (
    field: keyof PromotionFormData,
    placeholder: string,
    selectedProducts: string[]
  ) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-black"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              handleAddProduct(field, target.value);
              target.value = "";
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget
              .previousElementSibling as HTMLInputElement;
            handleAddProduct(field, input.value);
            input.value = "";
          }}
          className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Add
        </button>
      </div>

      {selectedProducts && selectedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-black">Selected Products:</p>
          {selectedProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <span className="text-sm text-black">{product}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(field, index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "BOGO":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Buy Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.buy_quantity}
                  onChange={(e) =>
                    handleInputChange("buy_quantity", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                {errors.buy_quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.buy_quantity}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Get Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.get_quantity}
                  onChange={(e) =>
                    handleInputChange("get_quantity", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                {errors.get_quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.get_quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Buy Target */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                What customers buy
              </label>
              <select
                value={formData.buy_target_type}
                onChange={(e) =>
                  handleInputChange("buy_target_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="ALL">All items</option>
                <option value="CATEGORY">Specific category</option>
                <option value="PRODUCTS">Specific products</option>
              </select>
            </div>

            {formData.buy_target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Buy Target Category
                </label>
                {renderCategoryOptions(
                  "buy_target_category_id",
                  "Select buy target category..."
                )}
              </div>
            )}

            {formData.buy_target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Buy Target Products
                </label>
                {renderProductInput(
                  "buy_target_product_ids",
                  "Search products...",
                  formData.buy_target_product_ids || []
                )}
              </div>
            )}

            {/* Get Target */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                What customers get free
              </label>
              <select
                value={formData.get_target_type}
                onChange={(e) =>
                  handleInputChange("get_target_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="ALL">All items</option>
                <option value="CATEGORY">Specific category</option>
                <option value="PRODUCTS">Specific products</option>
              </select>
            </div>

            {formData.get_target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Get Target Category
                </label>
                {renderCategoryOptions(
                  "get_target_category_id",
                  "Select get target category..."
                )}
              </div>
            )}

            {formData.get_target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Get Target Products
                </label>
                {renderProductInput(
                  "get_target_product_ids",
                  "Search products...",
                  formData.get_target_product_ids || []
                )}
              </div>
            )}
          </div>
        );

      case "HAPPY_HOUR":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    handleInputChange("start_time", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_time}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    handleInputChange("end_time", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Days of Week *
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 1, label: "Mon" },
                  { value: 2, label: "Tue" },
                  { value: 3, label: "Wed" },
                  { value: 4, label: "Thu" },
                  { value: 5, label: "Fri" },
                  { value: 6, label: "Sat" },
                  { value: 7, label: "Sun" },
                ].map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      (formData.days_of_week || []).includes(day.value)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.days_of_week && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.days_of_week}
                </p>
              )}
            </div>

            {/* Targeting for Happy Hour */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                What gets discounted
              </label>
              <select
                value={formData.target_type}
                onChange={(e) =>
                  handleInputChange("target_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="ALL">All items</option>
                <option value="CATEGORY">Specific category</option>
                <option value="PRODUCTS">Specific products</option>
              </select>
            </div>

            {formData.target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Category
                </label>
                {renderCategoryOptions(
                  "target_category_id",
                  "Select target category..."
                )}
              </div>
            )}

            {formData.target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Products
                </label>
                {renderProductInput(
                  "target_product_ids",
                  "Search products...",
                  formData.target_product_ids || []
                )}
              </div>
            )}
          </div>
        );

      case "PERCENTAGE_OFF":
      case "FIXED_OFF":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Discount Value *
              </label>
              <div className="relative">
                {formData.type === "PERCENTAGE_OFF" && (
                  <span className="absolute left-3 top-2 text-black">%</span>
                )}
                {formData.type === "FIXED_OFF" && (
                  <span className="absolute left-3 top-2 text-black">$</span>
                )}
                <input
                  type="number"
                  min="0"
                  step={formData.type === "PERCENTAGE_OFF" ? "1" : "0.01"}
                  value={formData.discount_value || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "discount_value",
                      parseFloat(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-black ${
                    formData.type === "PERCENTAGE_OFF" ? "pl-8" : "pl-8"
                  }`}
                />
              </div>
              {errors.discount_value && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discount_value}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-black">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_order_amount || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "min_order_amount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Maximum Discount Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-black">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_discount_amount || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "max_discount_amount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Targeting for Percentage/Fixed Off */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                What gets discounted
              </label>
              <select
                value={formData.target_type}
                onChange={(e) =>
                  handleInputChange("target_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="ALL">All items</option>
                <option value="CATEGORY">Specific category</option>
                <option value="PRODUCTS">Specific products</option>
              </select>
            </div>

            {formData.target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Category
                </label>
                {renderCategoryOptions(
                  "target_category_id",
                  "Select target category..."
                )}
              </div>
            )}

            {formData.target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Products
                </label>
                {renderProductInput(
                  "target_product_ids",
                  "Search products...",
                  formData.target_product_ids || []
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="simple-promotion-form space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Basic Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Promotion Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            placeholder="Enter promotion name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            placeholder="Enter promotion description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Promotion Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="BOGO">Buy One Get One (BOGO)</option>
            <option value="HAPPY_HOUR">Happy Hour</option>
            <option value="PERCENTAGE_OFF">Percentage Off</option>
            <option value="FIXED_OFF">Fixed Amount Off</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Priority
          </label>
          <input
            type="number"
            min="1"
            value={formData.priority}
            onChange={(e) =>
              handleInputChange("priority", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>
      </div>

      {/* Type-Specific Fields */}
      {renderTypeSpecificFields()}

      {/* Date Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-black border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : promotion
            ? "Update Promotion"
            : "Create Promotion"}
        </button>
      </div>
    </form>
  );
};
