'use client';

import React, { useState } from 'react';
import { DeliverooConfig } from '@/components/DeliverooConfig';
import { DeliverooOrders } from '@/components/DeliverooOrders';
import { DeliverooMenuSync } from '@/components/DeliverooMenuSync';
import { DeliverooSiteManagement } from '@/components/DeliverooSiteManagement';
import { Truck, Settings, Upload, Clock } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

export default function DeliverooDashboard() {
  const [activeTab, setActiveTab] = useState('config');

  const tabs: Tab[] = [
    { 
      id: 'config', 
      label: 'Configuration', 
      icon: <Settings className="h-4 w-4" />,
      component: DeliverooConfig 
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <Truck className="h-4 w-4" />,
      component: DeliverooOrders 
    },
    { 
      id: 'menu', 
      label: 'Menu Sync', 
      icon: <Upload className="h-4 w-4" />,
      component: DeliverooMenuSync 
    },
    { 
      id: 'site', 
      label: 'Site Management', 
      icon: <Clock className="h-4 w-4" />,
      component: DeliverooSiteManagement 
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Deliveroo Integration</h1>
                <p className="text-sm text-black opacity-75">Manage your Deliveroo presence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-black hover:text-orange-600 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
} 