"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  image?: string;
  isActive: boolean;
  ingredients?: Array<{
    id: string;
    ingredientId: string;
    quantity: number;
    unit: string;
    ingredient?: {
      id: string;
      name: string;
      description: string;
      unit: string;
      costPerUnit: number;
    };
  }>;
  allergens?: Array<{
    id: string;
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    isStandard: boolean;
    sources?: Array<{
      ingredientId: string;
      ingredientName: string;
    }>;
  }>;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface OrderStatus {
  orderId: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  total: number;
  items: CartItem[];
}

export default function QROrderPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const tableNumber = (params.tableNumber as string).replace(/\s+/g, "-"); // Remove spaces, replace with hyphens

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);

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
  const loadMenuData = useCallback(async () => {
    console.log("🔄 Loading menu data for:", tenantSlug);
    setLoading(true);
    setError("");

    try {
      // Fetch menu items and categories using public API
      const [menuResponse, categoriesResponse, tablesResponse] =
        await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/menu/items?tenant=${tenantSlug}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/menu/categories?tenant=${tenantSlug}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/tables?tenant=${tenantSlug}`
          ),
        ]);

      if (!menuResponse.ok) {
        throw new Error(`Failed to load menu items: ${menuResponse.status}`);
      }
      if (!categoriesResponse.ok) {
        throw new Error(
          `Failed to load categories: ${categoriesResponse.status}`
        );
      }

      const menuData = await menuResponse.json();
      const categoriesData = await categoriesResponse.json();
      const tablesData = await tablesResponse.json();

      console.log("✅ Menu data loaded:", menuData);
      console.log("✅ Categories loaded:", categoriesData);
      console.log("✅ Tables loaded:", tablesData);

      setMenuItems(menuData.data?.items || []);
      setCategories(categoriesData.data?.categories || []);

      // Extract table numbers for reference
      const tableNumbers = (tablesData.data?.tables || []).map(
        (table: { number: string }) => table.number
      );
      setAvailableTables(tableNumbers);

      console.log("📋 Available tables:", tableNumbers);
    } catch (error) {
      console.error("❌ Error loading menu:", error);
      setError(error instanceof Error ? error.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Cart management functions
  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.menuItem.id === menuItem.id
      );
      if (existingItem) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { menuItem, quantity: 1, notes: "" }];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0) return;

    setOrderLoading(true);
    setError("");

    try {
      const orderData = {
        tableNumber: tableNumber, // Keep as string, don't parseInt
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        customerName: "Walk-in Customer",
        customerPhone: "",
      };

      console.log("📦 Submitting order:", orderData);
      console.log(
        "🌐 API URL:",
        `${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`
      );
      console.log(
        "📦 Order data being sent:",
        JSON.stringify(orderData, null, 2)
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      console.log("📡 Response status:", response.status);
      console.log("📡 Response status text:", response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);

        // Try to parse the error response as JSON
        let errorMessage = `Order submission failed: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use the raw error text
          errorMessage =
            errorText || `Order submission failed: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const orderResult = await response.json();
      console.log("✅ Order submitted:", orderResult);

      setOrderStatus({
        orderId: orderResult.data?.orderId || "unknown",
        status: "pending",
        total: getCartTotal(),
        items: [...cart],
      });

      setCart([]);
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit order"
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-black">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Error Loading Menu
          </h1>
          <p className="text-black mb-6">{error}</p>

          {error.includes("Table not found") && availableTables.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-black mb-2">
                Available tables for this restaurant:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableTables.map((tableNum) => (
                  <a
                    key={tableNum}
                    href={`/order/${tenantSlug}/${tableNum}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                  >
                    {tableNum}
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={loadMenuData}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Order confirmation state
  if (orderStatus) {
    return (
      <div className="min-h-screen text-black bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">
              Order Placed!
            </h1>
            <p className="text-black">
              Your order has been successfully submitted.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Order ID:</span>
              <span className="font-mono text-sm text-black">
                {orderStatus.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Table:</span>
              <span className="font-medium text-black">{tableNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Total:</span>
              <span className="font-bold text-black">
                ${orderStatus.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black">Status:</span>
              <span className="flex items-center text-sm text-black">
                <Clock className="h-4 w-4 mr-1 text-black" />
                {orderStatus.status}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-black">Order Items:</h3>
            {orderStatus.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-black">
                  {item.menuItem.name} x{item.quantity}
                </span>
                <span className="text-black">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">
                  {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
                </h1>
                <p className="text-sm text-gray-600">Table {tableNumber}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {/* Desktop Menu Items Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

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

        {/* Desktop Right Sidebar - Order Management */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">My Order</h2>
              <button
                onClick={() => setCart([])}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-black text-sm">Your cart is empty</p>
                  <p className="text-black text-xs">Add items to get started</p>
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
                            <span className="text-black text-xs">No</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-black text-sm truncate">
                            {item.menuItem.name}
                          </h4>
                          <p className="text-black text-xs">Small Size</p>
                          <p className="text-black font-semibold text-sm">
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
                            <Minus className="w-3 h-3 text-black" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center text-black">
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
                            <Plus className="w-3 h-3 text-black" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="p-1 text-black hover:text-red-500"
                          >
                            {/* Removed Trash2 icon */}
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
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent resize-none text-black"
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
                    <span className="text-black">Items:</span>
                    <span className="font-semibold text-black">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-bold text-black">Total Amount:</span>
                    <span className="font-bold text-black">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={submitOrder}
                  disabled={orderLoading}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile App Header */}
        <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-black">
                {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
              </h1>
              <p className="text-sm text-gray-600">Table {tableNumber}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          {/* Mobile Category Filters - Horizontal Scroll */}
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
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

        {/* Mobile Menu Items - Single Column */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 active:scale-95"
              >
                <div className="flex items-start space-x-4">
                  {/* Mobile Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Mobile Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {item.name}
                      </h3>
                      <span className="text-green-600 font-bold text-lg ml-2">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    {/* Mobile Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-full bg-black text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      ADD TO ORDER
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Cart Bar */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 py-4 sticky bottom-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                </p>
                <p className="text-lg font-bold text-black">
                  ${getCartTotal().toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowMobileCart(true)}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>
        )}

        {/* Mobile Cart Modal */}
        {showMobileCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full h-[85vh] rounded-t-3xl p-6 overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">My Order</h2>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-black text-sm">Your cart is empty</p>
                    <p className="text-black text-xs">
                      Add items to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <div className="flex items-center space-x-3 mb-3">
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
                              <span className="text-black text-xs">No</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-black text-sm truncate">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-black font-semibold text-sm">
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
                              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus className="w-3 h-3 text-black" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="w-3 h-3 text-black" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Notes Input */}
                        <div>
                          <textarea
                            placeholder="Add special instructions..."
                            value={item.notes}
                            onChange={(e) =>
                              updateNotes(item.menuItem.id, e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-black"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary and Place Order Button */}
              {cart.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black text-sm">Items:</span>
                      <span className="font-semibold text-black">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-bold text-black">
                        Total Amount:
                      </span>
                      <span className="font-bold text-black">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={submitOrder}
                    disabled={orderLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {orderLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
