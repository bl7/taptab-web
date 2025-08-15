import { useMenuAvailabilityStore } from "./menu-availability-store";
import { AvailabilityWebSocketService } from "./availability-websocket";

export class AvailabilityInitializer {
  private wsService: AvailabilityWebSocketService;
  private initialized: boolean = false;

  constructor() {
    this.wsService = new AvailabilityWebSocketService();
  }

  async initialize() {
    if (this.initialized) {
      console.log("🔄 Availability system already initialized");
      return;
    }

    try {
      console.log("🚀 Initializing menu availability system...");

      // Initialize availability data
      await this.initializeAvailability();

      // Set up WebSocket for real-time updates
      this.wsService.connect();

      this.initialized = true;
      console.log("✅ Menu availability system initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize availability system:", error);
    }
  }

  private async initializeAvailability() {
    try {
      // Fetch initial availability data
      const response = await fetch("/api/v1/menu/items");
      const data = await response.json();

      if (data.success) {
        const availabilityData = data.data.items.map(
          (item: { id: string; available: boolean }) => ({
            id: item.id,
            available: item.available,
            lastUpdated: new Date(),
          })
        );

        // Update the store with initial data
        useMenuAvailabilityStore
          .getState()
          .setBulkAvailability(availabilityData);

        console.log(
          `📊 Loaded availability for ${availabilityData.length} menu items`
        );
      }
    } catch (error) {
      console.error("Failed to initialize availability:", error);
    }
  }

  // Method to integrate with existing WebSocket infrastructure
  integrateWithExistingWebSocket(wsConnection: {
    on: (event: string, callback: (data: unknown) => void) => void;
  }) {
    if (wsConnection && wsConnection.on) {
      // Listen for availability updates from existing WebSocket
      wsConnection.on("menuItemAvailabilityUpdate", (data: unknown) => {
        const typedData = data as {
          payload?: {
            itemId: string;
            available: boolean;
            itemName: string;
            tenantId: string;
          };
        };
        this.wsService.handleMessage({
          type: "MENU_ITEM_AVAILABILITY_UPDATE",
          payload: typedData.payload,
        });
      });

      console.log(
        "🔗 Integrated availability with existing WebSocket connection"
      );
    }
  }

  // Method to manually update availability (useful for testing)
  updateItemAvailability(itemId: string, available: boolean) {
    this.wsService.updateAvailability(itemId, available);
  }

  // Method to get current availability status
  getAvailabilityStatus() {
    const store = useMenuAvailabilityStore.getState();
    const totalItems = store.availabilityMap.size;
    const availableItems = Array.from(store.availabilityMap.values()).filter(
      (item) => item.available
    ).length;

    return {
      totalItems,
      availableItems,
      unavailableItems: totalItems - availableItems,
      initialized: this.initialized,
    };
  }

  // Method to clear availability data
  clearAvailability() {
    useMenuAvailabilityStore.getState().clearAvailability();
    this.initialized = false;
    console.log("🧹 Availability data cleared");
  }

  // Method to disconnect
  disconnect() {
    this.wsService.disconnect();
    this.initialized = false;
    console.log("🔌 Availability system disconnected");
  }
}

// Export singleton instance
export const availabilityInitializer = new AvailabilityInitializer();
