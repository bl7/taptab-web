'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api, MenuItem, MenuCategory } from '@/lib/api';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function PublicOrderPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const tableNumber = parseInt(params.tableNumber as string);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  const fetchMenuData = useCallback(async () => {
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        api.getMenuItems(),
        api.getMenuCategories()
      ]);
      
      setMenuItems(menuResponse.items);
      setCategories(categoriesResponse.categories);
      
      // Mock tenant info - in real app, this would come from API
      setTenantInfo({
        id: 'tenant-1',
        name: 'Restaurant Name',
        slug: tenantSlug,
        logo: '',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2'
      });
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setOrderError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prev.map(item => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { menuItem, quantity: 1, notes: '' }];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.menuItem.id === menuItemId 
        ? { ...item, quantity }
        : item
    ));
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(prev => prev.map(item => 
      item.menuItem.id === menuItemId 
        ? { ...item, notes }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setOrderLoading(true);
    setOrderError('');
    
    try {
      // Find the table ID based on table number
      const tablesResponse = await api.getTables();
      const table = tablesResponse.tables.find(t => t.number === tableNumber);
      
      if (!table) {
        throw new Error('Table not found');
      }

      const orderData = {
        tableId: table.id,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      };

      await api.createOrder(orderData);
      setOrderSuccess(true);
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been successfully placed. We&apos;ll bring it to your table shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Table {tableNumber}</strong>
            </p>
            <p className="text-sm text-gray-600">
              {tenantInfo?.name}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {tenantInfo?.name || 'Restaurant'}
              </h1>
              <p className="text-sm text-gray-600">Table {tableNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 mx-4 mt-4 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-600 text-sm">{orderError}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Items
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {item.image && (
                    <div className="h-48 bg-gray-100">
                                             <Image
                         src={item.image}
                         alt={item.name}
                         width={400}
                         height={192}
                         className="w-full h-full object-cover"
                       />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No items found in this category.</p>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.menuItem.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
                            <p className="text-sm text-gray-600">${item.menuItem.price.toFixed(2)} each</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="text-gray-400 hover:text-red-600 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <textarea
                          placeholder="Special instructions (optional)"
                          value={item.notes}
                          onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${getCartTotal().toFixed(2)}
                        </span>
                      </div>
                      
                      <button
                        onClick={handlePlaceOrder}
                        disabled={orderLoading}
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {orderLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 