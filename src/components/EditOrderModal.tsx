"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, Search, Filter } from "lucide-react";
import {
  Order,
  MenuItem,
  MenuCategory,
  OrderModificationChange,
} from "@/lib/api";
import { api } from "@/lib/api";

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onModifyOrder: (
    orderId: string,
    changes: OrderModificationChange[]
  ) => Promise<void>;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export default function EditOrderModal({
  order,
  onClose,
  onModifyOrder,
}: EditOrderModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modifying, setModifying] = useState(false);

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

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const [menuResponse, categoriesResponse] = await Promise.all([
          api.getMenuItems(),
          api.getMenuCategories(),
        ]);
        setMenuItems(menuResponse.items);
        setCategories(categoriesResponse.categories);
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Initialize cart with existing order items
  useEffect(() => {
    if (order && menuItems.length > 0) {
      const existingItems: CartItem[] = order.items.map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
        if (menuItem) {
          return {
            menuItem,
            quantity: item.quantity,
            notes: item.notes || "",
          };
        } else {
          // Create a fallback menuItem that matches the interface
          const fallbackMenuItem: MenuItem = {
            id: item.menuItemId,
            name: item.menuItemName,
            description: "",
            price: item.price,
            category: "",
            categoryId: "",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            menuItem: fallbackMenuItem,
            quantity: item.quantity,
            notes: item.notes || "",
          };
        }
      });
      setCart(existingItems);
    }
  }, [order, menuItems]);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: "" }]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(
        cart.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(
      cart.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  };

  const handleSaveChanges = async () => {
    setModifying(true);
    try {
      const changes: OrderModificationChange[] = [];

      // Remove items that are no longer in cart
      const currentItemIds = cart.map((item) => item.menuItem.id);
      const removedItems = order.items.filter(
        (item) => !currentItemIds.includes(item.menuItemId)
      );

      for (const item of removedItems) {
        changes.push({
          action: "remove_item",
          itemId: item.menuItemId,
          quantity: 0,
          notes: "",
        });
      }

      // Update quantities and notes for existing items
      for (const cartItem of cart) {
        const existingItem = order.items.find(
          (item) => item.menuItemId === cartItem.menuItem.id
        );
        if (existingItem) {
          if (
            existingItem.quantity !== cartItem.quantity ||
            existingItem.notes !== cartItem.notes
          ) {
            changes.push({
              action: "change_quantity",
              itemId: cartItem.menuItem.id,
              quantity: cartItem.quantity,
              notes: cartItem.notes,
            });
          }
        } else {
          // Add new items
          changes.push({
            action: "add_item",
            itemId: cartItem.menuItem.id,
            quantity: cartItem.quantity,
            notes: cartItem.notes,
          });
        }
      }

      await onModifyOrder(order.id, changes);
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setModifying(false);
    }
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  const searchFilteredItems = filteredItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-black">Edit Order</h2>
            <p className="text-sm text-gray-600">
              Order: {order.orderNumber || order.id.slice(-8)} | Table:{" "}
              {order.tableNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Side - Menu Items */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === "all"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchFilteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 min-h-[280px] flex flex-col group"
                  >
                    {/* Image Container - Full Size */}
                    <div className="w-full h-40 rounded-lg mb-4 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={400}
                          height={160}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-200">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Item Details - Clean */}
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
                        {item.name}
                      </div>

                      {/* Allergens */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen) => (
                              <span
                                key={allergen.id}
                                className={`text-xs px-2 py-1 rounded border ${getSeverityColor(
                                  allergen.severity
                                )}`}
                                title={`${allergen.description}${
                                  allergen.sources?.length
                                    ? ` - Sources: ${allergen.sources
                                        .map((s) => s.ingredientName)
                                        .join(", ")}`
                                    : ""
                                }`}
                              >
                                {allergen.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price - Clean */}
                      <div className="text-2xl font-bold text-gray-900 mb-4">
                        ${item.price.toFixed(2)}
                      </div>

                      {/* Quick Add Button - Modern */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        ADD TO ORDER
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="w-96 bg-gray-50 flex flex-col">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Order Items</h2>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No items in order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="bg-white rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          {item.menuItem.image ? (
                            <Image
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-green-600 font-semibold text-sm">
                              ${item.menuItem.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity - 1
                                )
                              }
                              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity.toString().padStart(2, "0")}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity + 1
                                )
                              }
                              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Notes Input */}
                        <div className="mt-2">
                          <textarea
                            placeholder="Add special instructions..."
                            value={item.notes}
                            onChange={(e) =>
                              updateNotes(item.menuItem.id, e.target.value)
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {cart.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="font-bold text-green-600">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={modifying}
                      className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {modifying ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
