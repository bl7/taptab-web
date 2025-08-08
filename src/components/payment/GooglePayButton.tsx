"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { PaymentAPI, PaymentIntent } from "@/lib/payment-api";

interface GooglePayButtonProps {
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

export function GooglePayButton({
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
}: GooglePayButtonProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeConfig = await PaymentAPI.getStripeConfig(tenantSlug);
        const stripeInstance = await loadStripe(stripeConfig.publishableKey);
        setStripe(stripeInstance);

        // Debug Google Pay availability
        console.log("📱 GooglePayButton - Checking Google Pay availability");
        console.log("📱 window.google:", typeof window.google);
        console.log(
          "📱 window.google.payments:",
          window.google?.payments ? "available" : "not available"
        );

        // Check if Google Pay is available
        if (stripeInstance && window.google && window.google.payments) {
          setIsGooglePayAvailable(true);
          console.log("✅ Google Pay is available!");
        } else {
          console.log("❌ Google Pay is NOT available on this device/browser");
        }
      } catch (error) {
        console.error("Failed to initialize Google Pay:", error);
      }
    };

    initializeStripe();
  }, [tenantSlug]);

  const handleGooglePayPayment = async () => {
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

      // Create Google Pay payment request
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
                : "Google Pay payment failed";
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
        error instanceof Error ? error.message : "Google Pay payment failed";
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

  if (!isGooglePayAvailable) {
    return (
      <div className="payment-method-unavailable">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Google Pay Not Available
          </h3>
          <p className="text-gray-500 mb-4">
            Google Pay is only available on Android devices with Chrome browser
            and requires setting up a payment method in your Google Pay app.
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
      className="google-pay-button"
      onClick={handleGooglePayPayment}
      disabled={loading}
    >
      {loading ? (
        <span>Processing...</span>
      ) : (
        <>
          <svg className="google-pay-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M5.26 11c.88 0 1.6.72 1.6 1.6s-.72 1.6-1.6 1.6-1.6-.72-1.6-1.6.72-1.6 1.6-1.6zm15.48 0c.88 0 1.6.72 1.6 1.6s-.72 1.6-1.6 1.6-1.6-.72-1.6-1.6.72-1.6 1.6-1.6zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
          <span>Pay with Google Pay</span>
          <span className="amount">{formatAmount(amount, currency)}</span>
        </>
      )}
    </button>
  );
}
