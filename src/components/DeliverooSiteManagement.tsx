'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Settings } from 'lucide-react';

interface OpeningHours {
  open_time?: string;
  close_time?: string;
  closed?: boolean;
}

interface SiteInfo {
  name: string;
  status: string;
  workload_mode?: string;
  opening_hours?: OpeningHours[];
}

export const DeliverooSiteManagement = () => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('open');
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch site information
  const fetchSiteInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch('/api/v1/deliveroo/site', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSiteInfo(data.data.site);
        setStatus(data.data.site.status);
        setOpeningHours(data.data.site.opening_hours || Array(7).fill({}));
      }
    } catch (error) {
      console.error('Failed to fetch site info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update site status
  const updateStatus = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch('/api/v1/deliveroo/site/status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Status updated successfully!');
        fetchSiteInfo();
      } else {
        alert(`❌ Failed to update status: ${data.error?.message || 'Unknown error'}`);
      }
    } catch {
      alert('❌ Failed to update status');
    }
  };

  // Update opening hours
  const updateOpeningHours = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch('/api/v1/deliveroo/site/opening-hours', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ opening_hours: openingHours })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Opening hours updated successfully!');
        fetchSiteInfo();
      } else {
        alert(`❌ Failed to update hours: ${data.error?.message || 'Unknown error'}`);
      }
    } catch {
      alert('❌ Failed to update opening hours');
    }
  };

  useEffect(() => {
    fetchSiteInfo();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-black">Site Management</h2>
          </div>
          <p className="text-black mt-2">Manage your restaurant status and opening hours on Deliveroo</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-black mt-4">Loading site information...</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">Restaurant Status</h3>
                <div className="flex items-center space-x-4">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="busy">Busy</option>
                  </select>
                  <button 
                    onClick={updateStatus} 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">Opening Hours</h3>
                <div className="space-y-3">
                  {days.map((day, index) => (
                    <div key={day} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                      <span className="w-24 font-medium text-black">{day}</span>
                      <input
                        type="time"
                        value={openingHours[index]?.open_time || ''}
                        onChange={(e) => {
                          const newHours = [...openingHours];
                          if (!newHours[index]) newHours[index] = {};
                          newHours[index] = { ...newHours[index], open_time: e.target.value };
                          setOpeningHours(newHours);
                        }}
                        disabled={openingHours[index]?.closed}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                      />
                      <span className="text-black">to</span>
                      <input
                        type="time"
                        value={openingHours[index]?.close_time || ''}
                        onChange={(e) => {
                          const newHours = [...openingHours];
                          if (!newHours[index]) newHours[index] = {};
                          newHours[index] = { ...newHours[index], close_time: e.target.value };
                          setOpeningHours(newHours);
                        }}
                        disabled={openingHours[index]?.closed}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={openingHours[index]?.closed || false}
                          onChange={(e) => {
                            const newHours = [...openingHours];
                            if (!newHours[index]) newHours[index] = {};
                            newHours[index] = { ...newHours[index], closed: e.target.checked };
                            setOpeningHours(newHours);
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-black">Closed</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button 
                    onClick={updateOpeningHours} 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Update Opening Hours</span>
                  </button>
                </div>
              </div>

              {siteInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Current Site Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-black"><strong>Name:</strong> {siteInfo.name}</p>
                      <p className="text-black"><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          siteInfo.status === 'open' ? 'bg-green-100 text-green-800' :
                          siteInfo.status === 'closed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {siteInfo.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-black"><strong>Workload Mode:</strong> {siteInfo.workload_mode || 'Normal'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 