"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Clock,
  User,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { showToast } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  allergens?: Array<{
    id: string;
    name: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
  location?: string;
  currentOrderId?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export default function OrderTakingPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userName, setUserName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [menuResponse, categoriesResponse, tablesResponse] =
          await Promise.all([
            api.getMenuItems(),
            api.getMenuCategories(),
            api.getTables(),
          ]);

        setMenuItems(menuResponse.items || []);
        setCategories(categoriesResponse.categories || []);
        setTables(tablesResponse.tables || []);

        // Get user and restaurant info
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setUserName(`${user.firstName} ${user.lastName}`);
            setRestaurantName(user.tenant?.name || "Restaurant");
          } catch (e) {
            console.error("Error parsing user data:", e);
            setUserName("Staff");
            setRestaurantName("Restaurant");
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredItems =
    selectedCategory === "all"
      ? menuItems.filter((item) => {
          const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesSearch && item.isActive;
        })
      : menuItems.filter((item) => {
          const matchesCategory = item.categoryId === selectedCategory;
          const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
          console.log(
            `Item: ${item.name}, CategoryId: ${item.categoryId}, Selected: ${selectedCategory}, Matches: ${matchesCategory}`
          );
          return matchesCategory && matchesSearch && item.isActive;
        });

  const addToCart = (item: MenuItem) => {
    if (!selectedTable) {
      showToast.warning("Please select a table first");
      return;
    }

    setCart((prev: CartItem[]) => {
      const existingItem = prev.find(
        (cartItem) => cartItem.menuItem.id === item.id
      );
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { menuItem: item, quantity: 1, notes: "" }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev: CartItem[]) =>
      prev.map((item) =>
        item.menuItem.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev: CartItem[]) =>
      prev.filter((item) => item.menuItem.id !== itemId)
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart((prev: CartItem[]) =>
      prev.map((item) =>
        item.menuItem.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const submitOrder = async () => {
    if (!selectedTable) {
      showToast.warning("Please select a table first");
      return;
    }

    if (cart.length === 0) {
      showToast.warning("Please add items to cart");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        tableId: selectedTable.id,
        customerName: "Walk-in Customer",
        customerPhone: "",
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        specialInstructions: "",
        orderSource: "WAITER",
        waiterName: userName,
      };

      await api.createOrder(orderData);
      showToast.success("Order placed successfully!");

      // Clear cart and reset
      setCart([]);
      setSelectedTable(null);
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      showToast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black text-lg">Loading POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col">
        {/* Header Zone - Modern */}
        <div className="h-24 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
          {/* Restaurant Name */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-900">
              {restaurantName}
            </div>
          </div>

          {/* Table Selection - Modern */}
          <button
            onClick={() => setShowTableSelector(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-3 shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            {selectedTable
              ? `TABLE ${selectedTable.number} ▼`
              : "SELECT TABLE ▼"}
          </button>

          {/* Staff Info - Modern */}
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">{userName}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar - Modern */}
        {showSearch && (
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {/* Categories - Modern */}
        <div className="flex px-6 py-4 gap-3 border-b border-gray-200 overflow-x-auto bg-white">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-colors ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ALL ITEMS
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Menu Grid - 3 Cards per Row, Modern */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
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

                  {/* Price - Clean */}
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs font-medium text-orange-700">
                          Allergens:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen) => (
                          <span
                            key={allergen.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              allergen.severity === "CRITICAL"
                                ? "bg-red-100 text-red-800"
                                : allergen.severity === "HIGH"
                                ? "bg-orange-100 text-orange-800"
                                : allergen.severity === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {allergen.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Add Button - Modern */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-auto"
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

      {/* Right Panel - Modern Order Summary */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        {/* Order Header - Modern, same height as main header */}
        <div className="h-24 px-6 py-6 bg-gray-900 text-white flex flex-col justify-center">
          <div className="text-xl font-bold mb-1">ORDER SUMMARY</div>
          <div className="text-sm text-gray-300">
            {selectedTable
              ? `Table ${selectedTable.number}`
              : "No table selected"}{" "}
            •{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Order Items - Modern */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg font-medium">No items in order yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Click menu items to add them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold text-base">
                        {item.menuItem.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls and Price - Modern */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                        className="w-10 h-10 border border-gray-300 bg-white rounded-lg flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="min-w-10 text-center font-semibold text-lg text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                        className="w-10 h-10 border border-gray-300 bg-white rounded-lg flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">
                      ${item.menuItem.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Notes - Modern */}
                  <div className="mb-3">
                    <textarea
                      placeholder="Add notes..."
                      value={item.notes}
                      onChange={(e) =>
                        updateNotes(item.menuItem.id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm resize-none transition-colors"
                      rows={2}
                    />
                  </div>

                  {/* Item Total - Modern */}
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Total - Modern */}
        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">TOTAL</span>
            <span className="text-2xl font-bold text-gray-900">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>

          {/* Submit Button - Modern */}
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || !selectedTable || submitting}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
        </div>
      </div>

      {/* Table Selection Modal - Modern */}
      {showTableSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] max-h-[500px] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">SELECT TABLE</h2>
              <button
                onClick={() => setShowTableSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    setShowTableSelector(false);
                  }}
                  className={`p-4 rounded-lg border transition-colors text-center ${
                    selectedTable?.id === table.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  <div className="font-semibold text-lg mb-1">
                    TABLE {table.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {table.capacity} seats
                  </div>
                  {table.location && (
                    <div className="text-xs text-gray-500">
                      {table.location}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
