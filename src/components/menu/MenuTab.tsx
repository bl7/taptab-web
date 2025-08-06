"use client";

import React from "react";
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { MenuItem, MenuCategory } from "@/lib/api";

interface MenuTabProps {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  apiLoading: boolean;
  onShowAddModal: () => void;
  onShowEditModal: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
}

export default function MenuTab({
  menuItems,
  categories,
  apiLoading,
  onShowAddModal,
  onShowEditModal,
  onDeleteItem,
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  expandedCategories,
  onToggleCategory,
}: MenuTabProps) {
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(
      (item) => item.categoryId === category.id
    );
    if (categoryItems.length > 0) {
      acc[category.id] = {
        category,
        items: categoryItems,
      };
    }
    return acc;
  }, {} as Record<string, { category: MenuCategory; items: MenuItem[] }>);

  const uncategorizedItems = filteredItems.filter(
    (item) =>
      !item.categoryId || !categories.find((c) => c.id === item.categoryId)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Menu Items</h2>
        <button
          onClick={onShowAddModal}
          disabled={apiLoading}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterCategoryChange("all")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === "all"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterCategoryChange(category.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === category.id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Uncategorized Items */}
        {uncategorizedItems.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Uncategorized</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uncategorizedItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => onShowEditModal(item)}
                    onDelete={() => onDeleteItem(item.id)}
                    apiLoading={apiLoading}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categorized Items */}
        {Object.entries(groupedItems).map(
          ([categoryId, { category, items }]) => (
            <div key={categoryId} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => onToggleCategory(categoryId)}
                className="w-full bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100"
              >
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <span className="text-sm text-gray-500">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </button>
              {expandedCategories.has(categoryId) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={() => onShowEditModal(item)}
                        onDelete={() => onDeleteItem(item.id)}
                        apiLoading={apiLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No menu items found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  onEdit,
  onDelete,
  apiLoading,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  apiLoading: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-black">{item.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-gray-500">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            disabled={apiLoading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={apiLoading}
            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
