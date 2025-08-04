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
  const [showTableSelector, setShowTableSelector] = useState(false);

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

  const filteredItems = selectedCategory === 'all' 
    ? menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && item.isActive;
      })
    : menuItems.filter(item => {
        const matchesCategory = item.category === selectedCategory;
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

    setCart((prev: CartItem[]) =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev: CartItem[]) => prev.filter(item => item.menuItem.id !== itemId));
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart((prev: CartItem[]) =>
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
      alert('Please select a table first');
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
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Search and Table Selection */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowTableSelector(true)}
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors text-gray-700 border border-gray-300 whitespace-nowrap"
            >
              {selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-base text-black"
              />
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex px-6 py-4 gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 border-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 border-2 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Menu Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-black"
              >
                <div className="w-full h-32 bg-gradient-to-br from-black to-gray-800 rounded-lg mb-3 flex items-center justify-center text-white text-4xl">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <div className="font-semibold text-base mb-2 text-black">{item.name}</div>
                <div className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</div>
                <div className="text-lg font-bold text-black">${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Order Summary */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="text-xl font-bold text-black mb-2">Current Order</div>
          <div className="text-sm text-gray-600">
            {selectedTable ? `Table ${selectedTable.number}` : 'No table selected'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🛒</div>
              <p>No items in order yet.<br />Click menu items to add them.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
                              {cart.map(item => (
                  <div key={item.menuItem.id} className="py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-black font-medium text-sm">{item.menuItem.name}</h4>
                        <p className="text-gray-600 text-xs">{item.menuItem.price.toFixed(2)} each</p>
                      </div>
                      <div className="font-bold text-black text-right">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-200 bg-white rounded-md flex items-center justify-center font-bold text-black hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-6 text-center font-semibold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-200 bg-white rounded-md flex items-center justify-center font-bold text-black hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <input
                      placeholder="Add special instructions..."
                      value={item.notes}
                      onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-black"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between mb-2 text-black">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-black">
              <span>Tax (8.5%):</span>
              <span>${(getCartTotal() * 0.085).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-black pt-2 border-t border-gray-200 mt-2">
              <span>Total:</span>
              <span>${(getCartTotal() * 1.085).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        <div className="px-6 py-6">
          <button
            onClick={submitOrder}
            disabled={submitting || !selectedTable || cart.length === 0}
            className="w-full px-6 py-4 bg-black text-white font-semibold rounded-lg border-2 border-black hover:bg-gray-800 hover:border-gray-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sending Order...' : 'Send Order'}
          </button>
        </div>
      </div>
      
      {/* Table Selection Modal */}
      {showTableSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Select Table</h2>
              <button
                onClick={() => setShowTableSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    setShowTableSelector(false);
                  }}
                  className={`p-4 rounded-lg border-2 transition-colors text-center ${
                    selectedTable?.id === table.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-300 text-black'
                  }`}
                >
                  <div className="font-semibold">Table {table.number}</div>
                  <div className="text-sm opacity-75">{table.capacity} seats</div>
                  {table.location && (
                    <div className="text-xs opacity-60">{table.location}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 