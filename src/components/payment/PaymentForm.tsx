"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PaymentAPI, PaymentIntent, StripeConfig } from "@/lib/payment-api";

interface PaymentFormProps {
  tenantSlug: string;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#000000",
      "::placeholder": {
        color: "#666666",
      },
    },
    invalid: {
      color: "#e53e3e",
    },
  },
};

function PaymentFormContent({
  tenantSlug,
  amount,
  currency,
  orderId,
  customerEmail,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const paymentIntent = await PaymentAPI.createPaymentIntent({
        tenantSlug,
        amount,
        currency,
        orderId,
        customerEmail,
        metadata: {
          tenantSlug,
          orderId,
        },
      });

      // Confirm card payment
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        throw new Error("Card elements not found");
      }

      const { error: stripeError, paymentIntent: confirmedIntent } =
        await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              email: customerEmail,
            },
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      if (confirmedIntent.status === "succeeded") {
        // Payment is already confirmed by Stripe - no need for additional backend call
        // The confirmPayment call is causing the "Order not found" error
        console.log("✅ Payment confirmed by Stripe:", confirmedIntent.id);

        // Payment is confirmed - order status is updated automatically by Stripe
        onPaymentSuccess(paymentIntent);
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="payment-form">
      <div className="payment-summary">
        <h3 className="text-lg font-semibold mb-2 text-black">
          Payment Summary
        </h3>
        <div className="amount-display">
          <span className="amount-label">Total Amount:</span>
          <span className="amount-value">{formatAmount(amount, currency)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form-content">
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Card Number
            </label>
            <div className="border border-gray-300 rounded-lg p-3 bg-white">
              <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Expiry Date and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Expiry Date
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white">
                <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                CVC
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white">
                <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="submit"
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={!stripe || loading}
          >
            {loading
              ? "Processing..."
              : `Pay ${formatAmount(amount, currency)}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const config = await PaymentAPI.getStripeConfig(props.tenantSlug);
        setStripeConfig(config);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load payment configuration";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadStripeConfig();
  }, [props.tenantSlug]);

  if (loading) {
    return (
      <div className="payment-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-form-error">
        <p>Error: {error}</p>
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
    return (
      <div className="payment-form-disabled">
        <p>Payment is not available for this restaurant.</p>
      </div>
    );
  }

  return (
    <Elements stripe={loadStripe(stripeConfig.publishableKey)}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
