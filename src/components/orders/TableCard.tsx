'use client';

import React from 'react';
import { Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Table } from '@/lib/api';

interface TableCardProps {
  table: Table;
  orderCount: number;
  revenue: number;
  waitTime: number;
  isUrgent: boolean;
  onClick: (table: Table) => void;
}

export default function TableCard({ 
  table, 
  orderCount, 
  revenue, 
  waitTime, 
  isUrgent, 
  onClick 
}: TableCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return isUrgent 
          ? 'bg-red-500 border-red-400 shadow-red-200' 
          : 'bg-orange-500 border-orange-400 shadow-orange-200';
      case 'available':
        return 'bg-green-500 border-green-400 shadow-green-200';
      case 'reserved':
        return 'bg-purple-500 border-purple-400 shadow-purple-200';
      case 'cleaning':
        return 'bg-blue-500 border-blue-400 shadow-blue-200';
      default:
        return 'bg-gray-500 border-gray-400 shadow-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return isUrgent ? 'URGENT' : 'Occupied';
      case 'available':
        return 'Free';
      case 'reserved':
        return 'Reserved';
      case 'cleaning':
        return 'Cleaning';
      default:
        return 'Unknown';
    }
  };

  const statusColor = getStatusColor(table.status);
  const statusText = getStatusText(table.status);

  return (
    <div
      onClick={() => onClick(table)}
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${statusColor} shadow-lg border-2 rounded-2xl min-h-[8rem] min-w-[8rem] flex flex-col items-center justify-center p-4 text-white`}
    >
      {/* Urgent Indicator */}
      {isUrgent && (
        <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Table Number - BIG and BOLD */}
      <div className="text-center mb-2">
        <span className="text-3xl font-bold">Table {table.number}</span>
      </div>

      {/* Status Badge */}
      <div className="text-center mb-3">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm">
          {statusText}
        </span>
      </div>

      {/* Capacity */}
      <div className="absolute top-2 left-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-xs font-bold">{table.capacity}</span>
        </div>
      </div>

      {/* Order Info for Occupied Tables */}
      {table.status === 'occupied' && (
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-1">
            <Users className="h-4 w-4 text-white/80" />
            <span className="text-sm font-semibold">{orderCount} order{orderCount !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-1">
            <DollarSign className="h-4 w-4 text-white/80" />
            <span className="text-sm font-semibold">${revenue.toFixed(0)}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-1">
            <Clock className="h-4 w-4 text-white/80" />
            <span className="text-sm font-semibold">{waitTime}m wait</span>
          </div>
        </div>
      )}

      {/* Pulse effect for urgent tables */}
      {isUrgent && (
        <div className="absolute inset-0 bg-red-400 animate-pulse opacity-30 rounded-2xl"></div>
      )}

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
        <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 whitespace-nowrap shadow-2xl border border-gray-700">
          <div className="font-bold mb-1">Table {table.number}</div>
          <div className="text-gray-300 mb-2">{table.capacity} seats</div>
          {table.status === 'occupied' && (
            <>
              <div className="text-green-400 font-semibold">${revenue.toFixed(2)} revenue</div>
              <div className="text-red-400 font-semibold">{orderCount} order{orderCount !== 1 ? 's' : ''}</div>
              <div className="text-yellow-400 font-semibold">{waitTime} min wait</div>
            </>
          )}
          {table.location && <div className="text-gray-400 text-xs mt-1">{table.location}</div>}
        </div>
        <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
      </div>
    </div>
  );
} 