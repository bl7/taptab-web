import { create } from "zustand";

interface MenuItemAvailability {
  id: string;
  available: boolean;
  lastUpdated: Date;
}

interface MenuAvailabilityStore {
  availabilityMap: Map<string, MenuItemAvailability>;
  setItemAvailability: (id: string, available: boolean) => void;
  setBulkAvailability: (items: MenuItemAvailability[]) => void;
  isItemAvailable: (id: string) => boolean;
  getAvailableItems: (itemIds: string[]) => string[];
  getUnavailableItems: (itemIds: string[]) => string[];
  clearAvailability: () => void;
}

export const useMenuAvailabilityStore = create<MenuAvailabilityStore>(
  (set, get) => ({
    availabilityMap: new Map(),

    setItemAvailability: (id: string, available: boolean) => {
      set((state) => {
        const newMap = new Map(state.availabilityMap);
        newMap.set(id, { id, available, lastUpdated: new Date() });
        return { availabilityMap: newMap };
      });
    },

    setBulkAvailability: (items: MenuItemAvailability[]) => {
      set((state) => {
        const newMap = new Map(state.availabilityMap);
        items.forEach((item) => {
          newMap.set(item.id, item);
        });
        return { availabilityMap: newMap };
      });
    },

    isItemAvailable: (id: string) => {
      const state = get();
      return state.availabilityMap.get(id)?.available ?? true;
    },

    getAvailableItems: (itemIds: string[]) => {
      const state = get();
      return itemIds.filter((id) => state.isItemAvailable(id));
    },

    getUnavailableItems: (itemIds: string[]) => {
      const state = get();
      return itemIds.filter((id) => !state.isItemAvailable(id));
    },

    clearAvailability: () => {
      set({ availabilityMap: new Map() });
    },
  })
);
