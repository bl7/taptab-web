'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
import { useOrders } from '@/lib/use-orders';
import { api } from '@/lib/api';
import { Table } from '@/lib/api';
import TableOrdersView from '@/components/orders/TableOrdersView';

export default function OrdersPage() {
  const { orders, loading, error, refreshOrders } = useOrders();

  // State for tables and table view
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableOrders, setShowTableOrders] = useState(false);

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        setTablesLoading(true);
        const response = await api.getTables();
        setTables(response.tables);
      } catch (error) {
        console.error('Failed to load tables:', error);
      } finally {
        setTablesLoading(false);
      }
    };

    loadTables();
  }, []);

  // Get orders for a specific table
  const getTableOrders = useCallback((tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    const tableNumber = table?.number;
    
    return orders.filter(order => {
      const matchesById = order.tableId === tableId;
      const matchesByNumber = order.tableNumber === tableNumber;
      const matchesByTableNumber = order.tableNumber === tableId;
      const matchesByTableNumberString = order.tableNumber === tableNumber?.toString();
      
      const isMatch = matchesById || matchesByNumber || matchesByTableNumber || matchesByTableNumberString;
      const isActive = order.status === 'active';
      
      return isMatch && isActive;
    });
  }, [tables, orders]);

  // Get table status based on orders
  const getTableStatus = useCallback((table: Table) => {
    const tableOrders = getTableOrders(table.id);
    if (tableOrders.length > 0) {
      return 'occupied';
    }
    return table.status;
  }, [getTableOrders]);

  // Get table revenue
  const getTableRevenue = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.reduce((sum, order) => {
      const orderTotal = order.totalAmount || order.finalAmount || order.total || 
        order.items.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
      return sum + orderTotal;
    }, 0);
  };

  // Get table order count
  const getTableOrderCount = (tableId: string) => {
    return getTableOrders(tableId).length;
  };

  // Get table wait time (average of all orders)
  const getTableWaitTime = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    if (tableOrders.length === 0) return 0;
    
    const totalWaitTime = tableOrders.reduce((sum, order) => {
      const waitTime = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
      return sum + waitTime;
    }, 0);
    
    return Math.round(totalWaitTime / tableOrders.length);
  };

  // Check if table has urgent orders
  const isTableUrgent = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.some(order => {
      const waitTime = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
      return waitTime > 20;
    });
  };

  // Group tables by location
  const groupedTables = useMemo(() => {
    const groups: { [key: string]: Table[] } = {};
    
    tables.forEach(table => {
      const location = table.location || 'Main Area';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(table);
    });
    
    return groups;
  }, [tables]);

  // Get table status color
  const getTableStatusColor = (table: Table) => {
    const status = getTableStatus(table);
    const isUrgent = isTableUrgent(table.id);
    
    if (isUrgent) return 'bg-red-500';
    if (status === 'occupied') return 'bg-orange-500';
    if (status === 'reserved') return 'bg-purple-500';
    return 'bg-green-500';
  };

  // Get table shape based on capacity
  const getTableShape = (capacity: number) => {
    if (capacity <= 2) return 'rounded-full'; // Circle for 2-seater
    if (capacity <= 4) return 'rounded-lg'; // Square for 4-seater
    return 'rounded-lg'; // Rectangle for larger tables
  };


  // Handle table click
  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableOrders(true);
  };

  // Handle order status change
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      // Update order status in the backend
      await api.updateOrderStatus(orderId, status as "active" | "paid" | "cancelled");
        await refreshOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (loading || tablesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-900 text-lg">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-red-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshOrders}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If showing table orders, render the table orders view
  if (showTableOrders && selectedTable) {
    const tableOrders = getTableOrders(selectedTable.id);
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <TableOrdersView
          table={selectedTable}
          orders={tableOrders}
          onBack={() => {
            setShowTableOrders(false);
            setSelectedTable(null);
          }}
          onRefresh={refreshOrders}
          onStatusChange={handleOrderStatusChange}
        />
      </div>
    );
  }

  // Main tables view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
    
            <p className="text-gray-600 mt-1 text-sm">Manage tables and track order progress</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Compact Status Legend */}
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Urgent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Reserved</span>
                </div>
              </div>
            </div>
            <button
              onClick={refreshOrders}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Tables Grid */}
        {tables.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tables Found</h3>
            <p className="text-gray-600">No tables have been configured yet.</p>
          </div>
        ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(groupedTables).map(([location, locationTables]) => (
                <div key={location} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{location}</h3>
                    <p className="text-gray-600 text-sm">{locationTables.length} table{locationTables.length !== 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Location-specific layout */}
                  <div className="relative min-h-[200px] bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-3">
                      {locationTables.map((table) => {
                        const orderCount = getTableOrderCount(table.id);
                        const revenue = getTableRevenue(table.id);
                        const waitTime = getTableWaitTime(table.id);
                        const statusColor = getTableStatusColor(table);
                        const tableShape = getTableShape(table.capacity);
                        
                        return (
                          <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`${statusColor} ${tableShape} text-white cursor-pointer transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg min-w-[80px] min-h-[80px] flex flex-col items-center justify-center p-3 relative group`}
                          >
                            {/* Table Number */}
                            <div className="text-center">
                              <div className="font-bold text-lg">{table.number}</div>
                              <div className="text-xs opacity-90">{table.capacity}p</div>
                            </div>
                            
                            {/* Order Info Overlay */}
                            {orderCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                                {orderCount}
                              </div>
                            )}
                            
                            {/* Revenue Badge */}
                            {revenue > 0 && (
                              <div className="absolute -bottom-1 -left-1 bg-white text-gray-900 rounded-full px-2 py-1 text-xs font-bold shadow-md">
                                ${revenue.toFixed(0)}
                              </div>
                            )}
                            
                            {/* Urgent Indicator */}
                            {isTableUrgent(table.id) && (
                              <div className="absolute inset-0 border-2 border-white border-dashed animate-pulse rounded-full"></div>
                            )}
                            
                            {/* Hover Info */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              <div>Wait: {waitTime}min</div>
                              <div>Orders: {orderCount}</div>
                              <div>Revenue: ${revenue.toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}
 