'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, FileText } from 'lucide-react';

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

interface ShiftModalProps {
  shift: Shift;
  staff: StaffMember[];
  onSave: (shift: Shift) => void;
  onClose: () => void;
}

export default function ShiftModal({ shift, staff, onSave, onClose }: ShiftModalProps) {
  const [formData, setFormData] = useState<Shift>(shift);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    setFormData(shift);
  }, [shift]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.staffId) {
      newErrors.staffId = 'Please select a staff member';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.shiftHours <= 0) {
      newErrors.shiftHours = 'Shift hours must be greater than 0';
    }

    if (formData.breakDuration < 0) {
      newErrors.breakDuration = 'Break duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate shift hours when both times are set
    if (field === 'endTime' && formData.startTime && value) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${value}`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      if (diffHours > 0) {
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          shiftHours: Math.round(diffHours * 100) / 100
        }));
      }
    } else if (field === 'startTime' && formData.endTime && value) {
      const start = new Date(`2000-01-01T${value}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      if (diffHours > 0) {
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          shiftHours: Math.round(diffHours * 100) / 100
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {shift.id ? 'Edit Shift' : 'Add Shift'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="px-6 py-4"
        >
          {/* Staff Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Staff Member
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.staffId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} ({member.role})
                </option>
              ))}
            </select>
            {errors.staffId && (
              <p className="text-red-500 text-sm mt-1">{errors.staffId}</p>
            )}
          </div>

          {/* Day Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Day
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dayNames.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Shift Hours */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.shiftHours}
              onChange={(e) => setFormData(prev => ({ ...prev, shiftHours: parseFloat(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.shiftHours ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.shiftHours && (
              <p className="text-red-500 text-sm mt-1">{errors.shiftHours}</p>
            )}
          </div>

          {/* Break Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.breakDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.breakDuration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.breakDuration && (
              <p className="text-red-500 text-sm mt-1">{errors.breakDuration}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes (optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this shift..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {shift.id ? 'Update Shift' : 'Add Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 