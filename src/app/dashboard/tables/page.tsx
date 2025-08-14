"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  QrCode,
  MapPin,
  Table as TableIcon,
  Building2,
  Users,
} from "lucide-react";
import { api, Table, Location, TableLayout } from "@/lib/api";
import TableQRCode from "@/components/TableQRCode";
import { showToast, PageLoader } from "@/lib/utils";

type TabType = "locations" | "tables";

export default function TablesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("locations");
  const [tables, setTables] = useState<Table[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [defaultLayouts, setDefaultLayouts] = useState<{
    [locationId: string]: TableLayout;
  }>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(
    null
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is authorized to access table management
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);

        // Only TENANT_ADMIN and MANAGER can access table management
        if (user.role !== "TENANT_ADMIN" && user.role !== "MANAGER") {
          router.push("/dashboard");
          return;
        }

        setTenantSlug(user.tenant?.slug || "");
      } catch (e) {
        console.error("Error parsing user data:", e);
        router.push("/login");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    console.log("🔄 Starting to fetch tables and locations...");
    try {
      const [tablesResponse, locationsResponse] = await Promise.all([
        api.getTables(),
        api.getLocations(),
      ]);

      console.log("📋 Tables response:", tablesResponse);
      console.log("📍 Locations response:", locationsResponse);

      setTables(tablesResponse.tables || []);
      setLocations(locationsResponse.locations || []);

      // Fetch default layouts for each location
      const layoutsMap: { [locationId: string]: TableLayout } = {};
      for (const location of locationsResponse.locations || []) {
        try {
          const layoutsResponse = await api.getTableLayouts({
            locationId: location.id,
          });

          // Find the default layout for this location
          const defaultLayout = layoutsResponse.layouts.find(
            (layout) => layout.isDefault
          );
          if (defaultLayout) {
            layoutsMap[location.id] = defaultLayout;
          }
        } catch (error) {
          console.warn(
            `Failed to fetch layouts for location ${location.name}:`,
            error
          );
        }
      }

      setDefaultLayouts(layoutsMap);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Location Management Functions
  const handleCreateLocation = async (locationData: {
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    setApiLoading(true);
    try {
      const response = await api.createLocation(locationData);
      setLocations((prev) => [response.location, ...prev]);
      setShowAddModal(false);
      showToast.created("Location");
    } catch (error) {
      console.error("Error creating location:", error);
      showToast.operationFailed(
        "create location",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateLocation = async (
    id: string,
    locationData: Partial<Location>
  ) => {
    setApiLoading(true);
    try {
      const response = await api.updateLocation(id, locationData);
      setLocations((prev) =>
        prev.map((location) =>
          location.id === id ? response.location : location
        )
      );
      setShowEditModal(false);
      setSelectedLocation(null);
      showToast.updated("Location");
    } catch (error) {
      console.error("Error updating location:", error);
      showToast.operationFailed(
        "update location",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string, force = false) => {
    const location = locations.find((l) => l.id === id);
    if (!location) return;

    let confirmMessage = "Are you sure you want to delete this location?";
    if (location.tableCount > 0 && !force) {
      confirmMessage = `This location has ${location.tableCount} table(s) assigned. This will unassign all tables. Are you sure?`;
    }

    if (confirm(confirmMessage)) {
      setApiLoading(true);
      try {
        await api.deleteLocation(id, location.tableCount > 0);
        setLocations((prev) => prev.filter((location) => location.id !== id));
        showToast.deleted("Location");
        // Refresh tables to reflect changes
        const tablesResponse = await api.getTables();
        setTables(tablesResponse.tables || []);
      } catch (error) {
        console.error("Error deleting location:", error);
        showToast.operationFailed(
          "delete location",
          error instanceof Error ? error.message : undefined
        );
      } finally {
        setApiLoading(false);
      }
    }
  };

  // Table Management Functions
  const handleCreateTable = async (tableData: {
    number: string;
    capacity: number;
    locationId?: string;
    status?: string;
  }) => {
    setApiLoading(true);
    try {
      console.log("📝 Sending table data to API:", tableData);
      const response = await api.createTable(tableData);
      setTables((prev) => [response.table, ...prev]);
      setShowAddModal(false);
      showToast.created("Table");
      // Refresh locations to update table counts
      const locationsResponse = await api.getLocations();
      setLocations(locationsResponse.locations || []);
    } catch (error) {
      console.error("Error creating table:", error);
      showToast.operationFailed(
        "create table",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateTable = async (id: string, tableData: Partial<Table>) => {
    setApiLoading(true);
    try {
      const response = await api.updateTable(id, tableData);
      setTables((prev) =>
        prev.map((table) => (table.id === id ? response.table : table))
      );
      setShowEditModal(false);
      setSelectedTable(null);
      // Refresh locations to update table counts
      const locationsResponse = await api.getLocations();
      setLocations(locationsResponse.locations || []);
    } catch (error) {
      console.error("Error updating table:", error);
      showToast.operationFailed(
        "update table",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      setApiLoading(true);
      try {
        await api.deleteTable(id);
        setTables((prev) => prev.filter((table) => table.id !== id));
        showToast.deleted("Table");
        // Refresh locations to update table counts
        const locationsResponse = await api.getLocations();
        setLocations(locationsResponse.locations || []);
      } catch (error) {
        console.error("Error deleting table:", error);
        showToast.operationFailed(
          "delete table",
          error instanceof Error ? error.message : undefined
        );
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handleUpdateTableStatus = async (id: string, status: string) => {
    setApiLoading(true);
    try {
      const response = await api.updateTableStatus(id, status);
      setTables((prev) =>
        prev.map((table) => (table.id === id ? response.table : table))
      );
    } catch (error) {
      console.error("Error updating table status:", error);
      showToast.operationFailed(
        "update table status",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setApiLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-900";
      case "occupied":
        return "bg-red-100 text-red-900";
      case "reserved":
        return "bg-yellow-100 text-yellow-900";
      case "cleaning":
        return "bg-blue-100 text-blue-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  if (loading) {
    return <PageLoader message="Loading tables and locations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black mt-1">
                Manage restaurant locations and tables
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setSelectedTable(null);
                  setSelectedLocation(null);
                }}
                disabled={apiLoading}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add {activeTab === "locations" ? "Location" : "Table"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("locations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "locations"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Locations ({locations.length})
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "tables"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Tables ({tables.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "locations" ? (
          <LocationsTab
            locations={locations}
            onEdit={(location) => {
              setSelectedLocation(location);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteLocation}
            apiLoading={apiLoading}
          />
        ) : (
          <TablesTab
            tables={tables}
            locations={locations}
            defaultLayouts={defaultLayouts}
            onEdit={(table) => {
              setSelectedTable(table);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteTable}
            onStatusUpdate={handleUpdateTableStatus}
            onShowQR={setSelectedTableForQR}
            apiLoading={apiLoading}
            getStatusColor={getStatusColor}
          />
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

      {/* Modals */}
      {showAddModal && activeTab === "locations" && (
        <AddLocationModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateLocation}
          loading={apiLoading}
        />
      )}

      {showAddModal && activeTab === "tables" && (
        <AddTableModal
          locations={locations}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTable}
          loading={apiLoading}
        />
      )}

      {showEditModal && selectedLocation && (
        <EditLocationModal
          location={selectedLocation}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLocation(null);
          }}
          onSubmit={(data) => handleUpdateLocation(selectedLocation.id, data)}
          loading={apiLoading}
        />
      )}

      {showEditModal && selectedTable && (
        <EditTableModal
          table={selectedTable}
          locations={locations}
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

// Locations Tab Component
function LocationsTab({
  locations,
  onEdit,
  onDelete,
  apiLoading,
}: {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  apiLoading: boolean;
}) {
  return (
    <div>
      {locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {location.name}
                    </h3>
                    {location.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {location.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-black flex items-center gap-1">
                        <TableIcon className="h-4 w-4" />
                        {location.tableCount} table
                        {location.tableCount !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.isActive
                            ? "bg-green-100 text-green-900"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {location.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(location)}
                      disabled={apiLoading}
                      className="p-2 text-black hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      title="Edit Location"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(location.id)}
                      disabled={apiLoading}
                      className="p-2 text-black hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Delete Location"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-black mb-4">
            <MapPin className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-black mb-2">
            No locations yet
          </h3>
          <p className="text-black mb-6">
            Create your first location to organize your tables
          </p>
        </div>
      )}
    </div>
  );
}

// Tables Tab Component
function TablesTab({
  tables,
  locations,
  defaultLayouts,
  onEdit,
  onDelete,
  onStatusUpdate,
  onShowQR,
  apiLoading,
  getStatusColor,
}: {
  tables: Table[];
  locations: Location[];
  defaultLayouts: { [locationId: string]: TableLayout };
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onShowQR: (table: Table) => void;
  apiLoading: boolean;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div>
      {tables.length > 0 ? (
        <div className="space-y-8">
          {/* Group tables by location */}
          {locations.map((location) => {
            const locationTables = tables.filter(
              (table) =>
                table.locationId === location.id ||
                table.location === location.name
            );
            const defaultLayout = defaultLayouts[location.id];

            if (locationTables.length === 0) return null;

            return (
              <div key={location.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {location.name}
                  </h2>
                  {defaultLayout && (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      Default Layout: {defaultLayout.name}
                    </span>
                  )}
                </div>

                {/* Layout Preview */}
                {defaultLayout && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-medium text-black mb-3">
                      Layout Preview
                    </h3>
                    <div className="bg-white rounded border border-gray-300 p-4 min-h-[200px] relative">
                      {/* Simple layout visualization */}
                      <div className="text-sm text-gray-600 mb-2">
                        Tables: {defaultLayout.layoutJson.tables?.length || 0} |
                        Objects: {defaultLayout.layoutJson.objects?.length || 0}
                      </div>

                      {/* Layout canvas placeholder */}
                      <div className="bg-gray-100 rounded border-2 border-dashed border-gray-300 h-32 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <TableIcon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">
                            Layout: {defaultLayout.name}
                          </p>
                          <p className="text-xs">Click to view full layout</p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          window.open("/dashboard/layout", "_blank")
                        }
                        className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View Full Layout
                      </button>
                    </div>
                  </div>
                )}

                {/* Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {locationTables.map((table) => (
                    <div
                      key={table.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-black">
                              Table {table.number}
                            </h3>
                            <p className="text-sm text-black flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Capacity: {table.capacity} people
                            </p>
                            {table.locationDetails ? (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {table.locationDetails.name}
                              </p>
                            ) : (
                              table.location && (
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {table.location}
                                </p>
                              )
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => onShowQR(table)}
                              className="p-2 text-black hover:text-blue-600 rounded-lg hover:bg-blue-50"
                              title="Generate QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onEdit(table)}
                              disabled={apiLoading}
                              className="p-2 text-black hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                              title="Edit Table"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDelete(table.id)}
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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                table.status
                              )}`}
                            >
                              {table.status.charAt(0).toUpperCase() +
                                table.status.slice(1)}
                            </span>
                            {table.currentOrderId && (
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Has Order
                              </span>
                            )}
                          </div>

                          <select
                            value={table.status}
                            onChange={(e) =>
                              onStatusUpdate(table.id, e.target.value)
                            }
                            disabled={apiLoading}
                            className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                            style={{ color: "black" }}
                          >
                            <option
                              value="available"
                              style={{
                                color: "black",
                                backgroundColor: "white",
                              }}
                            >
                              Available
                            </option>
                            <option
                              value="occupied"
                              style={{
                                color: "black",
                                backgroundColor: "white",
                              }}
                            >
                              Occupied
                            </option>
                            <option
                              value="reserved"
                              style={{
                                color: "black",
                                backgroundColor: "white",
                              }}
                            >
                              Reserved
                            </option>
                            <option
                              value="cleaning"
                              style={{
                                color: "black",
                                backgroundColor: "white",
                              }}
                            >
                              Cleaning
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-black mb-4">
            <TableIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-black mb-2">No tables yet</h3>
          <p className="text-black mb-6">
            Create your first table to get started with QR code ordering
          </p>
        </div>
      )}
    </div>
  );
}

// Add Location Modal Component
function AddLocationModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }) => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.warning("Location name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      isActive: isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Add New Location
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="location-name"
                className="block text-sm font-medium text-black mb-1"
              >
                Location Name *
              </label>
              <input
                id="location-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., Main Floor, Patio, VIP Area"
              />
            </div>

            <div>
              <label
                htmlFor="location-description"
                className="block text-sm font-medium text-black mb-1"
              >
                Description
              </label>
              <textarea
                id="location-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg text-black h-20 resize-none"
                placeholder="Optional description of the location"
              />
            </div>

            <div>
              <label
                htmlFor="location-active"
                className="flex items-center gap-2"
              >
                <input
                  id="location-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-black">Active location</span>
              </label>
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
                {loading ? "Creating..." : "Create Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Location Modal Component
function EditLocationModal({
  location,
  onClose,
  onSubmit,
  loading,
}: {
  location: Location;
  onClose: () => void;
  onSubmit: (data: Partial<Location>) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description || "");
  const [isActive, setIsActive] = useState(location.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.warning("Location name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      isActive: isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Edit Location
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="edit-location-name"
                className="block text-sm font-medium text-black mb-1"
              >
                Location Name *
              </label>
              <input
                id="edit-location-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., Main Floor, Patio, VIP Area"
              />
            </div>

            <div>
              <label
                htmlFor="edit-location-description"
                className="block text-sm font-medium text-black mb-1"
              >
                Description
              </label>
              <textarea
                id="edit-location-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg text-black h-20 resize-none"
                placeholder="Optional description of the location"
              />
            </div>

            <div>
              <label
                htmlFor="edit-location-active"
                className="flex items-center gap-2"
              >
                <input
                  id="edit-location-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-black">Active location</span>
              </label>
            </div>

            {location.tableCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This location has {location.tableCount} table
                  {location.tableCount !== 1 ? "s" : ""} assigned.
                  {!isActive &&
                    " Making it inactive will not affect existing tables."}
                </p>
              </div>
            )}

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
                {loading ? "Updating..." : "Update Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add Table Modal Component
function AddTableModal({
  locations,
  onClose,
  onSubmit,
  loading,
}: {
  locations: Location[];
  onClose: () => void;
  onSubmit: (data: {
    number: string;
    capacity: number;
    locationId?: string;
    status?: string;
  }) => void;
  loading: boolean;
}) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("available");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!number.trim()) {
      showToast.warning("Table number is required");
      return;
    }

    const cleanTableNumber = number.trim().replace(/\s+/g, "-");

    const tableData = {
      number: cleanTableNumber,
      capacity: capacity,
      locationId: locationId || undefined,
      status: status,
    };

    onSubmit(tableData);
  };

  const activeLocations = locations.filter((loc) => loc.isActive);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Add New Table
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="table-number"
                className="block text-sm font-medium text-black mb-1"
              >
                Table Number *
              </label>
              <input
                id="table-number"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., 1, A1, VIP-1, Table-2"
              />
              <p className="text-xs text-black mt-1">
                Spaces will be automatically converted to hyphens
              </p>
            </div>

            <div>
              <label
                htmlFor="table-capacity"
                className="block text-sm font-medium text-black mb-1"
              >
                Capacity *
              </label>
              <input
                id="table-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg text-black"
                required
                min="1"
                max="20"
              />
            </div>

            <div>
              <label
                htmlFor="table-location"
                className="block text-sm font-medium text-black mb-1"
              >
                Location
              </label>
              <select
                id="table-location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2 border rounded-lg text-black"
              >
                <option value="">No location assigned</option>
                {activeLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.tableCount} tables)
                  </option>
                ))}
              </select>
              {activeLocations.length === 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Create a location first to assign tables
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="table-status"
                className="block text-sm font-medium text-black mb-1"
              >
                Initial Status
              </label>
              <select
                id="table-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                {loading ? "Creating..." : "Create Table"}
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
  locations,
  onClose,
  onSubmit,
  loading,
}: {
  table: Table;
  locations: Location[];
  onClose: () => void;
  onSubmit: (data: Partial<Table>) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    number: table.number,
    capacity: table.capacity,
    locationId: table.locationId || "",
    status: table.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number.trim()) {
      showToast.warning("Table number is required");
      return;
    }

    const updateData = {
      number: formData.number.trim(),
      capacity: formData.capacity,
      locationId: formData.locationId || undefined,
      status: formData.status as
        | "available"
        | "occupied"
        | "reserved"
        | "cleaning",
    };

    onSubmit(updateData);
  };

  const activeLocations = locations.filter((loc) => loc.isActive);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Edit Table {table.number}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="edit-table-number"
                className="block text-sm font-medium text-black mb-1"
              >
                Table Number *
              </label>
              <input
                id="edit-table-number"
                type="text"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-black"
                required
                placeholder="e.g., 1, A1, VIP-1"
              />
            </div>

            <div>
              <label
                htmlFor="edit-table-capacity"
                className="block text-sm font-medium text-black mb-1"
              >
                Capacity *
              </label>
              <input
                id="edit-table-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-lg text-black"
                required
                min="1"
                max="20"
              />
            </div>

            <div>
              <label
                htmlFor="edit-table-location"
                className="block text-sm font-medium text-black mb-1"
              >
                Location
              </label>
              <select
                id="edit-table-location"
                value={formData.locationId}
                onChange={(e) =>
                  setFormData({ ...formData, locationId: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-black"
              >
                <option value="">No location assigned</option>
                {activeLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.tableCount} tables)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-table-status"
                className="block text-sm font-medium text-black mb-1"
              >
                Status
              </label>
              <select
                id="edit-table-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "available"
                      | "occupied"
                      | "reserved"
                      | "cleaning",
                  })
                }
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
                {loading ? "Updating..." : "Update Table"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
