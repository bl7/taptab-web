'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText
} from 'lucide-react';
import { api, MenuItem, MenuCategory } from '@/lib/api';
import { ImageUpload } from '@/components/ImageUpload';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [apiLoading, setApiLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authorized to access menu management
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Only TENANT_ADMIN and MANAGER can access menu management
        if (user.role !== 'TENANT_ADMIN' && user.role !== 'MANAGER') {
          router.push('/dashboard');
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        router.push('/login');
        return;
      }
    } else {
      router.push('/login');
      return;
    }
  }, [router]);

  const fetchMenuData = useCallback(async () => {
    console.log('🍽️ Starting to fetch menu data...');
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        api.getMenuItems(),
        api.getMenuCategories()
      ]);
      
      console.log('🍽️ Menu items response from API:', menuResponse);
      console.log('🍽️ Number of menu items:', menuResponse.items?.length || 0);
      console.log('🍽️ Menu items array:', menuResponse.items);
      if (menuResponse.items && menuResponse.items.length > 0) {
        console.log('🍽️ First menu item in response:', menuResponse.items[0]);
      }
      
      console.log('📂 Categories response from API:', categoriesResponse);
      console.log('📂 Number of categories:', categoriesResponse.categories?.length || 0);
      console.log('📂 Categories array:', categoriesResponse.categories);
      if (categoriesResponse.categories && categoriesResponse.categories.length > 0) {
        console.log('📂 First category in response:', categoriesResponse.categories[0]);
      }
      
      setMenuItems(menuResponse.items);
      setCategories(categoriesResponse.categories);
    } catch (error) {
      console.error('❌ Error fetching menu data:', error);
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  const handleCreateItem = async (itemData: {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    image?: string;
  }) => {
    console.log('🍽️ handleCreateItem called with data:', itemData);
    console.log('🍽️ Image URL in itemData:', itemData.image);
    
    setApiLoading(true);
    try {
      const response = await api.createMenuItem(itemData);
      console.log('🍽️ API response:', response);
      setMenuItems(prev => [response.item, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert(error instanceof Error ? error.message : 'Failed to create menu item');
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateItem = async (id: string, itemData: Partial<MenuItem>) => {
    console.log('checkthis', '📤 Sending to API:', itemData);
    console.log('checkthis', '🔍 === UPDATE ITEM DEBUG ===');
    console.log('checkthis', '1. Item ID:', id);
    console.log('checkthis', '2. Item data:', itemData);
    console.log('checkthis', '3. Image field:', itemData.image);
    console.log('checkthis', '4. Image field type:', typeof itemData.image);
    console.log('checkthis', '5. Image field length:', itemData.image?.length || 0);
    console.log('checkthis', '================================');
    
    setApiLoading(true);
    try {
      const response = await api.updateMenuItem(id, itemData);
      console.log('checkthis', '✅ API Response:', response);
      setMenuItems(prev => prev.map(item => 
        item.id === id ? response.item : item
      ));
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('❌ Error updating menu item:', error);
      alert(error instanceof Error ? error.message : 'Failed to update menu item');
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    setApiLoading(true);
    try {
      await api.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete menu item');
    } finally {
      setApiLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    sortOrder?: number;
  }) => {
    setApiLoading(true);
    try {
      const response = await api.createMenuCategory(categoryData);
      setCategories(prev => [response.category, ...prev]);
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setApiLoading(false);
    }
  };

  // Filter and search menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || item.categoryId === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              
        <p className="text-sm text-black mt-1">
                Manage your restaurant menu items and categories
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                disabled={apiLoading}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                Add Category
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={apiLoading}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
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
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-black mx-auto mb-4" />
              <p className="text-black">No menu items found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {item.image && (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!item.image && (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-black" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-black text-lg">{item.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowEditModal(true);
                        }}
                        disabled={apiLoading}
                        className="p-1 text-black hover:text-gray-600 disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={apiLoading}
                        className="p-1 text-black hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-black text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-black">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                      {categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateItem}
          loading={apiLoading}
        />
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          categories={categories}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={(data) => handleUpdateItem(selectedItem.id, data)}
          loading={apiLoading}
        />
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <AddCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSubmit={handleCreateCategory}
          loading={apiLoading}
        />
      )}
    </div>
  );
}

// Add Item Modal Component
function AddItemModal({ 
  categories, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  categories: MenuCategory[];
  onClose: () => void; 
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    image?: string;
  }) => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    console.log('🍽️ Current formData state:', formData);
    console.log('🍽️ formData.image value:', formData.image);
    console.log('🍽️ formData.image type:', typeof formData.image);
    console.log('🍽️ formData.image length:', formData.image?.length);
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
    };
    
    console.log('🍽️ AddItemModal handleSubmit called with data:', submitData);
    console.log('🍽️ Image URL in formData:', formData.image);
    console.log('🍽️ Image URL in submitData:', submitData.image);
    
    onSubmit(submitData);
  };

  const handleImageChange = (url: string) => {
    console.log('checkthis', '✅ Image uploaded successfully! URL:', url);
    setFormData({ ...formData, image: url });
    setUploadError(null);
    
    // Debug check
    console.log('checkthis', '🔍 === IMAGE UPLOAD DEBUG ===');
    console.log('checkthis', '1. Current formData:', formData);
    console.log('checkthis', '2. Image URL received:', url);
    console.log('checkthis', '3. Upload error:', uploadError);
    console.log('checkthis', '================================');
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <ImageUpload
            value={formData.image}
            onChange={handleImageChange}
            onError={handleImageError}
            disabled={loading}
          />

          {uploadError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {uploadError}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Item Modal Component
function EditItemModal({ 
  item, 
  categories, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  item: MenuItem;
  categories: MenuCategory[];
  onClose: () => void; 
  onSubmit: (data: Partial<MenuItem>) => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    categoryId: item.categoryId,
    image: item.image || '',
    isActive: item.isActive,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('checkthis', '🍽️ EditItemModal handleSubmit - formData:', formData);
    console.log('checkthis', '🍽️ EditItemModal handleSubmit - image URL:', formData.image);
    
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      image: formData.image, // Make sure image is included
      isActive: formData.isActive,
    });
  };

  const handleImageChange = (url: string) => {
    console.log('checkthis', '🍽️ EditItemModal handleImageChange called with URL:', url);
    console.log('checkthis', '🍽️ EditItemModal handleImageChange - previous formData:', formData);
    console.log('checkthis', '🍽️ EditItemModal handleImageChange - URL length:', url.length);
    console.log('checkthis', '🍽️ EditItemModal handleImageChange - URL is empty?', url === '');
    
    setFormData({ ...formData, image: url });
    setUploadError(null);
    setIsUploading(false); // Upload completed
    
    console.log('checkthis', '🍽️ EditItemModal handleImageChange - updated formData should have image:', url);
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
    setIsUploading(false);
  };

  const handleImageUploadStart = () => {
    setIsUploading(true);
    console.log('checkthis', '🍽️ EditItemModal - Upload started, disabling submit button');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <ImageUpload
            value={formData.image}
            onChange={handleImageChange}
            onError={handleImageError}
            onUploadStart={handleImageUploadStart}
            disabled={loading}
          />

          {uploadError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {uploadError}
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Updating...' : isUploading ? 'Uploading...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Category Modal Component
function AddCategoryModal({ onClose, onSubmit, loading }: { 
  onClose: () => void; 
  onSubmit: (data: {
    name: string;
    sortOrder?: number;
  }) => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 