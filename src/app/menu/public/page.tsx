'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Share2, Plus, Minus, Search, ArrowLeft, User } from 'lucide-react';
import Image from 'next/image';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  rating?: number;
  prepTime?: string;
  isPopular?: boolean;
}

export default function PublicMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // Mock menu data - in real app, this would come from API
    setMenuItems([
      {
        id: '1',
        name: 'Spring Rolls',
        description: 'Fresh vegetables wrapped in rice paper with sweet chili sauce',
        price: 8.99,
        category: 'Appetizers',
        rating: 4.5,
        prepTime: '10-15 min',
        isPopular: true,
      },
      {
        id: '2',
        name: 'Chicken Wings',
        description: 'Crispy wings with your choice of sauce - Buffalo, BBQ, or Honey Mustard',
        price: 12.99,
        category: 'Appetizers',
        rating: 4.7,
        prepTime: '15-20 min',
        isPopular: true,
      },
      {
        id: '3',
        name: 'Grilled Salmon',
        description: 'Fresh salmon with seasonal vegetables and lemon butter sauce',
        price: 24.99,
        category: 'Main Courses',
        rating: 4.8,
        prepTime: '20-25 min',
        isPopular: false,
      },
      {
        id: '4',
        name: 'Beef Stir Fry',
        description: 'Tender beef with mixed vegetables in savory sauce',
        price: 18.99,
        category: 'Main Courses',
        rating: 4.6,
        prepTime: '15-20 min',
        isPopular: false,
      },
      {
        id: '5',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream and chocolate sauce',
        price: 9.99,
        category: 'Desserts',
        rating: 4.9,
        prepTime: '5-10 min',
        isPopular: true,
      },
      {
        id: '6',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese and croutons',
        price: 11.99,
        category: 'Appetizers',
        rating: 4.3,
        prepTime: '8-12 min',
        isPopular: false,
      },
      {
        id: '7',
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
        price: 16.99,
        category: 'Main Courses',
        rating: 4.4,
        prepTime: '18-22 min',
        isPopular: false,
      },
      {
        id: '8',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        price: 8.99,
        category: 'Desserts',
        rating: 4.7,
        prepTime: '5-8 min',
        isPopular: false,
      },
    ]);
  }, []);

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = menuItems.find(item => item.id === itemId);
    return total + (item?.price || 0) * quantity;
  }, 0);

  const cartItemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-black">Restaurant Name</h1>
              <p className="text-xs text-gray-600">Fresh & Delicious Food</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="p-2">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Heart className="h-4 w-4" />
              </Button>
              <Button 
                className="relative p-2" 
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Greeting Section */}
      <div className="bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">Hello, Guest</h2>
              <p className="text-gray-600">What would you like to eat today?</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
                  selectedCategory === category
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category === 'all' ? '🍽️' : '🍽️'}</span>
                <span>{category === 'all' ? 'All Items' : category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => addToCart(item.id)}
            >
              {/* Image Section */}
              <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl">🍽️</div>
                )}
                {item.isPopular && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-black text-sm mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-black">
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item.id);
                    }}
                    className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">
                  {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
                </p>
                <p className="text-lg font-bold text-black">
                  Total: ${cartTotal.toFixed(2)}
                </p>
              </div>
              <Button className="bg-black hover:bg-gray-800 px-6 py-3 rounded-xl">
                Place Order
              </Button>
            </div>
            
            {/* Cart Items Preview */}
            <div className="max-h-32 overflow-y-auto">
              {Object.entries(cart).map(([itemId, quantity]) => {
                const item = menuItems.find(item => item.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                        {quantity}
                      </div>
                      <span className="text-sm font-medium text-black">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">${(item.price * quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center p-2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-400">
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">Favorites</span>
            </button>
            <button className="flex flex-col items-center p-2 text-black">
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs mt-1">Cart</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs mt-1">Chat</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-400">
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 