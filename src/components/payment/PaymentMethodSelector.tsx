"use client";

import React from "react";

export type PaymentMethod = "card" | "apple_pay" | "google_pay";

interface PaymentMethodSelectorProps {
  availableMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  isApplePayAvailable: boolean;
  isGooglePayAvailable: boolean;
}

export function PaymentMethodSelector({
  availableMethods,
  selectedMethod,
  onSelectMethod,
  isApplePayAvailable,
  isGooglePayAvailable,
}: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector">
      <h3 className="text-lg font-semibold mb-4 text-black">
        Choose Payment Method
      </h3>

      <div className="payment-methods-grid">
        {/* Apple Pay */}
        {availableMethods.includes("apple_pay") && isApplePayAvailable && (
          <button
            className={`payment-method-card ${
              selectedMethod === "apple_pay" ? "selected" : ""
            }`}
            onClick={() => onSelectMethod("apple_pay")}
          >
            <div className="payment-method-icon">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
            </div>
            <div className="payment-method-info">
              <span className="payment-method-name text-black">Apple Pay</span>
              <span className="payment-method-description text-black">
                Pay with Apple Pay
              </span>
            </div>
          </button>
        )}

        {/* Google Pay */}
        {availableMethods.includes("google_pay") && isGooglePayAvailable && (
          <button
            className={`payment-method-card ${
              selectedMethod === "google_pay" ? "selected" : ""
            }`}
            onClick={() => onSelectMethod("google_pay")}
          >
            <div className="payment-method-icon">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  fill="currentColor"
                  d="M5.26 11c.88 0 1.6.72 1.6 1.6s-.72 1.6-1.6 1.6-1.6-.72-1.6-1.6.72-1.6 1.6-1.6zm15.48 0c.88 0 1.6.72 1.6 1.6s-.72 1.6-1.6 1.6-1.6-.72-1.6-1.6.72-1.6 1.6-1.6zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                />
              </svg>
            </div>
            <div className="payment-method-info">
              <span className="payment-method-name text-black">Google Pay</span>
              <span className="payment-method-description text-black">
                Pay with Google Pay
              </span>
            </div>
          </button>
        )}

        {/* Credit/Debit Card */}
        {availableMethods.includes("card") && (
          <button
            className={`payment-method-card ${
              selectedMethod === "card" ? "selected" : ""
            }`}
            onClick={() => onSelectMethod("card")}
          >
            <div className="payment-method-icon">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  fill="currentColor"
                  d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                />
              </svg>
            </div>
            <div className="payment-method-info">
              <span className="payment-method-name text-black">
                Credit/Debit Card
              </span>
              <span className="payment-method-description text-black">
                Pay with card
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
