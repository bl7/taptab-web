import { useEffect, useCallback } from "react";
import { useMenuAvailabilityStore } from "./menu-availability-store";

interface GlobalReceiptPrinter {
  onAvailabilityChange?: (
    callback: (payload: {
      itemId: string;
      available: boolean;
      itemName: string;
      tenantId: string;
    }) => void
  ) => void;
}

interface WindowWithReceiptPrinter extends Window {
  globalReceiptPrinter?: GlobalReceiptPrinter;
}

// This hook integrates with your existing WebSocket infrastructure
// to handle real-time menu item availability updates
export const useAvailabilityWebSocket = () => {
  const setItemAvailability = useMenuAvailabilityStore(
    (state) => state.setItemAvailability
  );

  // Handle availability updates from WebSocket
  const handleAvailabilityUpdate = useCallback(
    (payload: {
      itemId: string;
      available: boolean;
      itemName: string;
      tenantId: string;
    }) => {
      console.log("🔄 Availability update received:", payload);

      // Update the availability store
      setItemAvailability(payload.itemId, payload.available);

      // You can add additional logic here like:
      // - Show toast notifications
      // - Update UI components
      // - Trigger re-renders
      // - Log to analytics
    },
    [setItemAvailability]
  );

  // Initialize WebSocket integration when component mounts
  useEffect(() => {
    // Import the receipt printer dynamically to avoid circular dependencies
    import("./receipt-printer").then(() => {
      // Get the global instance if it exists
      const globalReceiptPrinter = (window as WindowWithReceiptPrinter)
        .globalReceiptPrinter;

      if (globalReceiptPrinter?.onAvailabilityChange) {
        console.log(
          "🔗 Connecting availability WebSocket to existing infrastructure"
        );

        // Set up the availability change callback
        globalReceiptPrinter.onAvailabilityChange(handleAvailabilityUpdate);

        console.log("✅ Availability WebSocket integration complete");
      } else {
        console.log(
          "⚠️ Global receipt printer not found, availability updates will not work"
        );
      }
    });

    // Cleanup function
    return () => {
      // Cleanup will be handled by the receipt printer when it disconnects
      console.log("🧹 Cleaning up availability WebSocket integration");
    };
  }, [handleAvailabilityUpdate]);

  return {
    // Expose methods for manual availability updates if needed
    updateAvailability: setItemAvailability,
  };
};
