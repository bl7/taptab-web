import { create } from "zustand";
import {
  LayoutObject,
  LayoutState,
  LayoutActions,
  ObjectType,
  CANVAS_CONFIG,
} from "@/types/layout";

interface LayoutStore extends LayoutState, LayoutActions {}

export const useLayoutStore = create<LayoutStore>((set) => ({
  // State
  objects: [],
  selectedObjectId: null,
  currentLocation: "Main Floor", // Default location
  availableLocations: ["Main Floor"],
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartPos: null,

  // Actions
  addObject: (object: LayoutObject) => {
    set((state) => ({
      objects: [...state.objects, object],
      selectedObjectId: object.id,
    }));
  },

  updateObject: (id: string, updates: Partial<LayoutObject>) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    }));
  },

  deleteObject: (id: string) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObjectId:
        state.selectedObjectId === id ? null : state.selectedObjectId,
    }));
  },

  selectObject: (id: string | null) => {
    set({ selectedObjectId: id });
  },

  setZoom: (zoom: number) => {
    const clampedZoom = Math.max(
      CANVAS_CONFIG.MIN_ZOOM,
      Math.min(CANVAS_CONFIG.MAX_ZOOM, zoom)
    );
    set({ zoom: clampedZoom });
  },

  setPan: (x: number, y: number) => {
    set({ panX: x, panY: y });
  },

  setDragging: (isDragging: boolean, pos?: { x: number; y: number }) => {
    set({
      isDragging,
      dragStartPos: isDragging && pos ? pos : null,
    });
  },

  clearLayout: () => {
    set({
      objects: [],
      selectedObjectId: null,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  loadLayout: (objects: LayoutObject[]) => {
    set({
      objects,
      selectedObjectId: null,
    });
  },

  setCurrentLocation: (location: string) => {
    set({ currentLocation: location });
  },

  setAvailableLocations: (locations: string[]) => {
    set({ availableLocations: locations });
  },

  loadLayoutForLocation: (location: string, objects: LayoutObject[]) => {
    set({
      currentLocation: location,
      objects,
      selectedObjectId: null,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  // Backend API integration methods
  saveLayoutToBackend: async (layoutName: string, description?: string) => {
    const { api } = await import("@/lib/api");
    const state = useLayoutStore.getState();

    // Find location ID by name
    const locations = await api.getLocations();
    const location = locations.locations.find(
      (loc) => loc.name === state.currentLocation
    );

    if (!location) {
      throw new Error(`Location "${state.currentLocation}" not found`);
    }

    const layoutJson = {
      type: "freeform" as const,
      dimensions: {
        width: 800,
        height: 600,
        gridSize: CANVAS_CONFIG.GRID_SIZE,
      },
      tables: state.objects
        .filter((obj) => obj.isExistingTable)
        .map((obj) => ({
          tableId: obj.tableId || obj.id,
          position: { x: obj.x, y: obj.y },
          size: { width: obj.width, height: obj.height },
          shape: obj.shape || ("round" as const),
          seats: obj.seats || 4,
          rotation: obj.rotation || 0,
        })),
      objects: state.objects
        .filter((obj) => !obj.isExistingTable)
        .map((obj) => ({
          type: obj.type,
          position: { x: obj.x, y: obj.y },
          size: { width: obj.width, height: obj.height },
          color: obj.color,
          name: obj.name,
        })),
      metadata: {
        version: "1.0",
        createdBy: "layout-builder",
      },
    };

    try {
      const result = await api.createTableLayout({
        name: layoutName,
        description,
        locationId: location.id,
        layoutJson,
        isActive: true,
        isDefault: false,
      });

      console.log("Layout saved to backend:", result);
      return result;
    } catch (error) {
      console.error("Failed to save layout to backend:", error);
      throw error;
    }
  },

  loadLayoutFromBackend: async (layoutId: string) => {
    const { api } = await import("@/lib/api");

    try {
      const result = await api.getTableLayout(layoutId);
      const layout = result.layout;

      // Convert backend format to frontend objects
      const objects: LayoutObject[] = [];

      // Add table objects
      if (layout.layoutJson.tables) {
        layout.layoutJson.tables.forEach((table) => {
          objects.push({
            id: table.tableId,
            type: "existing_table",
            x: table.position.x,
            y: table.position.y,
            width: table.size.width,
            height: table.size.height,
            rotation: table.rotation,
            color: "#3b82f6",
            name: `Table ${table.tableId}`,
            seats: table.seats,
            shape: table.shape,
            isExistingTable: true,
            tableId: table.tableId,
          });
        });
      }

      // Add furniture objects
      if (layout.layoutJson.objects) {
        layout.layoutJson.objects.forEach((obj, index) => {
          objects.push({
            id: `obj_${index}`,
            type: obj.type as ObjectType,
            x: obj.position.x,
            y: obj.position.y,
            width: obj.size.width,
            height: obj.size.height,
            rotation: 0,
            color: (obj.color as string) || "#6b7280",
            name: (obj.name as string) || obj.type,
            isExistingTable: false,
          });
        });
      }

      // Update store state
      set(() => ({
        objects,
        selectedObjectId: null,
        currentLocation: layout.locationDetails?.name || "Main Floor",
      }));

      console.log("Layout loaded from backend:", layout);
      return layout;
    } catch (error) {
      console.error("Failed to load layout from backend:", error);
      throw error;
    }
  },
}));

// Helper functions
export const getSelectedObject = (): LayoutObject | null => {
  const { objects, selectedObjectId } = useLayoutStore.getState();
  return objects.find((obj) => obj.id === selectedObjectId) || null;
};

export const generateObjectId = (): string => {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
