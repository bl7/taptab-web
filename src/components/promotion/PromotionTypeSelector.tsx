"use client";

import React from "react";

export interface PromotionType {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPopular?: boolean;
}

const PROMOTION_TYPES: PromotionType[] = [
  {
    id: "percentage_discount",
    name: "Percentage Discount",
    description: "Give customers a percentage off their order (e.g., 10% off)",
    icon: "💯",
    isPopular: true,
  },
  {
    id: "fixed_amount_discount",
    name: "Fixed Amount Off",
    description: "Give customers a fixed amount off (e.g., $5 off)",
    icon: "💰",
    isPopular: true,
  },
  {
    id: "buy_one_get_one",
    name: "Buy One Get One",
    description: "Buy one item, get another free or discounted",
    icon: "🎁",
  },
  {
    id: "minimum_order_discount",
    name: "Minimum Order Discount",
    description:
      "Discount when order reaches minimum amount (e.g., 15% off orders over $50)",
    icon: "📈",
    isPopular: true,
  },
  {
    id: "free_delivery",
    name: "Free Delivery",
    description: "Waive delivery fees for qualifying orders",
    icon: "🚚",
  },
  {
    id: "happy_hour",
    name: "Happy Hour",
    description: "Time-based discounts (e.g., 20% off from 3-5 PM)",
    icon: "⏰",
  },
];

interface PromotionTypeSelectorProps {
  onSelectType: (type: PromotionType) => void;
  onCancel: () => void;
}

export const PromotionTypeSelector: React.FC<PromotionTypeSelectorProps> = ({
  onSelectType,
  onCancel,
}) => {
  return (
    <div className="promotion-type-selector">
      <div className="type-selector-header">
        <h2>Choose Promotion Type</h2>
        <p>Select the type of promotion you want to create</p>
      </div>

      <div className="promotion-types-grid">
        {PROMOTION_TYPES.map((type) => (
          <div
            key={type.id}
            className={`promotion-type-card ${type.isPopular ? "popular" : ""}`}
            onClick={() => onSelectType(type)}
          >
            {type.isPopular && <div className="popular-badge">Popular</div>}

            <div className="type-icon">{type.icon}</div>
            <h3>{type.name}</h3>
            <p>{type.description}</p>

            <button className="select-type-btn">Choose This Type</button>
          </div>
        ))}
      </div>

      <div className="type-selector-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
