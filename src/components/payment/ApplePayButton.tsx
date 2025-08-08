"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { PaymentAPI, PaymentIntent } from "@/lib/payment-api";

interface ApplePayButtonProps {
  tenantSlug: string;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
  merchantName: string;
  merchantCountry: string;
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export function ApplePayButton({
  tenantSlug,
  amount,
  currency,
  orderId,
  customerEmail,
  merchantName,
  merchantCountry,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: ApplePayButtonProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeConfig = await PaymentAPI.getStripeConfig(tenantSlug);
        const stripeInstance = await loadStripe(stripeConfig.publishableKey);
        setStripe(stripeInstance);

        // Debug Apple Pay availability
        console.log("🍎 ApplePayButton - Checking Apple Pay availability");
        console.log(
          "🍎 window.ApplePaySession:",
          typeof window.ApplePaySession
        );

        if (window.ApplePaySession) {
          console.log(
            "🍎 ApplePaySession.canMakePayments():",
            window.ApplePaySession.canMakePayments()
          );
        } else {
          console.log(
            "🍎 ApplePaySession not available on this device/browser"
          );
        }

        // Check if Apple Pay is available
        if (
          stripeInstance &&
          window.ApplePaySession &&
          window.ApplePaySession.canMakePayments()
        ) {
          setIsApplePayAvailable(true);
          console.log("✅ Apple Pay is available!");
        } else {
          console.log("❌ Apple Pay is NOT available on this device/browser");
        }
      } catch (error) {
        console.error("Failed to initialize Apple Pay:", error);
      }
    };

    initializeStripe();
  }, [tenantSlug]);

  const handleApplePayPayment = async () => {
    if (!stripe) return;

    setLoading(true);

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

      // Create Apple Pay payment request
      const paymentRequest = stripe.paymentRequest({
        country: merchantCountry,
        currency: currency.toLowerCase(),
        total: {
          label: merchantName,
          amount: amount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      paymentRequest.on(
        "paymentmethod",
        async (event: { paymentMethod: { id: string } }) => {
          try {
            const { error: confirmError, paymentIntent: confirmedIntent } =
              await stripe.confirmCardPayment(paymentIntent.clientSecret, {
                payment_method: event.paymentMethod.id,
              });

            if (confirmError) {
              throw new Error(confirmError.message);
            }

            // Payment is already confirmed by Stripe - no need for additional backend call
            // The confirmPayment call is causing the "Order not found" error
            console.log("✅ Payment confirmed by Stripe:", confirmedIntent.id);

            // Create a proper PaymentIntent object for the callback
            const paymentIntentData: PaymentIntent = {
              clientSecret: paymentIntent.clientSecret,
              paymentIntentId: confirmedIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
            };

            // Payment is confirmed - order status is updated automatically by Stripe
            onPaymentSuccess(paymentIntentData);
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Apple Pay payment failed";
            onPaymentError(errorMessage);
          } finally {
            setLoading(false);
          }
        }
      );

      paymentRequest.on("cancel", () => {
        setLoading(false);
        onCancel();
      });

      await paymentRequest.show();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Apple Pay payment failed";
      onPaymentError(errorMessage);
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (!isApplePayAvailable) {
    return (
      <div className="payment-method-unavailable">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🍎</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Apple Pay Not Available
          </h3>
          <p className="text-gray-500 mb-4">
            Apple Pay is only available on iOS devices with Safari browser and
            requires setting up a payment method in your Apple Wallet.
          </p>
          <button
            onClick={onCancel}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Choose Different Payment Method
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="apple-pay-button"
      onClick={handleApplePayPayment}
      disabled={loading}
    >
      {loading ? (
        <span>Processing...</span>
      ) : (
        <>
          <svg className="apple-pay-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
            />
          </svg>
          <span>Pay with Apple Pay</span>
          <span className="amount">{formatAmount(amount, currency)}</span>
        </>
      )}
    </button>
  );
}
