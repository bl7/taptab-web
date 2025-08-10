"use client";

import React, { useState, useEffect } from "react";
import {
  SimplePromotion,
  SimplePromotionCreateRequest,
  PromotionFormData,
} from "@/interfaces/promotion";
import { api } from "@/lib/api";
import { MenuCategory } from "@/lib/api";

interface SimplePromotionFormV2Props {
  promotion?: SimplePromotion;
  onSubmit: (data: SimplePromotionCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const SimplePromotionFormV2: React.FC<SimplePromotionFormV2Props> = ({
  promotion,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<PromotionFormData>({
    name: "",
    description: "",
    type: "PERCENTAGE_OFF",
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    days_of_week: [],
    priority: 1,
    isActive: true,
    target_type: "ALL",
    target_category_id: "",
    target_product_ids: [],
    buy_quantity: 1,
    get_quantity: 1,
    buy_target_type: "ALL",
    buy_target_category_id: "",
    buy_target_product_ids: [],
    get_target_type: "ALL",
    get_target_category_id: "",
    get_target_product_ids: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Temporary search input state
  const [productSearch] = useState("");
  const [buyProductSearch] = useState("");
  const [getProductSearch] = useState("");

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type,
        discount_value: promotion.discount_value,
        min_order_amount: promotion.min_order_amount || 0,
        max_discount_amount: promotion.max_discount_amount || 0,
        buy_quantity: promotion.buy_quantity || 1,
        get_quantity: promotion.get_quantity || 1,
        start_time: promotion.start_time || "",
        end_time: promotion.end_time || "",
        days_of_week: promotion.days_of_week || [],
        target_type: promotion.target_type,
        target_category_id: promotion.target_category_id || "",
        target_product_ids: promotion.target_product_ids || [],
        buy_target_type: promotion.buy_target_type || "ALL",
        buy_target_category_id: promotion.buy_target_category_id || "",
        buy_target_product_ids: promotion.buy_target_product_ids || [],
        get_target_type: promotion.get_target_type || "ALL",
        get_target_category_id:
          promotion.get_target_type === "CATEGORY"
            ? promotion.get_target_category_id || ""
            : "",
        get_target_product_ids:
          promotion.get_target_type === "PRODUCTS"
            ? promotion.get_target_product_ids || []
            : [],
        priority: promotion.priority,
        start_date: promotion.start_date || "",
        end_date: promotion.end_date || "",
        isActive: promotion.isActive,
      });
    }
  }, [promotion]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.type === "HAPPY_HOUR") {
      if (!formData.start_time) {
        newErrors.start_time = "Start time is required for Happy Hour";
      }
      if (!formData.end_time) {
        newErrors.end_time = "End time is required for Happy Hour";
      }
      if (!formData.days_of_week || formData.days_of_week.length === 0) {
        newErrors.days_of_week =
          "At least one day must be selected for Happy Hour";
      }
    }

    if (formData.type === "BOGO") {
      if (!formData.buy_quantity || formData.buy_quantity < 1) {
        newErrors.buy_quantity = "Buy quantity must be at least 1";
      }
      if (!formData.get_quantity || formData.get_quantity < 1) {
        newErrors.get_quantity = "Get quantity must be at least 1";
      }

      // Validate BOGO targeting fields
      if (
        formData.buy_target_type === "CATEGORY" &&
        !formData.buy_target_category_id
      ) {
        newErrors.buy_target_category_id =
          "Buy target category is required when targeting specific category";
      }
      if (
        formData.buy_target_type === "PRODUCTS" &&
        (!formData.buy_target_product_ids ||
          formData.buy_target_product_ids.length === 0)
      ) {
        newErrors.buy_target_product_ids =
          "At least one buy target product must be selected when targeting specific products";
      }
      if (
        formData.get_target_type === "CATEGORY" &&
        !formData.get_target_category_id
      ) {
        newErrors.get_target_category_id =
          "Get target category is required when targeting specific category";
      }
      if (
        formData.get_target_type === "PRODUCTS" &&
        (!formData.get_target_product_ids ||
          formData.get_target_product_ids.length === 0)
      ) {
        newErrors.get_target_product_ids =
          "At least one get target product must be selected when targeting specific products";
      }
    }

    if (formData.type === "PERCENTAGE_OFF" || formData.type === "FIXED_OFF") {
      if (formData.discount_value <= 0) {
        newErrors.discount_value = "Discount value must be greater than 0";
      }
    }

