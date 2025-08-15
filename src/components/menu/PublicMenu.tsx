import React, { useState, useEffect } from "react";
import { useMenuAvailabilityStore } from "@/lib/menu-availability-store";
import MenuItemCard from "./MenuItemCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
}

interface PublicMenuProps {
  className?: string;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ className = "" }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showUnavailable, setShowUnavailable] = useState(true); // Show unavailable items by default

  const setItemAvailability = useMenuAvailabilityStore(
    (state) => state.setItemAvailability
  );

  useEffect(() => {
    fetchPublicMenu();
    const interval = setInterval(fetchPublicMenu, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchPublicMenu = async () => {
    try {
      setLoading(true);
      // Replace with your actual public menu API endpoint
      const response = await fetch("/api/v1/public/menu/items");
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.data.items);

        // Update availability store
        data.data.items.forEach((item: { id: string; available: boolean }) => {
          setItemAvailability(item.id, item.available);
        });
      }
    } catch (error) {
      console.error("Failed to fetch public menu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(
      new Set(
        menuItems
          .map((item) => item.category)
          .filter((category): category is string => Boolean(category))
      )
    ),
  ];

  // Filter items by category and search (now includes unavailable items)
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (itemId: string) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(itemId) || 0;
      newCart.set(itemId, currentQuantity + 1);
      return newCart;
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(itemId) || 0;
      if (currentQuantity <= 1) {
        newCart.delete(itemId);
      } else {
        newCart.set(itemId, currentQuantity - 1);
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    let total = 0;
    cart.forEach((quantity, itemId) => {
      const item = menuItems.find((item) => item.id === itemId);
      if (item) {
        total += item.price * quantity;
      }
    });
    return total;
  };

  const getCartItemCount = () => {
    let count = 0;
    cart.forEach((quantity) => (count += quantity));
    return count;
  };

  if (loading) {
    return (
      <div className={`public-menu ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`public-menu ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
        <p className="text-gray-600">Browse our delicious offerings</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0 14 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category === "all" ? "All Categories" : category}
            </button>
          ))}
        </div>

        {/* Availability Toggle */}
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
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToOrder={handleAddToCart}
            showAvailability={true}
            disabled={!item.available} // Pass availability status to disable card
          />
        ))}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchTerm || selectedCategory !== "all"
              ? "No items match your search criteria"
              : "No items available"}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search or category filter
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {getCartItemCount()} item{getCartItemCount() !== 1 ? "s" : ""}{" "}
                in cart
              </span>
              <span className="text-lg font-semibold text-gray-900">
                Total: ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                /* Handle checkout */
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMenu;
