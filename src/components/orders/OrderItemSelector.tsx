import React, { useState, useEffect } from "react";
import { useBulkAvailability } from "@/lib/use-availability-guard";
import MenuItemCard from "@/components/menu/MenuItemCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean;
}

interface OrderItemSelectorProps {
  onItemSelect: (itemId: string) => void;
  className?: string;
}

const OrderItemSelector: React.FC<OrderItemSelectorProps> = ({
  onItemSelect,
  className = "",
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(true); // Show unavailable items by default

  // Get availability for all items
  const { availableItems, unavailableItems, hasUnavailable } =
    useBulkAvailability(menuItems.map((item) => item.id));

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
    const matchesAvailability = showUnavailable || item.available !== false;
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch("/api/menu/items");
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId: string) => {
    // Check if item is available before allowing selection
    const item = menuItems.find((item) => item.id === itemId);
    if (item && item.available !== false) {
      onItemSelect(itemId);
    }
  };

  if (loading) {
    return (
      <div className={`order-item-selector ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading menu items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`order-item-selector ${className}`}>
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

        {/* Availability Summary */}
        {hasUnavailable && (
          <div className="text-sm text-gray-600">
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToOrder={handleItemClick}
            showAvailability={true}
            disabled={item.available === false} // Disable unavailable items
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
    </div>
  );
};

export default OrderItemSelector;