    if (formData.target_type === "CATEGORY" && !formData.target_category_id) {
      newErrors.target_category_id =
        "Category is required when targeting specific category";
    }

    if (
      formData.target_type === "PRODUCTS" &&
      (!formData.target_product_ids || formData.target_product_ids.length === 0)
    ) {
      newErrors.target_product_ids =
        "At least one product must be selected when targeting specific products";
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
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to submit promotion:", error);
    }
  };

  const handleInputChange = (
    field: keyof SimplePromotionCreateRequest,
    value: string | number | string[] | number[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSearchFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: number) => {
    const currentDays = formData.days_of_week || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    handleInputChange("days_of_week", newDays);
  };

  const handleAddProduct = (field: string, productName: string) => {
    const currentProducts =
      (formData[field as keyof SimplePromotionCreateRequest] as string[]) || [];
    if (!currentProducts.includes(productName)) {
      const newProducts = [...currentProducts, productName];
      handleInputChange(
        field as keyof SimplePromotionCreateRequest,
        newProducts
      );

      // Clear the search field
      if (field === "target_product_ids") {
        setFormData((prev) => ({ ...prev, productSearch: "" }));
      } else if (field === "buy_target_product_ids") {
        setFormData((prev) => ({ ...prev, buyProductSearch: "" }));
      } else if (field === "get_target_product_ids") {
        setFormData((prev) => ({ ...prev, getProductSearch: "" }));
      }
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "HAPPY_HOUR":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    handleInputChange("start_time", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.start_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_time}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    handleInputChange("end_time", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.end_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
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
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
          </div>
        );

      case "BOGO":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.buy_quantity}
                  onChange={(e) =>
                    handleInputChange("buy_quantity", parseInt(e.target.value))
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.buy_quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.buy_quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.buy_quantity}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Free Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.get_quantity}
                  onChange={(e) =>
                    handleInputChange("get_quantity", parseInt(e.target.value))
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.get_quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.get_quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.get_quantity}
                  </p>
                )}
              </div>
            </div>

            {/* BOGO-specific targeting fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Target Type
                </label>
                <select
                  value={formData.buy_target_type || "ALL"}
                  onChange={(e) =>
                    handleInputChange(
                      "buy_target_type",
                      e.target.value as "ALL" | "CATEGORY" | "PRODUCTS"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">All Items</option>
                  <option value="CATEGORY">Specific Category</option>
                  <option value="PRODUCTS">Specific Products</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Target Type
                </label>
                <select
                  value={formData.get_target_type || "ALL"}
                  onChange={(e) =>
                    handleInputChange(
                      "get_target_type",
                      e.target.value as "ALL" | "CATEGORY" | "PRODUCTS"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">All Items</option>
                  <option value="CATEGORY">Specific Category</option>
                  <option value="PRODUCTS">Specific Products</option>
                </select>
              </div>
            </div>

            {/* Buy target category */}
            {formData.buy_target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Target Category
                </label>
                <select
                  value={formData.buy_target_category_id || ""}
                  onChange={(e) =>
                    handleInputChange("buy_target_category_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoadingCategories}
                >
                  {renderCategoryOptions()}
                </select>
              </div>
            )}

            {/* Buy target products */}
            {formData.buy_target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Target Products
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={buyProductSearch || ""}
                      onChange={(e) =>
                        handleSearchFieldChange(
                          "buyProductSearch",
                          e.target.value
                        )
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && buyProductSearch?.trim()) {
                          handleAddProduct(
                            "buy_target_product_ids",
                            buyProductSearch.trim()
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (buyProductSearch?.trim()) {
                          handleAddProduct(
                            "buy_target_product_ids",
                            buyProductSearch.trim()
                          );
                        }
                      }}
                      className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      Add Product
                    </button>
                  </div>
                  {formData.buy_target_product_ids &&
                  formData.buy_target_product_ids.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Selected Buy Products:
                      </p>
                      {formData.buy_target_product_ids.map(
                        (productId, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm">Product {productId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newProducts =
                                  formData.buy_target_product_ids?.filter(
                                    (_, i) => i !== index
                                  ) || [];
                                handleInputChange(
                                  "buy_target_product_ids",
                                  newProducts
                                );
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No buy products selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Get target category */}
            {formData.get_target_type === "CATEGORY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Target Category
                </label>
                <select
                  value={formData.get_target_category_id || ""}
                  onChange={(e) =>
                    handleInputChange("get_target_category_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoadingCategories}
                >
                  {renderCategoryOptions()}
                </select>
              </div>
            )}

            {/* Get target products */}
            {formData.get_target_type === "PRODUCTS" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Target Products
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={getProductSearch || ""}
                      onChange={(e) =>
                        handleSearchFieldChange(
                          "getProductSearch",
                          e.target.value
                        )
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && getProductSearch?.trim()) {
                          handleAddProduct(
                            "get_target_product_ids",
                            getProductSearch.trim()
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (getProductSearch?.trim()) {
                          handleAddProduct(
                            "get_target_product_ids",
                            getProductSearch.trim()
                          );
                        }
                      }}
                      className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      Add Product
                    </button>
                  </div>
                  {formData.get_target_product_ids &&
                  formData.get_target_product_ids.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Selected Get Products:
                      </p>
                      {formData.get_target_product_ids.map(
                        (productId, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm">Product {productId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newProducts =
                                  formData.get_target_product_ids?.filter(
                                    (_, i) => i !== index
                                  ) || [];
                                handleInputChange(
                                  "get_target_product_ids",
                                  newProducts
                                );
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No get products selected
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "PERCENTAGE_OFF":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) =>
                    handleInputChange(
                      "discount_value",
                      parseFloat(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 pr-8 border rounded-md ${
                    errors.discount_value ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              {errors.discount_value && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discount_value}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount Amount (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.max_discount_amount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "max_discount_amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>
        );

      case "FIXED_OFF":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) =>
                  handleInputChange(
                    "discount_value",
                    parseFloat(e.target.value)
                  )
                }
                className={`w-full pl-8 pr-3 py-2 border rounded-md ${
                  errors.discount_value ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.discount_value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discount_value}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Helper function to render category options
  const renderCategoryOptions = (
    placeholder: string = "Select a category..."
  ) => {
    return (
      <>
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Promotion Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Happy Hour 20% Off"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Promotion Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              handleInputChange(
                "type",
                e.target.value as
                  | "HAPPY_HOUR"
                  | "BOGO"
                  | "PERCENTAGE_OFF"
                  | "FIXED_OFF"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="HAPPY_HOUR">Happy Hour</option>
            <option value="BOGO">Buy X Get Y Free</option>
            <option value="PERCENTAGE_OFF">Percentage Off</option>
            <option value="FIXED_OFF">Fixed Amount Off</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Describe the promotion..."
        />
      </div>

      {renderTypeSpecificFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Type *
          </label>
          <select
            value={formData.target_type}
            onChange={(e) =>
              handleInputChange(
                "target_type",
                e.target.value as "ALL" | "CATEGORY" | "PRODUCTS"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ALL">All Items</option>
            <option value="CATEGORY">Specific Category</option>
            <option value="PRODUCTS">Specific Products</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <input
            type="number"
            min="1"
            value={formData.priority}
            onChange={(e) =>
              handleInputChange("priority", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Higher number = higher priority
          </p>
        </div>
      </div>

      {/* Conditional targeting fields */}
      {formData.target_type === "CATEGORY" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Category *
          </label>
          <select
            value={formData.target_category_id || ""}
            onChange={(e) =>
              handleInputChange("target_category_id", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoadingCategories}
          >
            {renderCategoryOptions()}
          </select>
          {errors.target_category_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.target_category_id}
            </p>
          )}
        </div>
      )}

      {formData.target_type === "PRODUCTS" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Products *
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={productSearch || ""}
                onChange={(e) =>
                  handleSearchFieldChange("productSearch", e.target.value)
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter" && productSearch?.trim()) {
                    handleAddProduct(
                      "target_product_ids",
                      productSearch.trim()
                    );
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (productSearch?.trim()) {
                    handleAddProduct(
                      "target_product_ids",
                      productSearch.trim()
                    );
                  }
                }}
                className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Add Product
              </button>
            </div>
            {/* Display selected products */}
            {formData.target_product_ids &&
            formData.target_product_ids.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Selected Products:</p>
                {formData.target_product_ids.map((productId, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">Product {productId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newProducts =
                          formData.target_product_ids?.filter(
                            (_, i) => i !== index
                          ) || [];
                        handleInputChange("target_product_ids", newProducts);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products selected</p>
            )}
          </div>
          {errors.target_product_ids && (
            <p className="text-red-500 text-sm mt-1">
              {errors.target_product_ids}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleInputChange("start_date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => handleInputChange("end_date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : promotion
            ? "Update Promotion"
            : "Create Promotion"}
        </button>
      </div>
    </form>
  );
};
