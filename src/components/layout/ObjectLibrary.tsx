import React, { useState, useEffect } from "react";
import { Table } from "lucide-react";
import { ObjectTemplate, DEFAULT_SIZES, DEFAULT_COLORS } from "@/types/layout";
import { api, Table as APITable } from "@/lib/api";
import { useLayoutStore } from "@/lib/layout-store";

interface ObjectLibraryProps {
  onDragStart: (template: ObjectTemplate | APITable) => void;
}

// Removed table templates - only real tables from DB can be added

const furnitureTemplates: ObjectTemplate[] = [
  {
    type: "door",
    name: "Door",
    icon: "🚪",
    defaultProps: {
      ...DEFAULT_SIZES.door,
      color: DEFAULT_COLORS.door,
    },
  },
  {
    type: "bar",
    name: "Bar/Counter",
    icon: "🍷",
    defaultProps: {
      ...DEFAULT_SIZES.bar,
      color: DEFAULT_COLORS.bar,
    },
  },
  {
    type: "plant",
    name: "Plant",
    icon: "🌿",
    defaultProps: {
      ...DEFAULT_SIZES.plant,
      color: DEFAULT_COLORS.plant,
    },
  },
  {
    type: "piano",
    name: "Piano",
    icon: "🎹",
    defaultProps: {
      ...DEFAULT_SIZES.piano,
      color: DEFAULT_COLORS.piano,
    },
  },
  {
    type: "prep_center",
    name: "Prep Center",
    icon: "👨‍🍳",
    defaultProps: {
      ...DEFAULT_SIZES.prep_center,
      color: DEFAULT_COLORS.prep_center,
    },
  },
  {
    type: "waiter_station",
    name: "Waiter Station",
    icon: "👨‍💼",
    defaultProps: {
      ...DEFAULT_SIZES.waiter_station,
      color: DEFAULT_COLORS.waiter_station,
    },
  },
  {
    type: "storage_cabinet",
    name: "Storage Cabinet",
    icon: "🗄️",
    defaultProps: {
      ...DEFAULT_SIZES.storage_cabinet,
      color: DEFAULT_COLORS.storage_cabinet,
    },
  },
];

export function ObjectLibrary({ onDragStart }: ObjectLibraryProps) {
  const { currentLocation, objects } = useLayoutStore();
  const [existingTables, setExistingTables] = useState<APITable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<
    "existingTables" | "furniture" | "all"
  >("all");

  // Filter tables for current location
  const tablesForCurrentLocation = existingTables.filter(
    (table) =>
      table.location === currentLocation ||
      (!table.location && currentLocation === "Main Floor")
  );

  // Get tables that are already placed in the layout
  const placedTableIds = new Set(
    objects
      .filter((obj) => obj.isExistingTable && obj.tableId)
      .map((obj) => obj.tableId)
  );

  // Filter out tables that are already placed
  const availableTables = tablesForCurrentLocation.filter(
    (table) => !placedTableIds.has(table.id)
  );

  // Fetch existing tables from API
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const response = await api.getTables();
        setExistingTables(response.tables || []);
      } catch (error) {
        console.error("Error fetching tables:", error);
        setExistingTables([]);
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleDragStart = (
    e: React.DragEvent,
    item: ObjectTemplate | APITable
  ) => {
    // Store the item data for the drop handler
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
    onDragStart(item);
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "cleaning":
        return "bg-gray-100 text-black";
      default:
        return "bg-gray-100 text-black";
    }
  };

  return (
    <div className="w-80 bg-white border-r text-black border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-black">Object Library</h2>
        <p className="text-sm text-black mt-1">
          Drag items to the canvas to build your layout
        </p>
      </div>

      {/* Available Tables Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-black">
            Available Tables - {currentLocation}
            {!tablesLoading && availableTables.length > 0 && (
              <span className="ml-2 text-xs text-black">
                ({availableTables.length} available)
              </span>
            )}
            {!tablesLoading &&
              tablesForCurrentLocation.length > 0 &&
              placedTableIds.size > 0 && (
                <span className="ml-2 text-xs text-black">
                  ({placedTableIds.size} placed)
                </span>
              )}
          </h3>
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === "existingTables" ? "all" : "existingTables"
              )
            }
            className="text-xs text-black hover:text-black"
          >
            {expandedSection === "existingTables" ? "Show All" : "Collapse"}
          </button>
        </div>

        {tablesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-black">Loading tables...</div>
          </div>
        ) : tablesForCurrentLocation.length === 0 ? (
          <div className="text-center py-8">
            <Table className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-black">No tables in {currentLocation}</p>
            <p className="text-xs text-black mt-1">
              Create tables for this location first
            </p>
          </div>
        ) : availableTables.length === 0 ? (
          <div className="text-center py-8">
            <Table className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-black">
              All tables for {currentLocation} are already placed
            </p>
            <p className="text-xs text-black mt-1">
              {tablesForCurrentLocation.length} table
              {tablesForCurrentLocation.length !== 1 ? "s" : ""} total
            </p>
          </div>
        ) : (
          (expandedSection === "existingTables" ||
            expandedSection === "all") && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableTables.map((table) => (
                <div
                  key={table.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, table)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 hover:border-gray-300 transition-colors active:cursor-grabbing"
                >
                  <div className="text-2xl">🪑</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-black">
                        Table {table.number}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTableStatusColor(
                          table.status
                        )}`}
                      >
                        {table.status}
                      </span>
                    </div>
                    <p className="text-xs text-black">
                      {table.capacity} seats
                      {table.location && ` • ${table.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Furniture & Objects Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-black">
            Furniture & Objects
          </h3>
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === "furniture" ? "all" : "furniture"
              )
            }
            className="text-xs text-black hover:text-black"
          >
            {expandedSection === "furniture" ? "Show All" : "Collapse"}
          </button>
        </div>

        {(expandedSection === "furniture" || expandedSection === "all") && (
          <div className="space-y-2">
            {furnitureTemplates.map((template) => (
              <div
                key={template.type}
                draggable
                onDragStart={(e) => handleDragStart(e, template)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 hover:border-gray-300 transition-colors active:cursor-grabbing"
              >
                <div className="text-2xl">{template.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-black">
                    {template.defaultProps.width}×{template.defaultProps.height}
                    cm
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scale Reference */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-black mb-2">Scale Reference</h3>
        <div className="text-xs text-black space-y-1">
          <p>1 pixel = 1 centimeter</p>
          <p>Grid squares = 50cm × 50cm</p>
        </div>

        {/* Visual scale ruler */}
        <div className="mt-3">
          <div className="flex items-center gap-1">
            <div className="w-20 h-1 bg-gray-400"></div>
            <span className="text-xs text-black">20cm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
