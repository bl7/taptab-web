'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, TestTube } from 'lucide-react';
import { api } from '@/lib/api';

interface DeliverooConfig {
  restaurantId: string;
  clientId: string;
  clientSecret: string;
  isActive: boolean;
}

export const DeliverooConfig = () => {
  const [config, setConfig] = useState<DeliverooConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantId: '',
    clientId: '',
    clientSecret: ''
  });

  // Fetch current configuration
  const fetchConfig = async () => {
    try {
      const response = await api.getDeliverooConfig();
      console.log('Deliveroo config response:', response);
      
      if (response && response.config) {
        setConfig({
          restaurantId: response.config.restaurantId,
          clientId: response.config.clientId,
          clientSecret: '', // Never show existing secret
          isActive: response.config.isActive
        });
        setFormData({
          restaurantId: response.config.restaurantId || '',
          clientId: response.config.clientId || '',
          clientSecret: '' // Never show existing secret
        });
      } else {
        console.log('No config found or invalid response structure:', response);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      // Don't show alert for fetch errors as it might be normal (no config exists yet)
    }
  };

  // Save configuration
  const saveConfig = async () => {
    setLoading(true);
    try {
      const response = await api.saveDeliverooConfig(formData);
      console.log('Save config response:', response);
      
      if (response && response.success) {
        alert('✅ Deliveroo configuration saved successfully!');
        fetchConfig();
      } else {
        alert(`❌ Error: ${response?.message || 'Failed to save configuration'}`);
      }
    } catch (error) {
      console.error('Save config error:', error);
      alert(`❌ Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.testDeliverooConnection();
      console.log('Test connection response:', response);
      
      if (response && response.success) {
        alert('✅ Connection test successful!');
      } else {
        alert(`❌ Connection failed: ${response?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      alert(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-black">Deliveroo Integration</h2>
          </div>
          <p className="text-black mt-2">Configure your Deliveroo API credentials and test the connection</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">API Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Restaurant ID
                </label>
                <input
                  type="text"
                  value={formData.restaurantId}
                  onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                  placeholder="Your Deliveroo restaurant ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  placeholder="Deliveroo API Client ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                  placeholder="Deliveroo API Client Secret"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={saveConfig} 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
              </button>
              
              <button 
                onClick={testConnection} 
                disabled={loading || !config}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <TestTube className="h-4 w-4" />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {config && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-black">Current Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-black"><strong>Restaurant ID:</strong> {config.restaurantId}</p>
                  <p className="text-sm text-black"><strong>Client ID:</strong> {config.clientId}</p>
                </div>
                <div>
                  <p className="text-sm text-black">
                    <strong>Status:</strong> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 