"use client";

import React, { useState, useEffect } from "react";
import { PaymentMethodSelector, PaymentMethod } from "./PaymentMethodSelector";
import { PaymentForm } from "./PaymentForm";
import { ApplePayButton } from "./ApplePayButton";
import { GooglePayButton } from "./GooglePayButton";
import { PaymentAPI, PaymentIntent, StripeConfig } from "@/lib/payment-api";

interface PaymentSectionProps {
  tenantSlug: string;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
  stripeConfig: StripeConfig;
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export function PaymentSection({
  tenantSlug,
  amount,
  currency,
  orderId,
  customerEmail,
  stripeConfig,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handlePaymentSuccess = (paymentIntent: PaymentIntent) => {
    onPaymentSuccess(paymentIntent);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onPaymentError(error);
  };

  const handleCancel = () => {
    setSelectedMethod(null);
    setError(null);
    onCancel();
  };

  const getAvailableMethods = (): PaymentMethod[] => {
    if (!stripeConfig) return [];

    const methods: PaymentMethod[] = ["card"];

    if (stripeConfig.applePayEnabled) {
      methods.push("apple_pay");
    }

    if (stripeConfig.googlePayEnabled) {
      methods.push("google_pay");
    }

    return methods;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (error) {
    return (
      <div className="payment-section-error">
        <p className="text-black">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stripeConfig?.isStripeEnabled) {
    console.log("stripeDebug", "PaymentSection: Stripe not enabled");
    return (
      <div className="payment-section-disabled">
        <p className="text-black">
          Payment is not available for this restaurant.
        </p>
      </div>
    );
  }

  console.log(
    "stripeDebug",
    "PaymentSection: Rendering payment UI, available methods:",
    getAvailableMethods()
  );

  return (
    <div className="payment-section">
      {!selectedMethod ? (
        <PaymentMethodSelector
          availableMethods={getAvailableMethods()}
          selectedMethod={selectedMethod}
          onSelectMethod={setSelectedMethod}
          isApplePayAvailable={stripeConfig.applePayEnabled}
          isGooglePayAvailable={stripeConfig.googlePayEnabled}
        />
      ) : (
        <div className="payment-method-content">
          {selectedMethod === "card" && (
            <PaymentForm
              tenantSlug={tenantSlug}
              amount={amount}
              currency={currency}
              orderId={orderId}
              customerEmail={customerEmail}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
            />
          )}

          {selectedMethod === "apple_pay" && stripeConfig.applePayEnabled && (
            <div className="apple-pay-container">
              <ApplePayButton
                tenantSlug={tenantSlug}
                amount={amount}
                currency={currency}
                orderId={orderId}
                customerEmail={customerEmail}
                merchantName={stripeConfig.merchantName}
                merchantCountry={stripeConfig.merchantCountry}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={handleCancel}
              />
            </div>
          )}

          {selectedMethod === "google_pay" && stripeConfig.googlePayEnabled && (
            <div className="google-pay-container">
              <GooglePayButton
                tenantSlug={tenantSlug}
                amount={amount}
                currency={currency}
                orderId={orderId}
                customerEmail={customerEmail}
                merchantName={stripeConfig.merchantName}
                merchantCountry={stripeConfig.merchantCountry}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={handleCancel}
              />
            </div>
          )}

          <button
            onClick={handleCancel}
            className="text-center w-full text-blue-600 hover:text-blue-800 underline mt-4"
          >
            Back to Payment Methods
          </button>
        </div>
      )}

      {/* Powered by Stripe badge */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-gray-700">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
