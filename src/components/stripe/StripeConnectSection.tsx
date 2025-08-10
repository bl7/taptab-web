"use client";

import { useState, useEffect, useCallback } from "react";
import { api, StripeConnectConfig } from "@/lib/api";
import { showToast, SectionLoader } from "@/lib/utils";

interface StripeConnectSectionProps {
  onConfigUpdate?: (config: StripeConnectConfig) => void;
}

export default function StripeConnectSection({
  onConfigUpdate,
}: StripeConnectSectionProps) {
  const [config, setConfig] = useState<StripeConnectConfig>({
    isConnected: false,
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    currency: "usd",
    merchantName: "",
    merchantCountry: "US",
    applePayEnabled: false,
    googlePayEnabled: false,
    merchantId: "",
    merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
    isStripeEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStripeConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getStripeConnectConfig();
      console.log("stripeDebug", "Loaded config from backend:", data);
      setConfig(data);
      onConfigUpdate?.(data);
    } catch (error: unknown) {
      console.error("Error loading Stripe config:", error);
      // Keep default config if backend is not available
    } finally {
      setLoading(false);
    }
  }, [onConfigUpdate]);

  useEffect(() => {
    loadStripeConfig();
  }, [loadStripeConfig]);

  const handleUpdateConfig = async (updates: Partial<StripeConnectConfig>) => {
    try {
      setSaving(true);
      setError(null);

      const updatedConfig = { ...config, ...updates };
      await api.updateStripeConnectConfig(updatedConfig);

      // Reload the config from backend to get the latest state
      await loadStripeConfig();

      showToast.saved("Stripe configuration");
    } catch (error: unknown) {
      console.error("stripeDebug", "Error updating Stripe config:", error);
      setError("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setError(null);

      // Test the Stripe connection by making a test API call
      const testResult = await api.testStripeConnection();

      if (testResult.success) {
        // Update local state to show connected and update config with account info
        setConfig((prev) => ({
          ...prev,
          isConnected: true,
          accountId: testResult.accountId || prev.accountId,
          currency: testResult.currency || prev.currency,
          publishableKey: testResult.publishableKey || prev.publishableKey,
        }));
        alert(
          "Stripe connection test successful! Your account is now connected."
        );
      } else {
        setError("Connection test failed. Please check your Stripe keys.");
      }
    } catch (error: unknown) {
      console.error("stripeDebug", "Error testing Stripe connection:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("Invalid Stripe API keys")) {
          setError(
            "Invalid Stripe API keys. Please check your publishable and secret keys."
          );
        } else if (
          error.message.includes("Tenant payment configuration not found")
        ) {
          setError(
            "No Stripe configuration found. Please save your configuration first."
          );
        } else {
          setError("Failed to test connection. Please try again.");
        }
      } else {
        setError("Failed to test connection. Please try again.");
      }
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SectionLoader height="sm" message="Loading Stripe configuration..." />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Stripe Connect
          </h3>
          <p className="text-gray-600">Manage your Stripe payment processing</p>
        </div>

        <div className="flex items-center space-x-2">
          {config.isConnected ? (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700">
                Connected
              </span>
            </>
          ) : (
            config.publishableKey &&
            config.secretKey && (
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Stripe Configuration
          </h4>
          <p className="text-gray-600 mb-6">
            Enter your Stripe credentials to enable payment processing for your
            restaurant.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const merchantId = formData.get("merchantId") as string;

              // Test with minimal data first
              const testConfig = {
                isStripeEnabled: true,
                publishableKey: formData.get("publishableKey") as string,
                secretKey: formData.get("secretKey") as string,
                webhookSecret: formData.get("webhookSecret") as string,
                currency: formData.get("currency") as string,
                merchantName: formData.get("merchantName") as string,
                merchantCountry: formData.get("merchantCountry") as string,
                applePayEnabled: formData.get("applePayEnabled") === "on",
                googlePayEnabled: formData.get("googlePayEnabled") === "on",
                merchantId: merchantId || undefined,
                merchantCapabilities: [
                  "supports3DS",
                  "supportsCredit",
                  "supportsDebit",
                ],
                isConnected: false, // Don't auto-connect, require test
              };

              handleUpdateConfig(testConfig);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishable Key
                </label>
                <input
                  type="text"
                  name="publishableKey"
                  defaultValue={config.publishableKey || ""}
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  name="secretKey"
                  defaultValue={config.secretKey || ""}
                  placeholder="sk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  name="webhookSecret"
                  defaultValue={config.webhookSecret || ""}
                  placeholder="whsec_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  defaultValue={config.currency || "usd"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="cad">CAD</option>
                  <option value="aud">AUD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant Name
                </label>
                <input
                  type="text"
                  name="merchantName"
                  defaultValue={config.merchantName || ""}
                  placeholder="Your Restaurant Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant Country
                </label>
                <select
                  name="merchantCountry"
                  defaultValue={config.merchantCountry || "US"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apple Pay Merchant ID
                </label>
                <input
                  type="text"
                  name="merchantId"
                  defaultValue={config.merchantId || ""}
                  placeholder="merchant.com.yourrestaurant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="applePayEnabled"
                  defaultChecked={config.applePayEnabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable Apple Pay
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="googlePayEnabled"
                  defaultChecked={config.googlePayEnabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable Google Pay
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
