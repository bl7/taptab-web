import React from "react";
import { Edit2 } from "lucide-react";

interface LocationSelectorProps {
  currentLocation: string;
  availableLocations: string[];
  onLocationChange: (location: string) => void;
  onCreateLocation?: (name: string) => void;
}

export function LocationSelector({
  currentLocation,
  availableLocations,
  onLocationChange,
  onCreateLocation,
}: LocationSelectorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(currentLocation);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== currentLocation) {
      if (!availableLocations.includes(editValue.trim()) && onCreateLocation) {
        onCreateLocation(editValue.trim());
      } else {
        onLocationChange(editValue.trim());
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(currentLocation);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center text-black gap-3">
      <span className="text-sm font-medium text-black">Floor:</span>

      {!isEditing ? (
        <div className="flex items-center gap-2">
          <select
            value={currentLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableLocations.map((location) => (
              <option key={location} value={location} className="text-black">
                {location}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditValue(currentLocation);
              setIsEditing(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Edit floor name"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden md:inline">Edit</span>
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Floor name"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-2 text-sm text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
