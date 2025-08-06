"use client";

import React from "react";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { Ingredient } from "@/lib/api";

interface IngredientsTabProps {
  ingredients: Ingredient[];
  apiLoading: boolean;
  onShowAddModal: () => void;
  onShowEditModal: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function IngredientsTab({
  ingredients,
  apiLoading,
  onShowAddModal,
  onShowEditModal,
  onDeleteIngredient,
  searchTerm,
  onSearchChange,
}: IngredientsTabProps) {
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Ingredients</h2>
        <button
          onClick={onShowAddModal}
          disabled={apiLoading}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No ingredients found</p>
          </div>
        ) : (
          filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-black">{ingredient.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {ingredient.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ingredient.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ingredient.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ingredient.unit} • $
                      {Number(ingredient.costPerUnit || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onShowEditModal(ingredient)}
                    disabled={apiLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteIngredient(ingredient.id)}
                    disabled={apiLoading}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
