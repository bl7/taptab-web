'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface SyncResult {
  success: boolean;
  data?: {
    synced: number;
    total: number;
    errors?: string[];
  };
  error?: {
    message: string;
  };
}

export const DeliverooMenuSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Sync menu to Deliveroo
  const syncMenu = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch('/api/v1/deliveroo/sync/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSyncResult(data);
      
      if (data.success) {
        alert(`✅ Menu synced successfully! ${data.data?.synced} items synced.`);
      } else {
        alert(`❌ Sync failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch {
      alert('❌ Failed to sync menu');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-black">Menu Synchronization</h2>
          </div>
          <p className="text-black mt-2">Sync your POS menu to Deliveroo platform</p>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Sync Information</h3>
            <ul className="space-y-2 text-black">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Categories will be created automatically</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Items will be synced with prices and descriptions</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Availability status will be updated</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span>This process may take a few minutes</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={syncMenu} 
              disabled={syncing}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 text-lg"
            >
              <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Menu to Deliveroo'}</span>
            </button>
          </div>

          {syncResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Sync Result</h3>
              <div className={`p-4 rounded-lg ${
                syncResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-semibold text-black">
                    {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
                  </span>
                </div>
                
                {syncResult.success && syncResult.data && (
                  <div className="space-y-2 text-black">
                    <p><strong>Items Synced:</strong> {syncResult.data.synced}</p>
                    <p><strong>Total Items:</strong> {syncResult.data.total}</p>
                    {syncResult.data.errors && syncResult.data.errors.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-600">Errors:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {syncResult.data.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {!syncResult.success && syncResult.error && (
                  <p className="text-red-600">{syncResult.error.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 