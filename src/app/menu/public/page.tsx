'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
}

export default function PublicMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  


  useEffect(() => {
    // Mock menu data - in real app, this would come from API
    setMenuItems([
      {
        id: '1',
        name: 'Spring Rolls',
        description: 'Fresh vegetables wrapped in rice paper',
        price: 8.99,
        category: 'Appetizers',
      },
      {
        id: '2',
        name: 'Chicken Wings',
        description: 'Crispy wings with your choice of sauce',
        price: 12.99,
        category: 'Appetizers',
      },
      {
        id: '3',
        name: 'Grilled Salmon',
        description: 'Fresh salmon with seasonal vegetables',
        price: 24.99,
        category: 'Main Courses',
      },
      {
        id: '4',
        name: 'Beef Stir Fry',
        description: 'Tender beef with mixed vegetables',
        price: 18.99,
        category: 'Main Courses',
      },
      {
        id: '5',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 9.99,
        category: 'Desserts',
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-black">Restaurant Name</h1>
              <p className="text-sm text-black">Fresh & Delicious Food</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-black mt-1">{item.description}</p>
                  )}
                  <p className="text-sm text-black mt-2">{item.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-black">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {cart[item.id] ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {cart[item.id]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(item.id)}
                        className="w-8 h-8 p-0"
                      >
                        +
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToCart(item.id)}
                      className="flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
                      ))}
          </div>
        </main>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-black">
                {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
              </p>
              <p className="text-lg font-bold text-black">
                Total: ${cartTotal.toFixed(2)}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Place Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 