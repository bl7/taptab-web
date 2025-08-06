"use client";

import { useState } from "react";
import { Plus, Trash2, DollarSign, ChevronDown, X } from "lucide-react";
import { MenuItem, MenuCategory, Ingredient, MenuTag } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";

// Edit Menu Item Modal Component
export function EditMenuItemModal({
  menuItem,
  categories,
  availableIngredients,
  availableMenuTags,
  onClose,
  onSubmit,
  loading,
}: {
  menuItem: MenuItem;
  categories: MenuCategory[];
  availableIngredients: Ingredient[];
  availableMenuTags: MenuTag[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image?: string;
    isActive: boolean;
    ingredients: Array<{
      ingredientId: string;
      quantity: number;
      unit?: string;
    }>;
    tags: string[];
  }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price.toString(),
    categoryId: menuItem.categoryId,
    image: menuItem.image || "",
    isActive: menuItem.isActive,
  });

  // Initialize ingredients from existing menu item
  const [ingredients, setIngredients] = useState<
    Array<{
      ingredientId: string;
      quantity: number;
      unit?: string;
    }>
  >(
    menuItem.ingredients?.map((ing) => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity,
      unit: ing.unit,
    })) || []
  );

  // Initialize tags from existing menu item
  const [selectedTags, setSelectedTags] = useState<string[]>(
    menuItem.tags?.map((tag) => tag.id) || []
  );

  // Dropdown states
  const [ingredientDropdownOpen, setIngredientDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      image: formData.image || undefined,
      isActive: formData.isActive,
      ingredients,
      tags: selectedTags,
    });
  };

  const addIngredient = (ingredientId: string) => {
    if (!ingredients.find((ing) => ing.ingredientId === ingredientId)) {
      setIngredients([
        ...ingredients,
        { ingredientId, quantity: 1, unit: "piece" }, // Default unit, but optional
      ]);
    }
    setIngredientDropdownOpen(false);
  };

  const removeIngredient = (ingredientId: string) => {
    setIngredients(
      ingredients.filter((ing) => ing.ingredientId !== ingredientId)
    );
  };

  const updateIngredient = (
    ingredientId: string,
    field: "quantity" | "unit",
    value: string | number
  ) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.ingredientId === ingredientId
          ? { ...ing, [field]: field === "quantity" ? Number(value) : value }
          : ing
      )
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getIngredientName = (ingredientId: string) => {
    return (
      availableIngredients.find((ing) => ing.id === ingredientId)?.name ||
      "Unknown Ingredient"
    );
  };

  const getTagName = (tagId: string) => {
    return (
      availableMenuTags.find((tag) => tag.id === tagId)?.name || "Unknown Tag"
    );
  };

  const getTagColor = (tagId: string) => {
    return (
      availableMenuTags.find((tag) => tag.id === tagId)?.color || "#6B7280"
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Active menu item
                </label>
              </div>
            </div>

            {/* Right Column - Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIngredientDropdownOpen(!ingredientDropdownOpen)
                  }
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Ingredient</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      ingredientDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {ingredientDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {availableIngredients.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => addIngredient(ingredient.id)}
                        disabled={ingredients.some(
                          (ing) => ing.ingredientId === ingredient.id
                        )}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {ingredient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ingredient.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ingredients */}
            <div className="space-y-3">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.ingredientId}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {getIngredientName(ingredient.ingredientId)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(
                          ingredient.ingredientId,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(
                          ingredient.ingredientId,
                          "unit",
                          e.target.value
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.ingredientId)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {ingredients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No ingredients added. Click &quot;Add Ingredient&quot; to get
                  started.
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Dietary Tags
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Tag</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      tagDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {tagDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {availableMenuTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.id)}
                              onChange={() => {}} // Handled by parent onClick
                              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded pointer-events-none"
                            />
                            <span className="font-medium text-gray-900">
                              {tag.name}
                            </span>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        </div>
                        {tag.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {tag.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getTagColor(tagId) }}
                >
                  {getTagName(tagId)}
                  <button
                    type="button"
                    onClick={() => toggleTag(tagId)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedTags.length === 0 && (
                <div className="text-gray-500 text-sm">No tags selected</div>
              )}
            </div>
          </div>

          {/* Click outside to close dropdowns */}
          {(ingredientDropdownOpen || tagDropdownOpen) && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => {
                setIngredientDropdownOpen(false);
                setTagDropdownOpen(false);
              }}
            />
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Menu Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
