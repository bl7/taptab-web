import { useEffect, useState } from "react";
import { useMenuAvailabilityStore } from "./menu-availability-store";

export const useAvailabilityGuard = (itemIds: string[]) => {
  const [isChecking, setIsChecking] = useState(true);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const isItemAvailable = useMenuAvailabilityStore(
    (state) => state.isItemAvailable
  );

  useEffect(() => {
    const checkAvailability = () => {
      const unavailable = itemIds.filter((id) => !isItemAvailable(id));
      setUnavailableItems(unavailable);
      setIsChecking(false);
    };

    checkAvailability();
  }, [itemIds, isItemAvailable]);

  return {
    isChecking,
    unavailableItems,
    hasUnavailableItems: unavailableItems.length > 0,
    allItemsAvailable: unavailableItems.length === 0,
  };
};

// Hook for checking single item availability
export const useItemAvailability = (itemId: string) => {
  const isAvailable = useMenuAvailabilityStore((state) =>
    state.isItemAvailable(itemId)
  );

  return {
    isAvailable,
    isUnavailable: !isAvailable,
  };
};

// Hook for bulk availability operations
export const useBulkAvailability = (itemIds: string[]) => {
  const getAvailableItems = useMenuAvailabilityStore(
    (state) => state.getAvailableItems
  );
  const getUnavailableItems = useMenuAvailabilityStore(
    (state) => state.getUnavailableItems
  );

  return {
    availableItems: getAvailableItems(itemIds),
    unavailableItems: getUnavailableItems(itemIds),
    allAvailable: getAvailableItems(itemIds).length === itemIds.length,
    hasUnavailable: getUnavailableItems(itemIds).length > 0,
  };
};
