"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, ChevronDown, X } from "lucide-react";
import { MenuCategory, Ingredient, Allergen, MenuTag } from "@/lib/api";
import { api } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";

// Re-export edit modals
export { EditIngredientModal } from "./EditIngredientModal";
export { EditCategoryModal } from "./EditCategoryModal";
export { EditMenuItemModal } from "./EditMenuItemModal";

// Add Item Modal Component
export function AddItemModal({
  categories,
  availableTags,
  onClose,
  onSubmit,
  loading,
  onCreateIngredient,
}: {
  categories: MenuCategory[];
  availableTags?: MenuTag[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    image?: string;
    ingredients?: Array<{
      ingredientId: string;
      quantity: number;
      unit?: string;
    }>;
    tags?: string[];
  }) => void;
  loading: boolean;
  onCreateIngredient: (data: {
    name: string;
    description: string;
    unit: string;
    costPerUnit: number;
    allergens?: string[];
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    Array<{
      ingredientId: string;
      quantity: number;
      unit?: string;
    }>
  >([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);

  // Load ingredients when modal opens
  useEffect(() => {
    const loadIngredients = async () => {
      setLoadingIngredients(true);
      try {
        const response = await api.getIngredients();
        setIngredients(response.ingredients);
      } catch (error) {
        console.error("Error loading ingredients:", error);
      } finally {
        setLoadingIngredients(false);
      }
    };
    loadIngredients();
  }, []);

  const addIngredient = () => {
    setSelectedIngredients([
      ...selectedIngredients,
      {
        ingredientId: "",
        quantity: 1,
        unit: "pieces", // Default unit, but optional
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...selectedIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedIngredients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      ingredients: selectedIngredients.filter(
        (ing) => ing.ingredientId && ing.quantity > 0
      ),
      tags: selectedTags,
    };

    onSubmit(submitData);
  };

  const handleImageChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setUploadError(null);
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
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
                <option value="">Select Category (Optional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ImageUpload
            value={formData.image}
            onChange={handleImageChange}
            onError={handleImageError}
            disabled={loading}
          />

          {uploadError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {uploadError}
            </div>
          )}

          {/* Ingredients Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Ingredients</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New Ingredient
                </button>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-black hover:text-gray-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </button>
              </div>
            </div>

            {loadingIngredients ? (
              <div className="text-sm text-gray-500">
                Loading ingredients...
              </div>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <select
                      value={ingredient.ingredientId}
                      onChange={(e) =>
                        updateIngredient(index, "ingredientId", e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select ingredient</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (${Number(ing.costPerUnit || 0).toFixed(2)}
                          /{ing.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent"
                      placeholder="Qty"
                    />

                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent"
                      placeholder="Unit"
                    />

                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {selectedIngredients.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No ingredients added. Click &quot;Add Ingredient&quot; to
                    get started.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
            </div>
            <div className="space-y-2">
              {availableTags?.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id]);
                      } else {
                        setSelectedTags(
                          selectedTags.filter((id) => id !== tag.id)
                        );
                      }
                    }}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
              {(!availableTags || availableTags.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-2">
                  No tags available
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
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
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <AddIngredientModal
          onClose={() => setShowAddIngredientModal(false)}
          onSubmit={onCreateIngredient}
          loading={false}
        />
      )}
    </div>
  );
}

// Add Ingredient Modal Component
export function AddIngredientModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    unit: string;
    costPerUnit: number;
    allergens?: string[];
  }) => void;
  loading: boolean;
}) {
  // Helper function to get severity color
  const getSeverityColor = (
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ) => {
    switch (severity) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "pieces",
    costPerUnit: "0.00",
  });
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [loadingAllergens, setLoadingAllergens] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load allergens when modal opens
  useEffect(() => {
    const loadAllergens = async () => {
      setLoadingAllergens(true);
      try {
        const response = await api.getAllergens();
        console.log("sup allergen list - Modal API response:", response);
        console.log(
          "sup allergen list - Modal allergens array:",
          response?.allergens
        );
        setAllergens(response?.allergens || []);
      } catch (error) {
        console.error(
          "sup allergen list - Modal error loading allergens:",
          error
        );
        setAllergens([]); // Set empty array on error
      } finally {
        setLoadingAllergens(false);
      }
    };
    loadAllergens();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ingredient data before submission
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push("Name is required");
    }

    if (!formData.unit?.trim()) {
      errors.push("Unit is required");
    }

    const costPerUnit = parseFloat(formData.costPerUnit);
    if (isNaN(costPerUnit)) {
      errors.push("Cost per unit must be a valid number");
    } else if (costPerUnit < 0) {
      errors.push("Cost per unit cannot be negative");
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n" + errors.join("\n"));
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      unit: formData.unit.trim(),
      costPerUnit: costPerUnit,
      allergens: selectedAllergens,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Ingredient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                Unit
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost per Unit
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, costPerUnit: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>
            </div>
          </div>

          {/* Allergens Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Allergens</h3>
              <span className="text-xs text-gray-500">
                Select allergens that this ingredient contains
              </span>
            </div>

            <div className="relative">
              {/* Selected allergens display */}
              {selectedAllergens.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedAllergens.map((allergenId) => {
                    const allergen = allergens.find((a) => a.id === allergenId);
                    return allergen ? (
                      <span
                        key={allergenId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                      >
                        {allergen.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAllergens(
                              selectedAllergens.filter(
                                (id) => id !== allergenId
                              )
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loadingAllergens}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-left bg-white flex items-center justify-between disabled:opacity-50"
              >
                <span className="text-gray-700">
                  {loadingAllergens
                    ? "Loading allergens..."
                    : selectedAllergens.length === 0
                    ? "Select allergens..."
                    : `${selectedAllergens.length} allergen${
                        selectedAllergens.length === 1 ? "" : "s"
                      } selected`}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && !loadingAllergens && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {allergens.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No allergens available. Create allergens first.
                    </div>
                  ) : (
                    allergens.map((allergen) => (
                      <div
                        key={allergen.id}
                        onClick={() => {
                          if (selectedAllergens.includes(allergen.id)) {
                            setSelectedAllergens(
                              selectedAllergens.filter(
                                (id) => id !== allergen.id
                              )
                            );
                          } else {
                            setSelectedAllergens([
                              ...selectedAllergens,
                              allergen.id,
                            ]);
                          }
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedAllergens.includes(allergen.id)}
                              onChange={() => {}} // Handled by parent div onClick
                              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded pointer-events-none"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {allergen.name}
                              </span>
                              {allergen.description && (
                                <p className="text-xs text-gray-600">
                                  {allergen.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded border ${getSeverityColor(
                              allergen.severity
                            )}`}
                          >
                            {allergen.severity}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close dropdown */}
            {dropdownOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setDropdownOpen(false)}
              />
            )}
          </div>

          <div className="flex space-x-3 pt-4">
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
              {loading ? "Adding..." : "Add Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Allergen Modal Component
export function AddAllergenModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    severity: "LOW" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      severity: formData.severity,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Allergen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Level
            </label>
            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  severity: e.target.value as
                    | "LOW"
                    | "MEDIUM"
                    | "HIGH"
                    | "CRITICAL",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
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
              {loading ? "Adding..." : "Add Allergen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Allergen Modal Component
export function EditAllergenModal({
  allergen,
  onClose,
  onSubmit,
  loading,
}: {
  allergen: {
    id: string;
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: allergen.name,
    description: allergen.description,
    severity: allergen.severity,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      severity: formData.severity,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Allergen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Level
            </label>
            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  severity: e.target.value as
                    | "LOW"
                    | "MEDIUM"
                    | "HIGH"
                    | "CRITICAL",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="flex space-x-3">
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
              {loading ? "Updating..." : "Update Allergen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
