"use client";

import React from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { MenuCategory } from "@/lib/api";

interface CategoriesTabProps {
  categories: MenuCategory[];
  apiLoading: boolean;
  onShowAddModal: () => void;
  onShowEditModal: (category: MenuCategory) => void;
  onDeleteCategory: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function CategoriesTab({
  categories,
  apiLoading,
  onShowAddModal,
  onShowEditModal,
  onDeleteCategory,
  searchTerm,
  onSearchChange,
}: CategoriesTabProps) {
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Categories</h2>
        <button
          onClick={onShowAddModal}
          disabled={apiLoading}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="h-8 w-8 text-gray-400 mx-auto mb-2">📂</div>
            <p className="text-gray-500 text-sm">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-black">{category.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Sort: {category.sortOrder}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onShowEditModal(category)}
                    disabled={apiLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
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
