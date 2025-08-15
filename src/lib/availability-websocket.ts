import { useMenuAvailabilityStore } from "./menu-availability-store";

export class AvailabilityWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      // Use the same WebSocket connection as your existing receipt printer
      // This will be integrated with your existing WebSocket infrastructure
      console.log("🔌 Connecting to availability WebSocket...");

      // For now, we'll set up the message handler
      // You can integrate this with your existing WebSocket connection
      this.setupMessageHandlers();
    } catch (error) {
      console.error("Failed to connect to availability WebSocket:", error);
      this.scheduleReconnect();
    }
  }

  private setupMessageHandlers() {
    // This will be called when your existing WebSocket receives messages
    // You can integrate this with your existing WebSocket setup
    console.log("📡 Availability message handlers configured");
  }

  handleMessage(data: {
    type: string;
    payload?: { itemId: string; available: boolean };
  }) {
    try {
      if (data.type === "MENU_ITEM_AVAILABILITY_UPDATE" && data.payload) {
        const { itemId, available } = data.payload;
        console.log(
          `🔄 Updating availability for item ${itemId}: ${available}`
        );

        useMenuAvailabilityStore
          .getState()
          .setItemAvailability(itemId, available);
      }
    } catch (error) {
      console.error("Error handling availability message:", error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);

      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.reconnectDelay = 3000;
    console.log("🔌 Availability WebSocket disconnected");
  }

  // Method to manually update availability (useful for testing)
  updateAvailability(itemId: string, available: boolean) {
    useMenuAvailabilityStore.getState().setItemAvailability(itemId, available);
  }
}
