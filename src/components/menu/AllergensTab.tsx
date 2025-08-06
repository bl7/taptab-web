"use client";

import React from "react";
import { Plus, Edit, Trash2, Search, Shield } from "lucide-react";
import { Allergen } from "@/lib/api";

interface AllergensTabProps {
  allergens: Allergen[];
  apiLoading: boolean;
  onShowAddModal: () => void;
  onShowEditModal: (allergen: Allergen) => void;
  onDeleteAllergen: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterType: "all" | "standard" | "custom";
  onFilterTypeChange: (type: "all" | "standard" | "custom") => void;
}

export default function AllergensTab({
  allergens,
  apiLoading,
  onShowAddModal,
  onShowEditModal,
  onDeleteAllergen,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
}: AllergensTabProps) {
  const filteredAllergens = allergens.filter((allergen) => {
    const matchesSearch = allergen.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Check if allergen is standard based on ID prefix or isStandard property
    const isStandard =
      allergen.isStandard ?? allergen.id.startsWith("alg_std_");

    const matchesFilter =
      filterType === "all" ||
      (filterType === "standard" && isStandard) ||
      (filterType === "custom" && !isStandard);

    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Allergens</h2>
        <button
          onClick={onShowAddModal}
          disabled={apiLoading}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Allergen
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search allergens..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterTypeChange("all")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterTypeChange("standard")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "standard"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onFilterTypeChange("custom")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "custom"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAllergens.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No allergens found</p>
          </div>
        ) : (
          filteredAllergens.map((allergen) => (
            <div
              key={allergen.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-black">{allergen.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {allergen.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                        allergen.severity
                      )}`}
                    >
                      {allergen.severity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {/* Only show edit button for custom allergens */}
                  {!(
                    allergen.isStandard ?? allergen.id.startsWith("alg_std_")
                  ) && (
                    <button
                      onClick={() => onShowEditModal(allergen)}
                      disabled={apiLoading}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {/* Only show delete button for custom allergens */}
                  {!(
                    allergen.isStandard ?? allergen.id.startsWith("alg_std_")
                  ) && (
                    <button
                      onClick={() => onDeleteAllergen(allergen.id)}
                      disabled={apiLoading}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
