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
  ChevronRight
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
}

interface RotaWeek {
  id?: string;
  weekStartDate: string;
  status: string;
  totalHours: number;
  publishedAt?: string;
}

export default function RotaPage() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rotaWeek, setRotaWeek] = useState<RotaWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
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
      
      // Only TENANT_ADMIN and SUPER_ADMIN can access rota management
      if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
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

  useEffect(() => {
    if (currentUser) {
      fetchRota();
    }
  }, [currentUser, fetchRota]);

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

  const getTotalHours = () => {
    return shifts.reduce((sum, shift) => sum + shift.shiftHours, 0);
  };

  const getDailyHours = (dayOfWeek: number) => {
    return shifts
      .filter(shift => shift.dayOfWeek === dayOfWeek)
      .reduce((sum, shift) => sum + shift.shiftHours, 0);
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Rota</h1>
              <p className="text-gray-600 mt-2">Manage weekly staff schedules</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveRota}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublishRota}
                disabled={publishing || rotaWeek?.status === 'published'}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {publishing ? 'Publishing...' : 'Publish & Send Emails'}
              </button>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <button
              onClick={handlePreviousWeek}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous Week
            </button>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Week of {format(currentWeek, 'MMMM d, yyyy')}
              </h2>
              <p className="text-gray-600">
                {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
              </p>
            </div>
            <button
              onClick={handleNextWeek}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              Next Week
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {rotaWeek && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Total Hours: <strong>{getTotalHours()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Staff: <strong>{staff.length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Status: <strong className={rotaWeek.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>
                        {rotaWeek.status.charAt(0).toUpperCase() + rotaWeek.status.slice(1)}
                      </strong>
                    </span>
                  </div>
                </div>
                {rotaWeek.status === 'published' && rotaWeek.publishedAt && (
                  <div className="text-sm text-gray-500">
                    Published: {format(new Date(rotaWeek.publishedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Staff Panel */}
          <div className="lg:col-span-1">
            <StaffPanel 
              staff={staff}
            />
          </div>

          {/* Rota Grid */}
          <div className="lg:col-span-3">
            <RotaGrid
              staff={staff}
              shifts={shifts}
              currentWeek={currentWeek}
              onAddShift={handleAddShift}
              onEditShift={handleEditShift}
              onDeleteShift={handleDeleteShift}
              getDailyHours={getDailyHours}
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