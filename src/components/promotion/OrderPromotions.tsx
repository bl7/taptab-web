"use client";

import React, { useState, useEffect } from "react";
import {
  usePromotionPreview,
  usePromoCodeValidation,
  useAvailablePromotions,
} from "@/lib/use-promotions";
import { CartItem, Customer, PromotionPreview } from "@/interfaces/promotion";
import { showToast } from "@/lib/utils";

interface OrderPromotionsProps {
  tenantSlug: string;
  cart: Array<{
    menuItem: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    notes: string;
  }>;
  customer: Customer;
  onPromotionsUpdate: (preview: PromotionPreview | null) => void;
  appliedPromoCodes: string[];
  onPromoCodesUpdate: (codes: string[]) => void;
}

export const OrderPromotions: React.FC<OrderPromotionsProps> = ({
  tenantSlug,
  cart,
  customer,
  onPromotionsUpdate,
  appliedPromoCodes,
  onPromoCodesUpdate,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);

  const { availablePromotions } = useAvailablePromotions(tenantSlug);
  const {
    preview,
    loading: previewLoading,
    previewPromotions,
  } = usePromotionPreview(tenantSlug);
  const { validatePromoCode, loading: validationLoading } =
    usePromoCodeValidation(tenantSlug);

  // Convert cart format to CartItem format
  const cartItems: CartItem[] = cart.map((item) => ({
    menuItemId: item.menuItem.id,
    name: item.menuItem.name,
    quantity: item.quantity,
    unitPrice: item.menuItem.price,
    totalPrice: item.menuItem.price * item.quantity,
    notes: item.notes,
  }));

  useEffect(() => {
    if (cartItems.length > 0) {
      previewPromotions(cartItems, appliedPromoCodes, customer.phone);
    }
  }, [cartItems, appliedPromoCodes, customer.phone, previewPromotions]);

  useEffect(() => {
    onPromotionsUpdate(preview);
  }, [preview, onPromotionsUpdate]);

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const validation = await validatePromoCode(
      promoCodeInput.toUpperCase(),
      cartItems,
      cartTotal,
      customer.phone
    );

    if (validation.valid) {
      onPromoCodesUpdate([...appliedPromoCodes, promoCodeInput.toUpperCase()]);
      setPromoCodeInput("");
      setShowPromoInput(false);
      showToast.success(
        `Promo code applied! You save Rs. ${validation.estimatedDiscount}`
      );
    } else {
      showToast.error(validation.error?.message || "Invalid promo code");
    }
  };

  const handleRemovePromoCode = (codeToRemove: string) => {
    onPromoCodesUpdate(
      appliedPromoCodes.filter((code) => code !== codeToRemove)
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.1; // 10% tax
  const serviceChargeRate = 0.05; // 5% service charge

  // Filter available promotions to show only relevant ones
  const relevantPromotions = availablePromotions.filter((promo) => {
    if (!promo.isActive) return false;
    if (promo.minCartValue > 0 && cartTotal < promo.minCartValue) return false;
    if (promo.requiresCode) return false; // Don't show code-required promos in auto-apply section
    return true;
  });

  return (
    <div className="order-promotions">
      {/* Available Auto-Apply Promotions */}
      {relevantPromotions.length > 0 && (
        <div className="available-promotions">
          <h3 className="promotions-title">Available Offers</h3>
          <div className="promotions-list">
            {relevantPromotions.map((promo) => (
              <div key={promo.id} className="promotion-card">
                <div className="promotion-info">
                  <h4 className="promotion-name">{promo.name}</h4>
                  {promo.description && (
                    <p className="promotion-description">{promo.description}</p>
                  )}
                  <div className="promotion-details">
                    {promo.discountType === "PERCENTAGE" && (
                      <span className="discount-value">
                        {promo.discountValue}% off
                      </span>
                    )}
                    {promo.discountType === "FIXED_AMOUNT" && (
                      <span className="discount-value">
                        Rs. {promo.discountValue} off
                      </span>
                    )}
                    {promo.minCartValue > 0 && (
                      <span className="condition">
                        Min: Rs. {promo.minCartValue}
                      </span>
                    )}
                  </div>
                </div>
                <div className="promotion-status">
                  {cartTotal >= promo.minCartValue ? (
                    <span className="status-eligible">✓ Eligible</span>
                  ) : (
                    <span className="status-not-eligible">
                      Add Rs. {promo.minCartValue - cartTotal} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Code Section */}
      <div className="promo-code-section">
        <div className="promo-header">
          <h3>Promo Code</h3>
          <button
            className="toggle-promo-btn"
            onClick={() => setShowPromoInput(!showPromoInput)}
          >
            {showPromoInput ? "Cancel" : "Have a code?"}
          </button>
        </div>

        {showPromoInput && (
          <div className="promo-input-container">
            <div className="promo-input-group">
              <input
                type="text"
                className="promo-input"
                placeholder="Enter promo code"
                value={promoCodeInput}
                onChange={(e) =>
                  setPromoCodeInput(e.target.value.toUpperCase())
                }
                onKeyPress={(e) => e.key === "Enter" && handleApplyPromoCode()}
              />
              <button
                className="apply-promo-btn"
                onClick={handleApplyPromoCode}
                disabled={!promoCodeInput.trim() || validationLoading}
              >
                {validationLoading ? "Checking..." : "Apply"}
              </button>
            </div>
          </div>
        )}

        {appliedPromoCodes.length > 0 && (
          <div className="applied-codes">
            <h4 className="applied-codes-title">Applied Codes</h4>
            <div className="codes-list">
              {appliedPromoCodes.map((code) => (
                <div key={code} className="applied-code">
                  <span className="code-text">{code}</span>
                  <button
                    className="remove-code-btn"
                    onClick={() => handleRemovePromoCode(code)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary with Promotions */}
      {preview && (
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-line">
            <span>Subtotal:</span>
            <span>Rs. {preview.originalSubtotal.toFixed(2)}</span>
          </div>

          {preview.promotions.applicablePromotions.map((promo) => (
            <div key={promo.promotionId} className="summary-line discount">
              <span className="discount-name">{promo.promotionName}:</span>
              <span className="discount-amount">
                -Rs. {promo.discountAmount.toFixed(2)}
              </span>
            </div>
          ))}

          {preview.promotions.totalDiscount > 0 && (
            <div className="summary-line total-discount">
              <span>Total Discount:</span>
              <span>-Rs. {preview.promotions.totalDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-line">
            <span>After Discounts:</span>
            <span>
              Rs.{" "}
              {(
                preview.originalSubtotal - preview.promotions.totalDiscount
              ).toFixed(2)}
            </span>
          </div>

          <div className="summary-line">
            <span>Service Charge (5%):</span>
            <span>
              Rs.{" "}
              {(
                (preview.originalSubtotal - preview.promotions.totalDiscount) *
                serviceChargeRate
              ).toFixed(2)}
            </span>
          </div>

          <div className="summary-line">
            <span>Tax (10%):</span>
            <span>
              Rs.{" "}
              {(
                (preview.originalSubtotal - preview.promotions.totalDiscount) *
                taxRate
              ).toFixed(2)}
            </span>
          </div>

          <div className="summary-line total">
            <span>Total:</span>
            <span>Rs. {preview.estimatedFinalAmount.toFixed(2)}</span>
          </div>

          {preview.promotions.totalDiscount > 0 && (
            <div className="savings-highlight">
              <span className="savings-text">
                🎉 You Save: Rs. {preview.promotions.totalDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {previewLoading && (
            <div className="preview-loading">
              <span>Calculating promotions...</span>
            </div>
          )}
        </div>
      )}

      {/* Auto-applied Promotions Info */}
      {preview?.promotions.autoAppliedPromotions &&
        preview.promotions.autoAppliedPromotions.length > 0 && (
          <div className="auto-applied-info">
            <h4>Automatically Applied</h4>
            {preview.promotions.autoAppliedPromotions.map((promo) => (
              <div key={promo.promotionId} className="auto-applied-item">
                <span className="promo-name">{promo.promotionName}</span>
                <span className="promo-savings">
                  Saves Rs. {promo.discountAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};
