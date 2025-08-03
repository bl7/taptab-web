'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2,
  ShoppingCart,
  MapPin
} from 'lucide-react';
import { api } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.isActive;
  });

  const addToCart = (item: MenuItem) => {
    if (!selectedTable) {
      alert('Please select a table first');
      return;
    }

    setCart((prev: CartItem[]) => {
      const existingItem = prev.find(cartItem => cartItem.menuItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { menuItem: item, quantity: 1, notes: '' }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, notes }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        tableId: selectedTable.id,
        customerName: 'Walk-in Customer',
        customerPhone: '',
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        specialInstructions: '',
        orderSource: 'WAITER'
      };

      await api.createOrder(orderData);
      alert('Order placed successfully!');
      
      // Clear cart and reset
      setCart([]);
      setSelectedTable(null);
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu and tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Take Orders</h1>
        <p className="text-gray-600 mt-1">Create new orders for customers</p>
      </div>

      {/* Table Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Table</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`p-4 rounded-xl border-2 transition-colors ${
                selectedTable?.id === table.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">Table {table.number}</div>
                <div className="text-sm text-gray-500">{table.capacity} seats</div>
                {table.location && (
                  <div className="text-xs text-gray-400">{table.location}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-green-600">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!selectedTable}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.image && (
                    <div className="ml-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Order Cart</h2>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>

          {selectedTable && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Table {selectedTable.number}
                </span>
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No items in cart</p>
              {!selectedTable && (
                <p className="text-sm text-gray-400 mt-2">Select a table first</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.menuItem.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">${item.menuItem.price.toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <textarea
                    placeholder="Add special instructions..."
                    value={item.notes}
                    onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <button
                  onClick={submitOrder}
                  disabled={submitting || !selectedTable || cart.length === 0}
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 