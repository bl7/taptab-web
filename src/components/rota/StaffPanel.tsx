'use client';

import { Users, Clock } from 'lucide-react';

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

interface StaffPanelProps {
  staff: StaffMember[];
  shifts: Shift[];
}

export default function StaffPanel({ staff, shifts }: StaffPanelProps) {
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

  const getStaffTotalHours = (staffId: string) => {
    return shifts
      .filter(shift => shift.staffId === staffId)
      .reduce((sum, shift) => sum + shift.shiftHours, 0);
  };

  const getTotalHours = () => {
    return shifts.reduce((sum, shift) => sum + shift.shiftHours, 0);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'Manager';
      case 'STAFF':
        return 'Staff';
      case 'WAITER':
        return 'Waiter';
      case 'KITCHEN':
        return 'Kitchen';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-black" />
          <h3 className="text-lg font-semibold text-black">Staff Members</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {staff.length} active staff members
        </p>
      </div>
      
      <div className="p-6">
        {staff.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No staff members found</p>
            <p className="text-sm text-gray-400 mt-1">
              Add staff members in the Staff Management section
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((member, index) => {
              const totalHours = getStaffTotalHours(member.id);
              return (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${getStaffColor(index)}`}>
                    {getStaffInitials(member.firstName, member.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-black truncate">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getRoleDisplay(member.role)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {member.email}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="text-sm font-semibold text-black">{totalHours} hrs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-black">
          <div className="flex items-center justify-between">
            <span>Total Staff:</span>
            <span className="font-semibold">{staff.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span>Total Hours:</span>
            <span className="font-semibold">{getTotalHours()} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
} 