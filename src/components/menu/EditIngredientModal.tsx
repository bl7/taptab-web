"use client";

import { useState } from "react";
import { DollarSign, ChevronDown, X } from "lucide-react";
import { Ingredient, Allergen } from "@/lib/api";

// Edit Ingredient Modal Component
export function EditIngredientModal({
  ingredient,
  onClose,
  onSubmit,
  loading,
  availableAllergens,
}: {
  ingredient: Ingredient;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    unit: string;
    costPerUnit: number;
    isActive: boolean;
    allergens?: string[];
  }) => void;
  loading: boolean;
  availableAllergens: Allergen[];
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
    name: ingredient.name,
    description: ingredient.description,
    unit: ingredient.unit,
    costPerUnit: ingredient.costPerUnit?.toString() || "0.00",
    isActive: ingredient.isActive,
  });

  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      unit: formData.unit,
      costPerUnit: parseFloat(formData.costPerUnit),
      isActive: formData.isActive,
      allergens: selectedAllergens,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Ingredient</h2>
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

          {/* Active Status */}
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
              Active ingredient
            </label>
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
                    const allergen = availableAllergens.find(
                      (a) => a.id === allergenId
                    );
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-left bg-white flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {selectedAllergens.length === 0
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
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableAllergens.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No allergens available.
                    </div>
                  ) : (
                    availableAllergens.map((allergen) => (
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
              {loading ? "Updating..." : "Update Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
