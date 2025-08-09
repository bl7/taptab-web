"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Upload,
  Download,
  RotateCcw,
  Layers,
  FileText,
  Circle,
  Square,
  RectangleHorizontal,
  X,
} from "lucide-react";
import { ObjectLibrary } from "@/components/layout/ObjectLibrary";
import { KonvaStage } from "@/components/layout/KonvaStage";
import { PropertiesPanel } from "@/components/layout/PropertiesPanel";
import { LocationSelector } from "@/components/layout/LocationSelector";
import { useLayoutStore, generateObjectId } from "@/lib/layout-store";
import {
  ObjectTemplate,
  LayoutObject,
  ObjectType,
  DEFAULT_SIZES,
  DEFAULT_COLORS,
  SavedLayout,
} from "@/types/layout";
import { Table as APITable, TableLayout, api } from "@/lib/api";
import { showToast } from "@/lib/utils";
import {
  exportLayoutToFile,
  importLayoutFromFile,
  generateLayoutPreview,
} from "@/lib/layout-utils";

export default function LayoutBuilderPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showTableShapeModal, setShowTableShapeModal] = useState(false);
  const [pendingTableDrop, setPendingTableDrop] = useState<{
    table: APITable;
    x: number;
    y: number;
  } | null>(null);

  const [draggedItem, setDraggedItem] = useState<
    ObjectTemplate | APITable | null
  >(null);

  const {
    objects,
    clearLayout,
    loadLayout,
    addObject,
    selectedObjectId,
    currentLocation,
    availableLocations,
    setCurrentLocation,
    setAvailableLocations,
    saveLayoutToBackend,
    loadLayoutFromBackend,
  } = useLayoutStore();

  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.addEventListener("resize", updateCanvasSize);
  }, []);

  // Load saved layouts and locations on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch both tables and locations
        const { api } = await import("@/lib/api");
        const [tablesResponse, locationsResponse] = await Promise.all([
          api.getTables(),
          api.getLocations(),
        ]);

        const tables = tablesResponse.tables || [];
        const locations = locationsResponse.locations || [];

        // Use proper location names from the locations API
        const locationNames = locations
          .filter((loc) => loc.isActive)
          .map((loc) => loc.name);

        // Add fallback for tables without location assignment
        if (!locationNames.includes("Main Floor")) {
          locationNames.unshift("Main Floor");
        }

        setAvailableLocations(locationNames);

        // Layouts will be loaded on demand
      } catch (error) {
        console.error("Error loading locations:", error);
        // Fallback to default location
        setAvailableLocations(["Main Floor"]);
      }
    };

    loadData();
  }, [currentLocation, setAvailableLocations]);

  // Handle drag start from object library
  const handleDragStart = useCallback((item: ObjectTemplate | APITable) => {
    setDraggedItem(item);
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!canvasRef.current || !draggedItem) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let newObject: LayoutObject;

      // Check if it's an existing table from API
      if ("id" in draggedItem && "number" in draggedItem) {
        // It's an API table - show shape selection modal
        const table = draggedItem as APITable;
        setPendingTableDrop({ table, x, y });
        setShowTableShapeModal(true);
        setDraggedItem(null);
        return; // Don't add object yet, wait for shape selection
      } else {
        // It's a template object (furniture)
        const template = draggedItem as ObjectTemplate;
        newObject = {
          id: generateObjectId(),
          type: template.type,
          x,
          y,
          width:
            template.defaultProps.width || DEFAULT_SIZES[template.type].width,
          height:
            template.defaultProps.height || DEFAULT_SIZES[template.type].height,
          rotation: template.defaultProps.rotation || 0,
          color: template.defaultProps.color || DEFAULT_COLORS[template.type],
          name: template.name,
          seats: template.defaultProps.seats,
          isExistingTable: false,
        };

        addObject(newObject);
        setDraggedItem(null);
      }
    },
    [draggedItem, addObject]
  );

  // Handle drag over canvas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // Handle table shape selection
  const handleTableShapeSelection = useCallback(
    (shape: "round" | "square" | "rectangle") => {
      if (!pendingTableDrop) return;

      const { table, x, y } = pendingTableDrop;

      // Determine the type and size based on shape
      let type: ObjectType;
      let width: number;
      let height: number;

      switch (shape) {
        case "round":
          type = "round_table";
          width = DEFAULT_SIZES.round_table.width;
          height = DEFAULT_SIZES.round_table.height;
          break;
        case "square":
          type = "square_table";
          width = DEFAULT_SIZES.square_table.width;
          height = DEFAULT_SIZES.square_table.height;
          break;
        case "rectangle":
          type = "rectangle_table";
          width = DEFAULT_SIZES.rectangle_table.width;
          height = DEFAULT_SIZES.rectangle_table.height;
          break;
      }

      const newObject: LayoutObject = {
        id: generateObjectId(),
        type,
        x,
        y,
        width,
        height,
        rotation: 0,
        color: DEFAULT_COLORS[type],
        name: `Table ${table.number}`,
        seats: table.capacity,
        isExistingTable: true,
        tableId: table.id,
      };

      addObject(newObject);
      setShowTableShapeModal(false);
      setPendingTableDrop(null);
    },
    [pendingTableDrop, addObject]
  );

  // Save layout
  const handleSaveLayout = async (name: string, description?: string) => {
    try {
      await saveLayoutToBackend(name, description);
      setShowSaveModal(false);
      showToast.saved("Layout");
    } catch (error) {
      console.error("Failed to save layout:", error);
      showToast.operationFailed("save layout", (error as Error).message);
    }
  };

  // Load layout from backend
  const handleLoadLayout = async (layoutId: string) => {
    try {
      await loadLayoutFromBackend(layoutId);
      setShowLoadModal(false);
      showToast.loaded("Layout");
    } catch (error) {
      console.error("Failed to load layout:", error);
      showToast.operationFailed("load layout", (error as Error).message);
    }
  };

  // Fetch saved layouts for current location
  const [savedLayouts, setSavedLayouts] = useState<TableLayout[]>([]);
  const fetchSavedLayouts = async () => {
    try {
      const locations = await api.getLocations();
      const currentLocationObj = locations.locations.find(
        (loc) => loc.name === currentLocation
      );

      if (currentLocationObj) {
        const layouts = await api.getTableLayouts({
          locationId: currentLocationObj.id,
        });
        setSavedLayouts(layouts.layouts);
      }
    } catch (error) {
      console.error("Failed to fetch layouts:", error);
    }
  };

  // Clear layout
  const handleClearLayout = () => {
    if (
      confirm(
        "Are you sure you want to clear the entire layout? This cannot be undone."
      )
    ) {
      clearLayout();
    }
  };

  // Export layout
  const handleExportLayout = () => {
    if (objects.length === 0) {
      showToast.warning("Cannot export an empty layout");
      return;
    }

    const layout: SavedLayout = {
      id: generateObjectId(),
      name: `Layout_${new Date().toISOString().split("T")[0]}`,
      location: currentLocation,
      objects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    exportLayoutToFile(layout);
  };

  // Import layout
  const handleImportLayout = async () => {
    try {
      const layout = await importLayoutFromFile();
      if (layout.location && layout.location !== currentLocation) {
        // Switch to the imported layout's location if different
        if (!availableLocations.includes(layout.location)) {
          setAvailableLocations([...availableLocations, layout.location]);
        }
        setCurrentLocation(layout.location);
      }
      loadLayout(layout.objects);
      showToast.success("Layout imported successfully!");
    } catch (error) {
      showToast.operationFailed("import layout", (error as Error).message);
    }
  };

  // Handle location change
  const handleLocationChange = (newLocation: string) => {
    // Save current layout state if needed
    setCurrentLocation(newLocation);
    // Clear objects when switching locations
    clearLayout();
  };

  // Handle creating new location
  const handleCreateLocation = (name: string) => {
    if (!availableLocations.includes(name)) {
      setAvailableLocations([...availableLocations, name]);
      setCurrentLocation(name);
      clearLayout();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Restaurant Layout Builder
            </h1>
            <p className="text-sm text-black mt-1">
              Design your restaurant floor plan with drag-and-drop simplicity
            </p>

            {/* Location Selector */}
            <div className="mt-3">
              <LocationSelector
                currentLocation={currentLocation}
                availableLocations={availableLocations}
                onLocationChange={handleLocationChange}
                onCreateLocation={handleCreateLocation}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={objects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </button>

            <button
              onClick={() => setShowLoadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Load Layout
            </button>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={handleExportLayout}
                disabled={objects.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
                title="Export to file"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleImportLayout}
                className="flex items-center gap-2 px-3 py-2 text-black hover:bg-gray-50 transition-colors"
                title="Import from file"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleClearLayout}
              disabled={objects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-black">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>{objects.length} objects</span>
          </div>
          {selectedObjectId && (
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>Object selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Object Library */}
        <ObjectLibrary onDragStart={handleDragStart} />

        {/* Canvas Area */}
        <div ref={canvasRef} className="flex-1">
          <KonvaStage
            width={canvasSize.width}
            height={canvasSize.height}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveLayoutModal
          onSave={handleSaveLayout}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <LoadLayoutModal
          layouts={savedLayouts}
          currentLocation={currentLocation}
          onLoad={handleLoadLayout}
          onDelete={async (layoutId) => {
            try {
              await api.deleteTableLayout(layoutId);
              await fetchSavedLayouts(); // Refresh the list
              showToast.deleted("Layout");
            } catch (error) {
              showToast.operationFailed(
                "delete layout",
                (error as Error).message
              );
            }
          }}
          onClose={() => setShowLoadModal(false)}
          onOpen={fetchSavedLayouts}
        />
      )}

      {/* Table Shape Selection Modal */}
      {showTableShapeModal && pendingTableDrop && (
        <TableShapeModal
          tableName={`Table ${pendingTableDrop.table.number}`}
          onShapeSelect={handleTableShapeSelection}
          onClose={() => {
            setShowTableShapeModal(false);
            setPendingTableDrop(null);
          }}
        />
      )}
    </div>
  );
}

// Save Layout Modal
function SaveLayoutModal({
  onSave,
  onClose,
}: {
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Save Layout</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Layout Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter layout name..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Layout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Load Layout Modal
function LoadLayoutModal({
  layouts,
  currentLocation,
  onLoad,
  onDelete,
  onClose,
  onOpen,
}: {
  layouts: TableLayout[];
  currentLocation: string;
  onLoad: (layoutId: string) => void;
  onDelete: (layoutId: string) => void;
  onClose: () => void;
  onOpen?: () => void;
}) {
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Load layouts when modal opens
  React.useEffect(() => {
    if (onOpen) {
      onOpen();
    }
  }, [onOpen]);

  // Get unique locations from layouts
  const locations = [
    ...new Set(
      layouts.map((layout) => layout.locationDetails?.name || "Unknown")
    ),
  ];

  // Filter layouts by location
  const filteredLayouts =
    locationFilter === "all"
      ? layouts
      : layouts.filter(
          (layout) =>
            (layout.locationDetails?.name || "Unknown") === locationFilter
        );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Load Layout</h2>

          {/* Location Filter */}
          {locations.length > 1 && (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredLayouts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-black mx-auto mb-4" />
            <p className="text-black">No saved layouts found</p>
            <p className="text-sm text-black mt-1">
              Create and save a layout first
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredLayouts.map((layout) => (
              <div
                key={layout.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-black">{layout.name}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {layout.locationDetails?.name || "Unknown"}
                    </span>
                    {layout.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {layout.description && (
                    <p className="text-sm text-black mt-1">
                      {layout.description}
                    </p>
                  )}
                  <p className="text-xs text-black mt-1">
                    Tables: {layout.layoutJson.tables?.length || 0} | Objects:{" "}
                    {layout.layoutJson.objects?.length || 0}
                  </p>
                  <p className="text-xs text-black mt-1">
                    Created: {new Date(layout.createdAt).toLocaleDateString()}{" "}
                    by {layout.createdBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoad(layout.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete layout "${layout.name}"?`)) {
                        onDelete(layout.id);
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Table Shape Selection Modal
function TableShapeModal({
  tableName,
  onShapeSelect,
  onClose,
}: {
  tableName: string;
  onShapeSelect: (shape: "round" | "square" | "rectangle") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Table Shape</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <p className="text-sm text-black mb-6">
          Choose the visual shape for <strong>{tableName}</strong>:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onShapeSelect("round")}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Circle className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Round Table</div>
              <div className="text-sm text-black">
                120cm diameter • Circular seating
              </div>
            </div>
          </button>

          <button
            onClick={() => onShapeSelect("square")}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Square className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Square Table</div>
              <div className="text-sm text-black">
                100×100cm • Compact design
              </div>
            </div>
          </button>

          <button
            onClick={() => onShapeSelect("rectangle")}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <RectangleHorizontal className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Rectangle Table</div>
              <div className="text-sm text-black">150×80cm • Long format</div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-xs text-black">
          <p>
            💡 You can resize and rotate the table after placing it on the
            canvas.
          </p>
        </div>
      </div>
    </div>
  );
}
