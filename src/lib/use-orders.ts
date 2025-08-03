import { useState, useEffect, useCallback } from 'react';
import { OrdersApi, Order, CreateOrderRequest, UpdateOrderRequest, OrderStatus } from './orders-api';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  updateOrder: (id: string, data: UpdateOrderRequest) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  getOrder: (id: string) => Promise<Order>;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching orders from authenticated API...');
      const response = await OrdersApi.getOrders();
      console.log('✅ Orders API response:', response);
      
      if (response.success) {
        console.log('📋 Orders received:', response.data.orders.length);
        setOrders(response.data.orders);
      } else {
        console.error('❌ Orders API returned success: false');
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders from authenticated API:', err);
      
      // Try public API as fallback
      try {
        console.log('🔄 Trying public API as fallback...');
        // For now, we'll need to get the tenant slug from somewhere
        // This is a temporary solution - you might want to store tenant info in localStorage
        const tenantSlug = localStorage.getItem('tenantSlug') || 'default';
        const publicResponse = await OrdersApi.getOrdersFromPublicAPI(tenantSlug);
        
        if (publicResponse.success) {
          console.log('✅ Public API response:', publicResponse);
          console.log('📋 Orders received from public API:', publicResponse.data.orders.length);
          setOrders(publicResponse.data.orders);
        } else {
          throw new Error('Public API also failed');
        }
      } catch (publicErr) {
        console.error('❌ Public API also failed:', publicErr);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders from both APIs');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: CreateOrderRequest): Promise<Order> => {
    try {
      const response = await OrdersApi.createOrder(orderData);
      if (response.success) {
        const newOrder = response.data.order;
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }, []);

  const updateOrder = useCallback(async (orderId: string, _updateData: UpdateOrderRequest): Promise<Order> => {
    try {
      const response = await OrdersApi.updateOrder();
      if (response.success) {
        const updatedOrder = response.data.order;
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        return updatedOrder;
      } else {
        throw new Error('Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus): Promise<Order> => {
    return updateOrder(orderId, { status });
  }, [updateOrder]);

  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    try {
      await OrdersApi.cancelOrder(orderId, 'Admin deletion');
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  }, []);

  const getOrder = useCallback(async (_orderId: string): Promise<Order> => {
    try {
      const response = await OrdersApi.getOrder();
      if (response.success) {
        return response.data.order;
      } else {
        throw new Error('Failed to get order');
      }
    } catch (err) {
      console.error('Error getting order:', err);
      throw err;
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    refreshOrders,
    getOrder,
  };
}; 