"use client";

import { useState, useEffect, useCallback } from "react";
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
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageLoader } from "@/lib/utils";
import { showToast } from "@/lib/utils";
import {
  PromotionsDisplay,
  usePromotionsCalculation,
} from "@/components/promotion";
import { OrderItemForPromotion } from "@/interfaces/promotion";
import { useMenuAvailabilityStore } from "@/lib/menu-availability-store";
import { useBulkAvailability } from "@/lib/use-availability-guard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  image?: string;
  isActive: boolean;
  available: boolean; // Added availability field
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
  }>;
  allergens?: Array<{
    id: string;
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    sources?: Array<{
      ingredientId: string;
      ingredientName: string;
    }>;
  }>;
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
  // Helper function to get severity color
  const getSeverityColor = (
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ) => {
    switch (severity) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-green-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-green-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-green-200";
    }
  };

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
  const [tenantId, setTenantId] = useState<string>("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMenuItemDetails, setSelectedMenuItemDetails] =
    useState<MenuItem | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(true); // Show unavailable items by default

  // Promotions calculation hook
  const {
    appliedPromotions,
    subtotal: promotionsSubtotal,
    totalDiscount,
    finalAmount,
    loading: promotionsLoading,
    calculatePromotions,
    clearCalculation,
  } = usePromotionsCalculation(tenantId);

  // Get availability for all items
  const { availableItems, unavailableItems, hasUnavailable } =
    useBulkAvailability(menuItems.map((item) => item.id));

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

        // Debug: Log the actual structure of menu items from backend
        if (menuResponse.items && menuResponse.items.length > 0) {
          console.log("Sample menu item from backend:", menuResponse.items[0]);
          console.log("All menu items:", menuResponse.items);
        }

        // Initialize availability store with menu items
        if (menuResponse.items) {
          const availabilityData = menuResponse.items.map((item: MenuItem) => ({
            id: item.id,
            available: item.available, // Use the actual available field from backend
            lastUpdated: new Date(),
          }));

          // Use the availability store to set bulk availability
          useMenuAvailabilityStore
            .getState()
            .setBulkAvailability(availabilityData);

          console.log(
            `Initialized availability for ${availabilityData.length} menu items`
          );
        }

        // Get user and restaurant info
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setUserName(`${user.firstName} ${user.lastName}`);
            setRestaurantName(user.tenant?.name || "Restaurant");
            setTenantId(user.tenant?.id || "");
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
          const matchesAvailability =
            showUnavailable ||
            useMenuAvailabilityStore.getState().isItemAvailable(item.id);
          return matchesSearch && item.isActive && matchesAvailability;
        })
      : menuItems.filter((item) => {
          const matchesCategory = item.categoryId === selectedCategory;
          const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesAvailability =
            showUnavailable ||
            useMenuAvailabilityStore.getState().isItemAvailable(item.id);
          console.log(
            `Item: ${item.name}, CategoryId: ${item.categoryId}, Selected: ${selectedCategory}, Matches: ${matchesCategory}`
          );
          return (
            matchesCategory &&
            matchesSearch &&
            item.isActive &&
            matchesAvailability
          );
        });

  const addToCart = (item: MenuItem) => {
    if (!selectedTable) {
      showToast.warning("Please select a table first");
      return;
    }

    // Check if item is available before adding to cart
    const isAvailable = useMenuAvailabilityStore
      .getState()
      .isItemAvailable(item.id);
    if (!isAvailable) {
      showToast.error("This item is currently out of stock");
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

  // Convert cart items to promotion format
  const getCartItemsForPromotions = useCallback((): OrderItemForPromotion[] => {
    return cart.map((item) => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      unitPrice: item.menuItem.price,
      quantity: item.quantity,
      categoryId: item.menuItem.categoryId,
    }));
  }, [cart]);

  // Update promotions when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      calculatePromotions(getCartItemsForPromotions());
    } else {
      clearCalculation();
    }
  }, [cart, calculatePromotions, clearCalculation, getCartItemsForPromotions]);

  // Handle opening menu item details modal
  const handleShowDetails = (item: MenuItem) => {
    setSelectedMenuItemDetails(item);
    setShowDetailsModal(true);
  };

  // Handle closing details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedMenuItemDetails(null);
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
      <PageLoader message="Loading POS System..." background="transparent" />
    );
  }

  return (
    <div>
      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex h-screen bg-gray-50">
        {/* Left Panel - Menu */}
        <div className="flex-1 flex flex-col">
          {/* Header Zone - Responsive */}
          <div className="min-h-[60px] md:h-24 bg-white border-b border-gray-200 px-3 md:px-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-3 md:gap-0 py-3 md:py-0">
            {/* Restaurant Name */}
            <div className="flex items-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {restaurantName}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              {/* Table Selection - Responsive */}
              <button
                onClick={() => setShowTableSelector(true)}
                className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 md:gap-3 shadow-sm w-full sm:w-auto justify-center"
              >
                <MapPin className="w-4 h-4" />
                {selectedTable
                  ? `TABLE ${selectedTable.number} ▼`
                  : "SELECT TABLE ▼"}
              </button>

              {/* Staff Info - Responsive */}
              <div className="flex items-center gap-2 md:gap-4 text-gray-700 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-gray-100 px-2 md:px-3 py-2 rounded-lg flex-1 sm:flex-initial">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">{userName}</span>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar - Responsive */}
          {showSearch && (
            <div className="px-3 md:px-6 py-4 bg-white border-b border-gray-200">
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

          {/* Categories - Responsive */}
          <div className="flex px-3 md:px-6 py-4 gap-2 md:gap-3 border-b border-gray-200 overflow-x-auto bg-white scrollbar-hide">
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

          {/* Availability Toggle */}
          <div className="px-3 md:px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnavailable}
                  onChange={(e) => setShowUnavailable(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Show out of stock items
                </span>
              </label>
            </div>

            {/* Availability Summary */}
            {hasUnavailable && (
              <div className="text-sm text-gray-600 mt-2">
                <span className="text-green-600 font-medium">
                  {availableItems.length} items available
                </span>
                {unavailableItems.length > 0 && (
                  <span className="text-red-600 ml-2">
                    • {unavailableItems.length} items out of stock
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Menu Grid - Responsive */}
          <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredItems.map((item) => {
                const isAvailable = useMenuAvailabilityStore
                  .getState()
                  .isItemAvailable(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => isAvailable && addToCart(item)}
                    className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 transition-all duration-200 min-h-[250px] md:min-h-[280px] flex flex-col group ${
                      isAvailable
                        ? "cursor-pointer hover:shadow-md hover:border-gray-300"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {/* Image Container - Responsive */}
                    <div className="w-full h-32 md:h-40 rounded-lg mb-4 overflow-hidden relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={400}
                          height={160}
                          className={`w-full h-full object-cover transition-transform duration-200 ${
                            isAvailable ? "group-hover:scale-105" : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gray-100 flex items-center justify-center text-6xl transition-transform duration-200 ${
                            isAvailable ? "group-hover:scale-105" : ""
                          }`}
                        >
                          🍽️
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details - Clean */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors">
                          {item.name}
                        </div>

                        {/* Availability Badge */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isAvailable ? "✅ Available" : "❌ Out of Stock"}
                        </span>
                      </div>

                      {/* Promotion Badges */}
                      {appliedPromotions.some((promo) =>
                        promo.applied_items.includes(item.name)
                      ) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {appliedPromotions
                            .filter((promo) =>
                              promo.applied_items.includes(item.name)
                            )
                            .map((promo) => (
                              <div
                                key={promo.id}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200"
                              >
                                {promo.name}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Details Link - Moved below name */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetails(item);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline mb-3 transition-colors"
                      >
                        View Details
                      </button>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>

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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Modern Order Summary */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg h-screen">
          {/* Order Header - Compact */}
          <div className="px-4 py-3 bg-gray-900 text-white border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">ORDER</div>
              <div className="text-xs text-gray-300">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="text-sm text-gray-300 mt-1">
              {selectedTable
                ? `Table ${selectedTable.number}`
                : "No table selected"}
            </div>
          </div>

          {/* Order Items - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-sm font-medium">No items in order yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click menu items to add them.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-semibold text-sm">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quantity Controls - Compact */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity - 1)
                          }
                          className="w-8 h-8 border border-gray-300 bg-white rounded-md flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-8 text-center font-semibold text-sm text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity + 1)
                          }
                          className="w-8 h-8 border border-gray-300 bg-white rounded-md flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Notes - Compact */}
                    <textarea
                      placeholder="Add notes..."
                      value={item.notes}
                      onChange={(e) =>
                        updateNotes(item.menuItem.id, e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-xs resize-none transition-colors"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promotions Display */}
          {cart.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <PromotionsDisplay
                promotions={appliedPromotions}
                subtotal={promotionsSubtotal}
                totalDiscount={totalDiscount}
                finalAmount={finalAmount}
                loading={promotionsLoading}
              />
            </div>
          )}

          {/* Order Total - Compact */}
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-900">TOTAL</span>
              <span className="text-lg font-bold text-gray-900">
                $
                {totalDiscount > 0
                  ? finalAmount.toFixed(2)
                  : getCartTotal().toFixed(2)}
              </span>
            </div>

            {/* Submit Button - Compact */}
            <button
              onClick={submitOrder}
              disabled={cart.length === 0 || !selectedTable || submitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
            </button>
          </div>
        </div>

        {/* Menu Item Details Modal */}
        {showDetailsModal && selectedMenuItemDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMenuItemDetails.name}
                  </h2>
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    ${selectedMenuItemDetails.price.toFixed(2)}
                  </div>
                  {/* Tags in header */}
                  {selectedMenuItemDetails.tags &&
                    selectedMenuItemDetails.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedMenuItemDetails.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 rounded-full text-sm"
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
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Image */}
                {selectedMenuItemDetails.image && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedMenuItemDetails.image}
                      alt={selectedMenuItemDetails.name}
                      width={600}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Allergens - Simple pills */}
                {selectedMenuItemDetails.allergens &&
                  selectedMenuItemDetails.allergens.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Allergens
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMenuItemDetails.allergens.map((allergen) => (
                          <span
                            key={allergen.id}
                            className={`px-3 py-2 rounded-full text-sm font-medium ${
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

                {/* Description */}
                {selectedMenuItemDetails.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedMenuItemDetails.description}
                    </p>
                  </div>
                )}

                {/* Ingredients - Simple comma-separated list */}
                {selectedMenuItemDetails.ingredients &&
                  selectedMenuItemDetails.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Ingredients
                      </h3>
                      <p className="text-gray-700">
                        {selectedMenuItemDetails.ingredients
                          .map(
                            (ingredient) =>
                              ingredient.ingredient?.name ||
                              "Unknown Ingredient"
                          )
                          .join(", ")}
                      </p>
                    </div>
                  )}

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseDetails}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        addToCart(selectedMenuItemDetails);
                        handleCloseDetails();
                      }}
                      className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {restaurantName}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedTable
                  ? `Table ${selectedTable.number}`
                  : "No table selected"}
              </p>
            </div>
            <button
              onClick={() => setShowTableSelector(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {selectedTable ? `Table ${selectedTable.number}` : "Select Table"}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-4 h-4" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          {/* Mobile Category Filters - Horizontal Scroll */}
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-gray-900 text-white"
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
                    ? "bg-gray-900 text-white"
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
            {filteredItems.map((item) => {
              const isAvailable = useMenuAvailabilityStore
                .getState()
                .isItemAvailable(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => isAvailable && addToCart(item)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-200 transition-all duration-200 active:scale-95 ${
                    isAvailable
                      ? "cursor-pointer hover:shadow-md hover:border-gray-300"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Mobile Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
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

                      {/* Out of Stock Overlay */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base truncate">
                            {item.name}
                          </h3>

                          {/* Availability Badge */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block ${
                              isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isAvailable ? "✅ Available" : "❌ Out of Stock"}
                          </span>
                        </div>
                        <span className="text-green-600 font-bold text-lg ml-2">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Promotion Badges - Mobile */}
                      {appliedPromotions.some((promo) =>
                        promo.applied_items.includes(item.name)
                      ) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {appliedPromotions
                            .filter((promo) =>
                              promo.applied_items.includes(item.name)
                            )
                            .map((promo) => (
                              <div
                                key={promo.id}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200"
                              >
                                {promo.name}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Details Link - Mobile */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetails(item);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline mb-2 transition-colors"
                      >
                        View Details
                      </button>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
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
                        <div className="mb-2">
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
                    </div>
                  </div>
                </div>
              );
            })}
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
                <p className="text-lg font-bold text-gray-900">
                  $
                  {totalDiscount > 0
                    ? finalAmount.toFixed(2)
                    : cart
                        .reduce(
                          (sum, item) =>
                            sum + item.menuItem.price * item.quantity,
                          0
                        )
                        .toFixed(2)}
                </p>
                {totalDiscount > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    You saved ${totalDiscount.toFixed(2)}!
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowMobileCart(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                View Order
              </button>
            </div>
          </div>
        )}

        {/* Mobile Cart Modal */}
        {showMobileCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full h-[85vh] rounded-t-3xl p-6 overflow-hidden flex flex-col animate-slide-up">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table and Time Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Table</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTable ? selectedTable.number : "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🛒</div>
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                    <p className="text-gray-400 text-xs">
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
                              <span className="text-gray-500 text-xs">No</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-gray-900 font-semibold text-sm">
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
                              <Minus className="w-3 h-3 text-gray-900" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center text-gray-900">
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
                              <Plus className="w-3 h-3 text-gray-900" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
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
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-gray-900"
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
                  {/* Promotions Display - Mobile */}
                  <PromotionsDisplay
                    promotions={appliedPromotions}
                    subtotal={promotionsSubtotal}
                    totalDiscount={totalDiscount}
                    finalAmount={finalAmount}
                    loading={promotionsLoading}
                  />

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 text-sm">Items:</span>
                      <span className="font-semibold text-gray-900">
                        $
                        {cart
                          .reduce(
                            (sum, item) =>
                              sum + item.menuItem.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="font-bold text-gray-900">
                        $
                        {totalDiscount > 0
                          ? finalAmount.toFixed(2)
                          : cart
                              .reduce(
                                (sum, item) =>
                                  sum + item.menuItem.price * item.quantity,
                                0
                              )
                              .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowMobileCart(false);
                      submitOrder();
                    }}
                    disabled={submitting || !selectedTable}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table Selection Modal - Shared between Desktop and Mobile */}
      {showTableSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 md:p-6 w-[90vw] max-w-[400px] max-h-[500px] overflow-y-auto shadow-xl border border-gray-200 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                SELECT TABLE
              </h2>
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
                  className={`p-3 md:p-4 rounded-lg border transition-colors text-center ${
                    selectedTable?.id === table.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  <div className="font-semibold text-base md:text-lg mb-1">
                    TABLE {table.number}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      selectedTable?.id === table.id
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    {table.capacity} seats
                  </div>
                  {table.location && (
                    <div
                      className={`text-xs ${
                        selectedTable?.id === table.id
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
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
