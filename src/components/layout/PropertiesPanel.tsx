import React, { useState, useEffect } from "react";
import { Trash2, Copy, Settings } from "lucide-react";
import { useLayoutStore, generateObjectId } from "@/lib/layout-store";
import { LayoutObject } from "@/types/layout";

export function PropertiesPanel() {
  const { objects, selectedObjectId, updateObject, deleteObject, addObject } =
    useLayoutStore();

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const [localValues, setLocalValues] = useState<Partial<LayoutObject>>({});

  // Update local values when selection changes
  useEffect(() => {
    if (selectedObject) {
      setLocalValues({
        name: selectedObject.name,
        color: selectedObject.color,
        rotation: selectedObject.rotation,
        seats: selectedObject.seats,
        x: selectedObject.x,
        y: selectedObject.y,
        width: selectedObject.width,
        height: selectedObject.height,
      });
    } else {
      setLocalValues({});
    }
  }, [selectedObject]);

  // Update object when local values change
  const handleValueChange = (key: keyof LayoutObject, value: unknown) => {
    if (!selectedObject) return;

    setLocalValues((prev) => ({ ...prev, [key]: value }));
    updateObject(selectedObject.id, { [key]: value });
  };

  // Handle object duplication
  const handleDuplicate = () => {
    if (!selectedObject) return;

    const newObject: LayoutObject = {
      ...selectedObject,
      id: generateObjectId(),
      x: selectedObject.x + 50,
      y: selectedObject.y + 50,
      name: `${selectedObject.name} Copy`,
    };

    addObject(newObject);
  };

  // Handle object deletion
  const handleDelete = () => {
    if (!selectedObject) return;

    if (confirm(`Are you sure you want to delete "${selectedObject.name}"?`)) {
      deleteObject(selectedObject.id);
    }
  };

  // Color picker presets
  const colorPresets = [
    "#8B4513", // Brown (tables)
    "#1E40AF", // Blue (existing tables)
    "#654321", // Dark brown (doors)
    "#2F4F4F", // Dark slate gray (bar)
    "#228B22", // Forest green (plants)
    "#DC2626", // Red
    "#7C3AED", // Purple
    "#059669", // Emerald
    "#EA580C", // Orange
    "#1F2937", // Gray
  ];

  if (!selectedObject) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Properties</h2>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <Settings className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-black">
              Select an object to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isTable = selectedObject.type.includes("table");
  const hasSeats = isTable; // Could be extended to include other seating objects

  return (
    <div className="w-80 bg-white text-black border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Properties</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDuplicate}
              className="p-2 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate object"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete object"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-black mt-1">
          {selectedObject.type
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Properties */}
        <div>
          <h3 className="text-sm font-medium text-black mb-3">
            Basic Properties
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Name
              </label>
              <input
                type="text"
                value={localValues.name || ""}
                onChange={(e) => handleValueChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Object name"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Color
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleValueChange("color", color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        selectedObject.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedObject.color}
                  onChange={(e) => handleValueChange("color", e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Rotation (degrees)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={localValues.rotation || 0}
                  onChange={(e) =>
                    handleValueChange("rotation", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={localValues.rotation || 0}
                  onChange={(e) =>
                    handleValueChange("rotation", parseInt(e.target.value) || 0)
                  }
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size Properties */}
        <div>
          <h3 className="text-sm font-medium text-black mb-3">
            Size & Position
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={Math.round(localValues.width || 0)}
                onChange={(e) =>
                  handleValueChange("width", parseInt(e.target.value) || 5)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={Math.round(localValues.height || 0)}
                onChange={(e) =>
                  handleValueChange("height", parseInt(e.target.value) || 5)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                X Position
              </label>
              <input
                type="number"
                value={Math.round(localValues.x || 0)}
                onChange={(e) =>
                  handleValueChange("x", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Y Position
              </label>
              <input
                type="number"
                value={Math.round(localValues.y || 0)}
                onChange={(e) =>
                  handleValueChange("y", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
            </div>
          </div>
        </div>

        {/* Seating Properties */}
        {hasSeats && (
          <div>
            <h3 className="text-sm font-medium text-black mb-3">
              {isTable ? "Table Settings" : "Seating Settings"}
            </h3>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Number of Seats
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={localValues.seats || 1}
                onChange={(e) =>
                  handleValueChange("seats", parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {selectedObject.isExistingTable && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Existing Table:</strong> This object is linked to
                  Table {selectedObject.name} in your system.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Object-specific Properties */}
        {selectedObject.type === "piano" && (
          <div>
            <h3 className="text-sm font-medium text-black mb-3">
              Piano Settings
            </h3>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> Consider acoustics and space for audience
                when placing the piano.
              </p>
            </div>
          </div>
        )}

        {selectedObject.type === "prep_center" && (
          <div>
            <h3 className="text-sm font-medium text-black mb-3">
              Kitchen Equipment
            </h3>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Safety:</strong> Ensure proper ventilation and
                electrical access for prep equipment.
              </p>
            </div>
          </div>
        )}

        {selectedObject.type === "waiter_station" && (
          <div>
            <h3 className="text-sm font-medium text-black mb-3">
              Service Station
            </h3>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Tip:</strong> Position near high-traffic areas for
                efficient service.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-black mb-3">Quick Actions</h3>

          <div className="space-y-2">
            <button
              onClick={() => handleValueChange("rotation", 0)}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset Rotation
            </button>

            {isTable && (
              <>
                <button
                  onClick={() => {
                    handleValueChange("width", 120);
                    handleValueChange("height", 120);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Standard Round Table (120cm)
                </button>
                <button
                  onClick={() => {
                    handleValueChange("width", 150);
                    handleValueChange("height", 80);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Rectangle Table (150×80cm)
                </button>
              </>
            )}

            {selectedObject.type === "piano" && (
              <button
                onClick={() => {
                  handleValueChange("width", 180);
                  handleValueChange("height", 120);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Standard Grand Piano (180×120cm)
              </button>
            )}

            {selectedObject.type === "prep_center" && (
              <>
                <button
                  onClick={() => {
                    handleValueChange("width", 200);
                    handleValueChange("height", 80);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Standard Prep Station (200×80cm)
                </button>
                <button
                  onClick={() => {
                    handleValueChange("width", 120);
                    handleValueChange("height", 60);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Compact Prep Station (120×60cm)
                </button>
              </>
            )}

            {selectedObject.type === "storage_cabinet" && (
              <>
                <button
                  onClick={() => {
                    handleValueChange("width", 80);
                    handleValueChange("height", 40);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Standard Cabinet (80×40cm)
                </button>
                <button
                  onClick={() => {
                    handleValueChange("width", 120);
                    handleValueChange("height", 60);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Large Cabinet (120×60cm)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Object Info */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-black mb-2">Object Info</h3>
          <div className="text-xs text-black space-y-1">
            <p>ID: {selectedObject.id}</p>
            <p>Type: {selectedObject.type}</p>
            <p>
              Size: {Math.round(selectedObject.width)}×
              {Math.round(selectedObject.height)}cm
            </p>
            <p>
              Position: ({Math.round(selectedObject.x)},{" "}
              {Math.round(selectedObject.y)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
