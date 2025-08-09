import { create } from "zustand";
import {
  LayoutObject,
  LayoutState,
  LayoutActions,
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
}));

// Helper functions
export const getSelectedObject = (): LayoutObject | null => {
  const { objects, selectedObjectId } = useLayoutStore.getState();
  return objects.find((obj) => obj.id === selectedObjectId) || null;
};

export const generateObjectId = (): string => {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
