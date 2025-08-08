"use client";

import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface SettingsTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <span className="w-5 h-5">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
} 