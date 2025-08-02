'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, QrCode, ArrowLeft } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export default function MenuPage() {
  const [showQR, setShowQR] = useState(false);
  const [menuData, setMenuData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/menu', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch menu');
        }

        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowQR(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <QrCode className="h-4 w-4" />
                <span>Generate QR Code</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Items</h2>
          <p className="text-gray-600 mb-6">Manage your menu items and categories</p>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          ) : menuData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No menu items found. Add your first item!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {menuData.map((category) => (
                <div key={category.id} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
                  <div className="space-y-4">
                    {category.menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                          <p className="text-sm text-gray-500">{category.name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-900">${Number(item.price).toFixed(2)}</span>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Generated</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <QrCode className="h-24 w-24 mx-auto mb-2" />
                    <p className="text-sm">QR Code Placeholder</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to view your public menu
              </p>
              <Button
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 