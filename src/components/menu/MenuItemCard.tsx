import React from "react";
import Image from "next/image";
import { useItemAvailability } from "@/lib/use-availability-guard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  available?: boolean; // Add available property
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (itemId: string) => void;
  showAvailability?: boolean;
  className?: string;
  disabled?: boolean; // Add disabled prop
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToOrder,
  showAvailability = true,
  className = "",
  disabled = false,
}) => {
  const { isAvailable } = useItemAvailability(item.id);
  
  // Use item.available if provided, otherwise fall back to store availability
  const itemAvailable = item.available !== undefined ? item.available : isAvailable;
  const isDisabled = disabled || !itemAvailable;

  const handleAddToOrder = () => {
    if (itemAvailable && !disabled) {
      onAddToOrder(item.id);
    }
  };

  return (
    <div
      className={`menu-item-card ${
        isDisabled ? "unavailable" : ""
      } ${className}`}
    >
      {item.image && (
        <div className="item-image relative">
          <Image
            src={item.image}
            alt={item.name}
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-t-lg"
          />
          {isDisabled && (
            <div className="out-of-stock-overlay absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-t-lg">
              <span className="text-white font-bold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
      )}

      <div className="item-content p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="item-name text-lg font-semibold text-gray-900">
            {item.name}
          </h3>
          {showAvailability && (
            <span
              className={`availability-badge px-2 py-1 rounded-full text-xs font-medium ${
                itemAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {itemAvailable ? "✅ Available" : "❌ Out of Stock"}
            </span>
          )}
        </div>

        {item.description && (
          <p className="item-description text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.category && (
          <p className="item-category text-gray-500 text-xs mb-3">
            {item.category}
          </p>
        )}

        <div className="flex justify-between items-center">
          <p className="item-price text-xl font-bold text-gray-900">
            ${item.price.toFixed(2)}
          </p>

          <button
            onClick={handleAddToOrder}
            disabled={isDisabled}
            className={`add-to-order-btn px-4 py-2 rounded-lg font-medium transition-colors ${
              itemAvailable && !disabled
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {itemAvailable && !disabled ? "Add to Order" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
