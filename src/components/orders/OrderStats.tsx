'use client';

import React from 'react';
import { Clock, Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface OrderStatsProps {
  totalTables: number;
  occupiedTables: number;
  activeOrders: number;
  totalRevenue: number;
  urgentOrders: number;
  averageWaitTime: number;
}

export default function OrderStats({ 
  totalTables, 
  occupiedTables, 
  activeOrders, 
  totalRevenue, 
  urgentOrders,
  averageWaitTime 
}: OrderStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Urgent Orders - Most Important */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Need Attention</p>
            <p className="text-2xl font-bold text-red-700">{urgentOrders}</p>
          </div>
          <div className="p-2 rounded-lg bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Active Orders</p>
            <p className="text-2xl font-bold text-blue-700">{activeOrders}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Occupied Tables */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Tables Occupied</p>
            <p className="text-2xl font-bold text-orange-700">{occupiedTables}/{totalTables}</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-100">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Today&apos;s Revenue</p>
            <p className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(0)}</p>
          </div>
          <div className="p-2 rounded-lg bg-green-100">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Average Wait Time */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Avg Wait Time</p>
            <p className="text-2xl font-bold text-purple-700">{averageWaitTime}m</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-100">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Available Tables */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-gray-700">{totalTables - occupiedTables}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-100">
            <CheckCircle className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
} 