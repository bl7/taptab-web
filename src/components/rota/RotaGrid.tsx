'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

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

interface RotaGridProps {
  staff: StaffMember[];
  shifts: Shift[];
  currentWeek: Date;
  onAddShift: (staffId: string, dayOfWeek: number) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  getDailyHours: (dayOfWeek: number) => number;
  readOnly?: boolean;
}

export default function RotaGrid({
  staff,
  shifts,
  currentWeek,
  onAddShift,
  onEditShift,
  onDeleteShift,
  getDailyHours,
  readOnly = false
}: RotaGridProps) {
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ staffId: string; dayOfWeek: number } | null>(null);

  const dayAbbreviations = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const getShiftsForCell = (staffId: string, dayOfWeek: number) => {
    return shifts.filter(shift => shift.staffId === staffId && shift.dayOfWeek === dayOfWeek);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDragStart = (e: React.DragEvent, shift: Shift) => {
    setDraggedShift(shift);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, staffId: string, dayOfWeek: number) => {
    e.preventDefault();
    setDragOverCell({ staffId, dayOfWeek });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, staffId: string, dayOfWeek: number) => {
    e.preventDefault();
    if (draggedShift) {
      // Update the shift with new staff and day
      const updatedShift = {
        ...draggedShift,
        staffId,
        dayOfWeek
      };
      onEditShift(updatedShift);
    }
    setDraggedShift(null);
    setDragOverCell(null);
  };

  const getStaffTotalHours = (staffId: string) => {
    return shifts
      .filter(shift => shift.staffId === staffId)
      .reduce((sum, shift) => sum + shift.shiftHours, 0);
  };

  const getStaffInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStaffColor = (index: number) => {
    const colors = [
      'bg-gray-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Header Row */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black border-r border-gray-200 min-w-[200px]">
                STAFF
              </th>
              {dayAbbreviations.map((day, index) => (
                <th key={day} className="px-4 py-4 text-center text-sm font-semibold text-black border-r border-gray-200 min-w-[120px]">
                  <div>
                    <div className="font-bold">{day}</div>
                    <div className="text-xs text-gray-600">
                      {format(addDays(currentWeek, index), 'dd')}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.map((member, staffIndex) => (
              <tr key={member.id} className="hover:bg-gray-50">
                {/* Staff Column */}
                <td className="px-6 py-4 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getStaffColor(staffIndex)}`}>
                      {getStaffInitials(member.firstName, member.lastName)}
                    </div>
                    <div>
                      <div className="font-semibold text-black">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getStaffTotalHours(member.id)} hrs
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Day Columns */}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const cellShifts = getShiftsForCell(member.id, dayIndex);
                  const isDragOver = dragOverCell?.staffId === member.id && dragOverCell?.dayOfWeek === dayIndex;
                  
                  return (
                    <td
                      key={dayIndex}
                      className={`px-3 py-3 border-r border-gray-200 min-h-[100px] relative ${
                        isDragOver && !readOnly ? 'bg-gray-100 border-gray-300' : ''
                      }`}
                      onDragOver={!readOnly ? (e) => handleDragOver(e, member.id, dayIndex) : undefined}
                      onDragLeave={!readOnly ? handleDragLeave : undefined}
                      onDrop={!readOnly ? (e) => handleDrop(e, member.id, dayIndex) : undefined}
                    >
                      {cellShifts.length > 0 ? (
                        cellShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`mb-2 p-2 bg-black text-white rounded-lg shadow-sm ${
                              !readOnly ? 'cursor-move' : 'cursor-default'
                            }`}
                            draggable={!readOnly}
                            onDragStart={!readOnly ? (e) => handleDragStart(e, shift) : undefined}
                          >
                            {/* Top row - Time and Hours */}
                            <div className="mb-2">
                              <div className="text-xs font-semibold text-white">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </div>
                              <div className="text-xs text-gray-200">
                                {shift.shiftHours} hrs
                              </div>
                              {shift.notes && (
                                <div className="text-xs text-gray-300 truncate">
                                  {shift.notes}
                                </div>
                              )}
                            </div>
                            {/* Bottom row - Action buttons */}
                            {!readOnly && (
                              <div className="flex justify-end space-x-1">
                                <button
                                  onClick={() => onEditShift(shift)}
                                  className="p-1 text-white hover:text-gray-300"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => shift.id && onDeleteShift(shift.id)}
                                  className="p-1 text-red-300 hover:text-red-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        !readOnly && (
                          <button
                            onClick={() => onAddShift(member.id, dayIndex)}
                            className="w-full h-20 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {/* Daily Total Hours Row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 border-r border-gray-200 font-semibold text-black">
                Daily Total Hours
              </td>
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <td key={dayIndex} className="px-4 py-4 border-r border-gray-200 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="font-semibold text-black">
                      {getDailyHours(dayIndex)} hrs
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 