"use client";

import { useState, useEffect } from "react";
import { api, Settings, StripeConnectConfig } from "@/lib/api";
import { StripeConnectSection } from "@/components/stripe";
import { ProfileSection, SettingsTabs } from "@/components/settings";
import { showToast } from "@/lib/utils";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await api.updateSettings(settings);
      showToast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStripeConfigUpdate = (stripeConfig: StripeConnectConfig) => {
    if (settings) {
      setSettings({
        ...settings,
        stripeConfig,
      });
    }
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">No settings available</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <ProfileSection
            settings={settings}
            onSettingsChange={handleSettingsChange}
            saving={saving}
          />

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "stripe",
      label: "Stripe Connect",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      content: (
        <StripeConnectSection onConfigUpdate={handleStripeConfigUpdate} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Settings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your restaurant configuration and payment settings
          </p>
        </div>

        {/* Tabs */}
        <SettingsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
