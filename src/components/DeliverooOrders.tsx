'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Truck, Clock, CheckCircle, XCircle, AlertCircle, User, MapPin, DollarSign } from 'lucide-react';

interface DeliverooOrder {
  id: string;
  reference: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  total: {
    amount: number;
    currency: string;
  };
  estimated_delivery_time?: string;
  special_instructions?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  source: 'DELIVEROO';
}

export const DeliverooOrders = () => {
  const [orders, setOrders] = useState<DeliverooOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Deliveroo orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch('/api/v1/deliveroo/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('bossToken');
      const response = await fetch(`/api/v1/deliveroo/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh orders
        fetchOrders();
      } else {
        alert(`❌ Error: ${data.error?.message || 'Failed to update order status'}`);
      }
    } catch {
      alert('❌ Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'ready_for_pickup': return <Truck className="h-4 w-4" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-black">Deliveroo Orders</h2>
            </div>
            <button 
              onClick={fetchOrders} 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh Orders'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-6 bg-orange-50 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-black">Order #{order.reference}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="accepted">Accepted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-black"><strong>Customer:</strong> {order.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-black"><strong>Address:</strong> {order.customer.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-black">
                        <strong>Total:</strong> {order.total.currency} {order.total.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.estimated_delivery_time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-black">
                          <strong>Delivery Time:</strong> {new Date(order.estimated_delivery_time).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {order.special_instructions && (
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-black">
                          <strong>Special Instructions:</strong> {order.special_instructions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-black mb-3">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-black">{item.quantity}x {item.name}</span>
                          {item.notes && (
                            <span className="text-sm text-gray-600 italic">({item.notes})</span>
                          )}
                        </div>
                        <span className="text-black font-medium">
                          {order.total.currency} {item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Deliveroo Orders</h3>
              <p className="text-black opacity-75">No Deliveroo orders found at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 