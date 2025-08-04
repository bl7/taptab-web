'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  Clock, 
  Save, 
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import RotaGrid from '@/components/rota/RotaGrid';
import StaffPanel from '@/components/rota/StaffPanel';
import ShiftModal from '@/components/rota/ShiftModal';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Shift {
  id?: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakDuration: number;
  shiftHours: number;
  notes?: string;
  status?: string;
  shiftLabel?: string;
}

interface RotaWeek {
  id?: string;
  weekStartDate: string;
  status: string;
  totalHours: number;
  publishedAt?: string;
}

interface SavedRota {
  weekStartDate: string;
  status: string;
  totalHours: number;
  publishedAt?: string;
  createdAt: string;
}

export default function RotaPage() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rotaWeek, setRotaWeek] = useState<RotaWeek | null>(null);
  const [savedRotas, setSavedRotas] = useState<SavedRota[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showRotaDropdown, setShowRotaDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authorized to access rota management
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Only TENANT_ADMIN can access rota management
      if (user.role !== 'TENANT_ADMIN') {
        router.push('/dashboard');
        return;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      router.push('/login');
      return;
    }
  }, [router]);

  const fetchRota = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const weekStartDate = format(currentWeek, 'yyyy-MM-dd');
      const response = await fetch(`/api/rota?weekStartDate=${weekStartDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
        setShifts(data.shifts);
        setRotaWeek(data.week);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        console.error('Failed to fetch rota');
      }
    } catch (error) {
      console.error('Error fetching rota:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, router]);

  const fetchSavedRotas = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/rota/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedRotas(data.rotas);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        console.error('Failed to fetch saved rotas');
      }
    } catch (error) {
      console.error('Error fetching saved rotas:', error);
    }
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchRota();
      fetchSavedRotas();
    }
  }, [currentUser, fetchRota, fetchSavedRotas]);

  const handleSaveRota = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const weekStartDate = format(currentWeek, 'yyyy-MM-dd');
      const response = await fetch('/api/rota', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStartDate,
          shifts,
          status: 'draft'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRotaWeek(data.week);
        // Show success message
        console.log('Rota saved successfully');
      } else {
        console.error('Failed to save rota');
      }
    } catch (error) {
      console.error('Error saving rota:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishRota = async () => {
    try {
      setPublishing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const weekStartDate = format(currentWeek, 'yyyy-MM-dd');
      const response = await fetch('/api/rota/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStartDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchRota(); // Refresh data
        // Show success message
        console.log(`Rota published successfully. ${data.emailsSent} emails sent.`);
      } else {
        console.error('Failed to publish rota');
      }
    } catch (error) {
      console.error('Error publishing rota:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddShift = (staffId: string, dayOfWeek: number) => {
    setSelectedShift({
      staffId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 0,
      shiftHours: 8
    });
    setShowShiftModal(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setShowShiftModal(true);
  };

  const handleSaveShift = (shift: Shift) => {
    if (selectedShift?.id) {
      // Update existing shift
      setShifts(prev => prev.map(s => s.id === selectedShift.id ? shift : s));
    } else {
      // Add new shift
      setShifts(prev => [...prev, { ...shift, id: Date.now().toString() }]);
    }
    setShowShiftModal(false);
    setSelectedShift(null);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const handleSelectRota = (weekStartDate: string) => {
    setCurrentWeek(new Date(weekStartDate));
    setShowRotaDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.rota-dropdown')) {
        setShowRotaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isPastWeek = () => {
    const today = new Date();
    const weekEnd = addDays(currentWeek, 6);
    return weekEnd < today;
  };

  const canEditRota = () => {
    return !isPastWeek();
  };

  const getTotalHours = () => {
    return shifts.reduce((sum, shift) => sum + (Number(shift.shiftHours) || 0), 0);
  };

  const getDailyHours = (dayOfWeek: number) => {
    return shifts
      .filter(shift => shift.dayOfWeek === dayOfWeek)
      .reduce((sum, shift) => sum + (Number(shift.shiftHours) || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Staff Rota</h1>
              <p className="text-gray-600 mt-1">Manage weekly staff schedules</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveRota}
                disabled={saving || !canEditRota()}
                className="flex items-center px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublishRota}
                disabled={publishing || rotaWeek?.status === 'published' || !canEditRota()}
                className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <button
              onClick={handlePreviousWeek}
              className="flex items-center text-gray-600 hover:text-black transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            {/* Rota Dropdown */}
            <div className="relative rota-dropdown">
              <button
                onClick={() => setShowRotaDropdown(!showRotaDropdown)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-white"
              >
                <span className="text-black font-semibold text-sm">
                  Week of {format(currentWeek, 'MMMM d, yyyy')}
                </span>
                <ChevronDown className="w-4 h-4 text-black" />
              </button>
              
              {showRotaDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {savedRotas.map((rota) => (
                    <button
                      key={rota.weekStartDate}
                      onClick={() => handleSelectRota(rota.weekStartDate)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-black">
                        Week of {format(new Date(rota.weekStartDate), 'MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {rota.status} • {rota.totalHours} hrs
                      </div>
                    </button>
                  ))}
                  {savedRotas.length === 0 && (
                    <div className="px-4 py-3 text-gray-500">
                      No saved rotas found
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-gray-500 text-xs mt-1">
                {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
              </p>
            </div>
            
            <button
              onClick={handleNextWeek}
              className="flex items-center text-gray-600 hover:text-black transition-colors text-sm font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {rotaWeek && (
          <div className="mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Total Hours:</span> <span className="font-semibold text-black">{getTotalHours()}</span>
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                    <Users className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Staff:</span> <span className="font-semibold text-black">{staff.length}</span>
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Status:</span> <span className={`font-semibold ${rotaWeek.status === 'published' ? 'text-gray-700' : 'text-yellow-600'}`}>
                        {rotaWeek.status.charAt(0).toUpperCase() + rotaWeek.status.slice(1)}
                      </span>
                    </span>
                  </div>
                </div>
                {rotaWeek.status === 'published' && rotaWeek.publishedAt && (
                  <div className="text-xs text-gray-500">
                    Published: {format(new Date(rotaWeek.publishedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Staff Panel */}
          <div className="lg:col-span-1">
            <StaffPanel 
              staff={staff}
              shifts={shifts}
            />
          </div>

          {/* Rota Grid */}
          <div className="lg:col-span-3">
            {!canEditRota() && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700 text-sm">
                  This week has already ended and cannot be edited. You can view the schedule but cannot make changes.
                </p>
              </div>
            )}
            <RotaGrid
              staff={staff}
              shifts={shifts}
              currentWeek={currentWeek}
              onAddShift={canEditRota() ? handleAddShift : () => {}}
              onEditShift={canEditRota() ? handleEditShift : () => {}}
              onDeleteShift={canEditRota() ? handleDeleteShift : () => {}}
              getDailyHours={getDailyHours}
              readOnly={!canEditRota()}
            />
          </div>
        </div>

        {/* Shift Modal */}
        {showShiftModal && selectedShift && (
          <ShiftModal
            shift={selectedShift}
            staff={staff}
            onSave={handleSaveShift}
            onClose={() => {
              setShowShiftModal(false);
              setSelectedShift(null);
            }}
          />
        )}
      </div>
    </div>
  );
} 