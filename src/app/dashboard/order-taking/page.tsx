'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Heart,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  ShoppingCart,
  CheckCircle,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  isActive: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  location?: string;
  currentOrderId?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export default function OrderTakingPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const [menuResponse, categoriesResponse, tablesResponse] = await Promise.all([
          api.getMenuItems(),
          api.getMenuCategories(),
          api.getTables()
        ]);

        setMenuItems(menuResponse.items || []);
        setCategories(categoriesResponse.categories || []);
        setTables(tablesResponse.tables || []);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    
    setOrderLoading(true);
    try {
      const orderData = {
        tableId: selectedTable,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        orderSource: 'WAITER',
        customerName: "Walk-in Customer",
        customerPhone: "",
        specialInstructions: ""
      };

      console.log('📦 Submitting order data:', JSON.stringify(orderData, null, 2));
      await api.createOrder(orderData);
      setCart([]);
      setSelectedTable('');
      
      // Use setTimeout to delay the alert and prevent any potential race conditions
      setTimeout(() => {
        try {
          alert('Order placed successfully!');
        } catch (error) {
          console.warn('Alert failed:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Extract error message from the error object
      let errorMessage = 'Failed to place order. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from API error response
        const apiError = error as { message?: string; error?: { message?: string }; data?: { message?: string } };
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error?.message) {
          errorMessage = apiError.error.message;
        } else if (apiError.data?.message) {
          errorMessage = apiError.data.message;
        }
      }
      
      alert(`Order Error: ${errorMessage}`);
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Take Orders</h1>
              <p className="text-sm text-gray-600">Select table and add items to order</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Selector */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Table:</span>
              {selectedTable ? (
                <span className="px-3 py-1 bg-black text-white rounded-lg text-sm">
                  Table {tables.find(t => t.id === selectedTable)?.number || selectedTable}
                </span>
              ) : (
                <button
                  onClick={() => setShowTableSelector(!showTableSelector)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                >
                  Select Table
                </button>
              )}
            </div>
            
            {selectedTable && (
              <button
                onClick={() => setSelectedTable('')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change Table
              </button>
            )}
          </div>

          {/* Table Selector Dropdown */}
          {showTableSelector && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select a table:</h3>
              <div className="grid grid-cols-4 gap-2">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setShowTableSelector(false);
                    }}
                    className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Table {table.number}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filters */}
          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <span className="text-green-600 font-bold text-sm">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">5.0</span>
                    </div>
                                         <button
                       onClick={() => addToCart(item)}
                       disabled={!selectedTable}
                       className="bg-black text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Add to cart
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Order Management */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Order for Table {tables.find(t => t.id === selectedTable)?.number || selectedTable || '?'}</h2>
            <button
              onClick={clearCart}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Your cart is empty</p>
                <p className="text-gray-400 text-xs">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-gray-500 text-xs">Small Size</p>
                        <p className="text-green-600 font-semibold text-sm">
                          ${item.menuItem.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity.toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Notes Input */}
                    <div className="mt-2">
                      <textarea
                        placeholder="Add special instructions..."
                        value={item.notes}
                        onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-black">Total:</span>
                  <span className="font-bold text-black">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={submitOrder}
                disabled={orderLoading || !selectedTable}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          )}
        </div>
      </div>
    </div>
  );
} 