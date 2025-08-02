'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  QrCode
} from 'lucide-react';
import { api, Table } from '@/lib/api';
import TableQRCode from '@/components/TableQRCode';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authorized to access table management
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Only TENANT_ADMIN and MANAGER can access table management
        if (user.role !== 'TENANT_ADMIN' && user.role !== 'MANAGER') {
          router.push('/dashboard');
          return;
        }
        
        setTenantSlug(user.tenant?.slug || '');
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

  const fetchTables = useCallback(async () => {
    console.log('🔄 Starting to fetch tables...');
    try {
      const response = await api.getTables();
      console.log('📋 Tables response from API:', response);
      console.log('📊 Number of tables:', response.tables?.length || 0);
      console.log('📋 Tables array:', response.tables);
      if (response.tables && response.tables.length > 0) {
        console.log('📋 First table in response:', response.tables[0]);
      }
      setTables(response.tables || []);
    } catch (error) {
      console.error('❌ Error fetching tables:', error);
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async (tableData: {
    number: string;
    capacity: number;
    location?: string;
    status?: string;
  }) => {
    setApiLoading(true);
    try {
      console.log('📝 Sending table data to API:', tableData);
      const response = await api.createTable(tableData);
      setTables(prev => [response.table, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating table:', error);
      alert(error instanceof Error ? error.message : 'Failed to create table');
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateTable = async (id: string, tableData: Partial<Table>) => {
    setApiLoading(true);
    try {
      const response = await api.updateTable(id, tableData);
      setTables(prev => prev.map(table => 
        table.id === id ? response.table : table
      ));
      setShowEditModal(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error updating table:', error);
      alert(error instanceof Error ? error.message : 'Failed to update table');
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setApiLoading(true);
      try {
        await api.deleteTable(id);
        setTables(prev => prev.filter(table => table.id !== id));
      } catch (error) {
        console.error('Error deleting table:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete table');
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handleUpdateTableStatus = async (id: string, status: string) => {
    setApiLoading(true);
    try {
      const response = await api.updateTableStatus(id, status);
      setTables(prev => prev.map(table => 
        table.id === id ? response.table : table
      ));
    } catch (error) {
      console.error('Error updating table status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update table status');
    } finally {
      setApiLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-900'; // Darker green for better readability
      case 'occupied': return 'bg-red-100 text-red-900';     // Darker red for better readability
      case 'reserved': return 'bg-yellow-100 text-yellow-900'; // Darker yellow for better readability
      case 'cleaning': return 'bg-blue-100 text-blue-900';   // Darker blue for better readability
      default: return 'bg-gray-100 text-gray-900';           // Darker gray for better readability
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-black">Loading tables...</p>
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
                      <h1 className="text-2xl font-bold text-black">Table Management</h1>
        <p className="text-sm text-black mt-1">
                Manage restaurant tables and generate QR codes for ordering
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={apiLoading}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                            <h3 className="text-xl font-bold text-black">Table {table.number}</h3>
        <p className="text-sm text-black">Capacity: {table.capacity} people</p>
                    {table.location && (
                                              <p className="text-xs text-black">{table.location}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedTableForQR(table);
                      }}
                      className="p-2 text-black hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Generate QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTable(table);
                        setShowEditModal(true);
                      }}
                      disabled={apiLoading}
                      className="p-2 text-black hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      title="Edit Table"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      disabled={apiLoading}
                      className="p-2 text-black hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Delete Table"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </span>
                    {table.currentOrderId && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Has Order
                      </span>
                    )}
                  </div>

                  <select
  value={table.status}
  onChange={(e) => handleUpdateTableStatus(table.id, e.target.value)}
  disabled={apiLoading}
  className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
  style={{ color: 'black' }}
>
  <option value="available" style={{ color: 'black', backgroundColor: 'white' }}>Available</option>
  <option value="occupied" style={{ color: 'black', backgroundColor: 'white' }}>Occupied</option>
  <option value="reserved" style={{ color: 'black', backgroundColor: 'white' }}>Reserved</option>
  <option value="cleaning" style={{ color: 'black', backgroundColor: 'white' }}>Cleaning</option>
</select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="text-center py-12">
            <div className="text-black mb-4">
              <QrCode className="h-16 w-16 mx-auto" />
            </div>
                    <h3 className="text-lg font-medium text-black mb-2">No tables yet</h3>
        <p className="text-black mb-6">Create your first table to get started with QR code ordering</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Add First Table
            </button>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {selectedTableForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  QR Code for Table {selectedTableForQR.number}
                </h2>
                <button
                  onClick={() => setSelectedTableForQR(null)}
                  className="text-black hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <TableQRCode
                table={selectedTableForQR}
                tenantSlug={tenantSlug}
                showQR={true}
                onToggle={() => setSelectedTableForQR(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <AddTableModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTable}
          loading={apiLoading}
        />
      )}

      {/* Edit Table Modal */}
      {showEditModal && selectedTable && (
        <EditTableModal
          table={selectedTable}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTable(null);
          }}
          onSubmit={(data) => handleUpdateTable(selectedTable.id, data)}
          loading={apiLoading}
        />
      )}
    </div>
  );
}

// Add Table Modal Component
function AddTableModal({ 
  onClose, 
  onSubmit, 
  loading 
}: { 
  onClose: () => void; 
  onSubmit: (data: {
    number: string;
    capacity: number;
    location?: string;
    status?: string;
  }) => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState<{
    number: string;
    capacity: number;
    location: string;
    status: string;
  }>({
    number: '',
    capacity: 4,
    location: '',
    status: 'available'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate table number
    if (!formData.number.trim()) {
      alert('Table number is required');
      return;
    }
    
    // Remove spaces and convert to URL-safe format
    const cleanTableNumber = formData.number.trim().replace(/\s+/g, '-');
    
    const tableData = {
      ...formData,
      number: cleanTableNumber
    };
    
    console.log('📝 Add form data:', formData);
    console.log('📝 Clean table number:', cleanTableNumber);
    console.log('📝 API data being sent:', tableData);
    
    onSubmit(tableData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Add New Table</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Table Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., 1, A1, VIP-1, Table-2"
              />
              <p className="text-xs text-black mt-1">Spaces will be automatically converted to hyphens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg text-black"
                required
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Main Floor, Patio, Bar"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'reserved' | 'cleaning' })}
                className="w-full p-2 border rounded-lg text-black"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Table'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Table Modal Component
function EditTableModal({ 
  table, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  table: Table;
  onClose: () => void; 
  onSubmit: (data: Partial<Table>) => void; 
  loading: boolean;
}) {
  const [formData, setFormData] = useState<{
    number: string;
    capacity: number;
    location: string;
    status: string;
  }>({
    number: table.number.toString(),
    capacity: table.capacity,
    location: table.location || '',
    status: table.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate table number
    if (!formData.number.trim()) {
      alert('Table number is required');
      return;
    }
    
    const apiData = {
      ...formData,
      status: formData.status as 'available' | 'occupied' | 'reserved' | 'cleaning'
    };
    
    console.log('📝 Edit form data:', formData);
    console.log('📝 API data being sent:', apiData);
    
    onSubmit(apiData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Edit Table {table.number}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Table Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., 1, A1, VIP-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg text-black"
                required
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Main Floor, Patio, Bar"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium !text-black mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'reserved' | 'cleaning' })}
                className="w-full p-2 border rounded-lg text-black "
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Table'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 