'use client';

import React, { useState, useMemo } from 'react';
import { Clock, User, MapPin, DollarSign, Eye, CheckCircle, XCircle, AlertCircle, Play, Truck, Trash2, Filter, Search, X } from 'lucide-react';
import { useOrders } from '@/lib/use-orders';
import { OrderStatus } from '@/lib/orders-api';

export default function OrdersPage() {
  const { 
    orders, 
    loading, 
    error, 
    updateOrderStatus, 
    deleteOrder, 
    refreshOrders 
  } = useOrders();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [tableFilter, setTableFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);

  // Debug: Log orders data
  console.log('📋 Orders data received:', orders);
  console.log('📋 Number of orders:', orders.length);
  if (orders.length > 0) {
    console.log('📋 First order sample:', orders[0]);
    console.log('📋 First order items:', orders[0].items);
  }

  // Filter orders based on search term, status, and table
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search term filter (order number, customer name, table number, order source)
      const searchMatch = !searchTerm || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderSource && order.orderSource.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.items.some(item => item.menuItemName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;

      // Table filter
      const tableMatch = !tableFilter || order.tableNumber.toLowerCase().includes(tableFilter.toLowerCase());

      return searchMatch && statusMatch && tableMatch;
    });
  }, [orders, searchTerm, statusFilter, tableFilter]);

  // Get unique table numbers for filter dropdown
  const uniqueTables = useMemo(() => {
    const tables = [...new Set(orders.map(order => order.tableNumber))];
    return tables.sort((a, b) => a.localeCompare(b));
  }, [orders]);

  // Get order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      preparing: orders.filter(o => o.status === 'PREPARING').length,
      ready: orders.filter(o => o.status === 'READY').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || 0), 0),
      // Order source statistics
      qrOrders: orders.filter(o => o.orderSource === 'QR_ORDERING').length,
      deliverooOrders: orders.filter(o => o.orderSource === 'DELIVEROO').length,
      internalOrders: orders.filter(o => o.orderSource === 'INTERNAL').length,
      waiterOrders: orders.filter(o => o.orderSource === 'WAITER_ORDERING').length,
      cashierOrders: orders.filter(o => o.orderSource === 'CASHIER_ORDERING').length,
      managerOrders: orders.filter(o => o.orderSource === 'MANAGER_ORDERING').length
    };
    return stats;
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-orange-100 text-orange-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PREPARING': return <Play className="h-4 w-4" />;
      case 'READY': return <CheckCircle className="h-4 w-4" />;
      case 'DELIVERED': return <Truck className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'PENDING': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'DELIVERED';
      default: return null;
    }
  };

  const getOrderSourceBadgeClass = (orderSource: string) => {
    const source = orderSource.toLowerCase().replace('_', '-');
    return `badge badge-${source}`;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    setDeletingOrder(orderId);
    try {
      await deleteOrder(orderId);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setDeletingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading orders...</p>
          <p className="text-sm text-black opacity-75 mt-2">Connecting to backend server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-black mb-2">Error Loading Orders</h1>
          
          {/* Show specific error message based on error type */}
          {error.includes('Database schema error') ? (
            <div className="mb-4">
              <p className="text-black mb-2">Database schema is missing required columns.</p>
              <p className="text-sm text-black opacity-75">This is a backend configuration issue that needs to be fixed by the development team.</p>
            </div>
          ) : error.includes('Database connection error') ? (
            <div className="mb-4">
              <p className="text-black mb-2">Unable to connect to the database.</p>
              <p className="text-sm text-black opacity-75">Please check if the backend server is running properly.</p>
            </div>
          ) : error.includes('Server error') ? (
            <div className="mb-4">
              <p className="text-black mb-2">Server encountered an internal error.</p>
              <p className="text-sm text-black opacity-75">Please try again later or contact support.</p>
            </div>
          ) : (
            <p className="text-black mb-4">{error}</p>
          )}
          
          <div className="space-y-2">
            <button
              onClick={refreshOrders}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
          
          {/* Debug information */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-semibold text-black mb-2">Debug Information:</p>
            <p className="text-xs text-black opacity-75">Error: {error}</p>
            <p className="text-xs text-black opacity-75">Time: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-black">Orders</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all restaurant orders
              </p>
            </div>
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Filters</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, tables, order source, or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Table Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Table Number
                  </label>
                  <select
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Tables</option>
                    {uniqueTables.map(table => (
                      <option key={table} value={table}>
                        Table {table}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTableFilter('');
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-black">{orderStats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-2xl font-bold text-yellow-800">{orderStats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-2xl font-bold text-orange-800">{orderStats.preparing}</div>
            <div className="text-sm text-orange-600">Preparing</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-800">{orderStats.ready}</div>
            <div className="text-sm text-green-600">Ready</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-800">{orderStats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-800">{orderStats.cancelled}</div>
            <div className="text-sm text-red-600">Cancelled</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-800">${orderStats.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-blue-600">Total Revenue</div>
          </div>
        </div>

        {/* Order Source Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-800">{orderStats.qrOrders}</div>
            <div className="text-sm text-green-600">QR Orders</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-2xl font-bold text-orange-800">{orderStats.deliverooOrders}</div>
            <div className="text-sm text-orange-600">Deliveroo Orders</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-800">{orderStats.internalOrders}</div>
            <div className="text-sm text-gray-600">Internal Orders</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-800">{orderStats.waiterOrders}</div>
            <div className="text-sm text-blue-600">Waiter Orders</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-black">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Table {order.tableNumber}
                        </div>
                        {order.customerName && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {order.customerName}
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {order.customerPhone}
                          </div>
                        )}
                        {order.orderSource && (
                          <div className="flex items-center">
                            <span className={getOrderSourceBadgeClass(order.orderSource)}>
                              {order.orderSource}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${(order.finalAmount || order.totalAmount || 0).toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                          disabled={updatingOrder === order.id}
                          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                        >
                          {updatingOrder === order.id ? 'Updating...' : `Mark ${getNextStatus(order.status)}`}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrder === order.id}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                      >
                        {deletingOrder === order.id ? (
                          'Deleting...'
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-black mb-3">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-black">
                                {item.menuItemName} x{item.quantity}
                              </span>
                              <span className="text-sm text-gray-600">
                                ${(item.price || 0).toFixed(2)} each
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-500 italic mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-medium text-black">
                            ${(item.total || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredOrders.length} of {orders.length} orders
                {(searchTerm || statusFilter !== 'all' || tableFilter) && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )}
              </span>
              <span>
                Filtered Revenue: ${filteredOrders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                Pending: {filteredOrders.filter(o => o.status === 'PENDING').length} | 
                Preparing: {filteredOrders.filter(o => o.status === 'PREPARING').length} | 
                Ready: {filteredOrders.filter(o => o.status === 'READY').length}
              </span>
              <span>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 