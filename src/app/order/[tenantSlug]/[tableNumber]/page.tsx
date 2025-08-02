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
  AlertCircle,
  Clock
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  image?: string;
  isActive: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface OrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  total: number;
  items: CartItem[];
}

export default function QROrderPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const tableNumber = (params.tableNumber as string).replace(/\s+/g, '-'); // Remove spaces, replace with hyphens

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  // Load menu data
  const loadMenuData = useCallback(async () => {
    console.log('🔄 Loading menu data for:', tenantSlug);
    setLoading(true);
    setError('');

    try {
      // Fetch menu items and categories using public API
      const [menuResponse, categoriesResponse, tablesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/menu/items?tenant=${tenantSlug}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/menu/categories?tenant=${tenantSlug}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/tables?tenant=${tenantSlug}`)
      ]);

      if (!menuResponse.ok) {
        throw new Error(`Failed to load menu items: ${menuResponse.status}`);
      }
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
      }

      const menuData = await menuResponse.json();
      const categoriesData = await categoriesResponse.json();
      const tablesData = await tablesResponse.json();

      console.log('✅ Menu data loaded:', menuData);
      console.log('✅ Categories loaded:', categoriesData);
      console.log('✅ Tables loaded:', tablesData);

      setMenuItems(menuData.data?.items || []);
      setCategories(categoriesData.data?.categories || []);
      
      // Extract table numbers for reference
      const tableNumbers = (tablesData.data?.tables || []).map((table: { number: string }) => table.number);
      setAvailableTables(tableNumbers);
      
      console.log('📋 Available tables:', tableNumbers);
    } catch (error) {
      console.error('❌ Error loading menu:', error);
      setError(error instanceof Error ? error.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Cart management functions
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

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0) return;
    
    setOrderLoading(true);
    setError('');

    try {
      const orderData = {
        tableNumber: tableNumber, // Keep as string, don't parseInt
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        customerName: "Walk-in Customer",
        customerPhone: ""
      };

      console.log('📦 Submitting order:', orderData);
      console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`);
      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response status text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        
        // Try to parse the error response as JSON
        let errorMessage = `Order submission failed: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use the raw error text
          errorMessage = errorText || `Order submission failed: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const orderResult = await response.json();
      console.log('✅ Order submitted:', orderResult);

      setOrderStatus({
        orderId: orderResult.data?.orderId || 'unknown',
        status: 'pending',
        total: getCartTotal(),
        items: [...cart]
      });

      setCart([]);
    } catch (error) {
      console.error('❌ Error submitting order:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit order');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-black">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-black mb-2">Error Loading Menu</h1>
        <p className="text-black mb-6">{error}</p>
          
          {error.includes('Table not found') && availableTables.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-black mb-2">Available tables for this restaurant:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableTables.map((tableNum) => (
                  <a
                    key={tableNum}
                    href={`/order/${tenantSlug}/${tableNum}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                  >
                    {tableNum}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={loadMenuData}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Order confirmation state
  if (orderStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-black mb-2">Order Placed!</h1>
        <p className="text-black">Your order has been successfully submitted.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Order ID:</span>
              <span className="font-mono text-sm">{orderStatus.orderId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Table:</span>
              <span className="font-medium">{tableNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-black">Total:</span>
              <span className="font-bold">${orderStatus.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black">Status:</span>
              <span className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {orderStatus.status}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-black">Order Items:</h3>
            {orderStatus.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.menuItem.name} x{item.quantity}</span>
                <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
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
              <h1 className="text-xl font-bold text-black">
                {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
              </h1>
              <p className="text-sm text-black">Table {tableNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-black" />
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
                      <h3 className="font-semibold text-black">{item.name}</h3>
                      <span className="text-lg font-bold text-black">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-black mb-3">{item.description}</p>
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
                <p className="text-black">No items found in this category.</p>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Your Order</h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-black mx-auto mb-4" />
                    <p className="text-black">Your cart is empty</p>
                    <p className="text-sm text-black mt-1">Add items to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.menuItem.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-black">{item.menuItem.name}</h3>
                            <p className="text-sm text-black">${item.menuItem.price.toFixed(2)} each</p>
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
                        <span className="text-lg font-semibold text-black">Total</span>
                        <span className="text-lg font-bold text-black">
                          ${getCartTotal().toFixed(2)}
                        </span>
                      </div>
                      
                      <button
                        onClick={submitOrder}
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