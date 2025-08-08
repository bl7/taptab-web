"use client";

import { useState, useEffect, useCallback } from "react";
import { PaymentSection } from "@/components/payment";
import { PaymentAPI, StripeConfig } from "@/lib/payment-api";

interface OrderPaymentSectionProps {
  tenantSlug: string;
  orderId: string;
  amount: number;
  onPaymentSuccess: (paymentResult: unknown) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function OrderPaymentSection({
  tenantSlug,
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: OrderPaymentSectionProps) {
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStripeConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "stripeDebug",
        "Loading Stripe config for tenantSlug:",
        tenantSlug
      );
      const config = await PaymentAPI.getStripeConfig(tenantSlug);
      console.log("stripeDebug", "Stripe config loaded:", config);
      setStripeConfig(config);
    } catch (error: unknown) {
      console.error("stripeDebug", "Error loading Stripe config:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("404") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "Payment processing is not available for this restaurant yet."
        );
      } else {
        setError("Failed to load payment configuration");
      }
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadStripeConfig();
  }, [loadStripeConfig]);

  const handlePaymentSuccess = async (paymentResult: unknown) => {
    // Payment is confirmed by Stripe - order status updated automatically
    // For QR orders: paymentStatus changes to 'paid' but order stays 'active'
    // For regular orders: paymentStatus changes to 'paid' and order becomes 'closed'
    // No manual order update needed - backend handles the new status system
    onPaymentSuccess(paymentResult);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onPaymentError(error);
  };

  if (loading) {
    console.log("stripeDebug", "OrderPaymentSection is loading...");
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 text-black rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">Unavailable</h3>
          <p className="text-black mb-4">{error}</p>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!stripeConfig) {
    console.log("stripeDebug", "OrderPaymentSection: No stripeConfig");
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            Payment Not Configured
          </h3>
          <p className="text-black mb-4">
            This restaurant hasn&apos;t set up payment processing yet.
          </p>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log(
    "stripeDebug",
    "OrderPaymentSection: Rendering payment UI with config:",
    stripeConfig
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-2">
          Complete Your Order
        </h3>
        <p className="text-black">Total: ${(amount / 100).toFixed(2)}</p>
      </div>

      <PaymentSection
        tenantSlug={tenantSlug}
        stripeConfig={stripeConfig}
        amount={amount}
        currency={stripeConfig.currency}
        orderId={orderId}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={onCancel}
      />
    </div>
  );
}
