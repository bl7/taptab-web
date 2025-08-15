# Menu Item Availability Integration Guide

## Overview

This guide explains how to integrate menu item availability across your TapTab webapp for order taking, menu views, and public ordering.

## 🚀 Quick Start

### 1. Initialize the System

```tsx
// In your main App component or layout
import { availabilityInitializer } from '@/lib/availability-initializer';

function App() {
  useEffect(() => {
    // Initialize availability system
    availabilityInitializer.initialize(localStorage.getItem('token') || '');

    return () => {
      availabilityInitializer.disconnect();
    };
  }, []);

  return (/* Your app components */);
}
```

### 2. Use the MenuItemCard Component

```tsx
import MenuItemCard from "@/components/menu/MenuItemCard";

const MyMenu = () => {
  const handleAddToOrder = (itemId: string) => {
    // Handle adding item to order
    console.log("Adding item:", itemId);
  };

  return (
    <MenuItemCard
      item={{
        id: "item_1",
        name: "Burger",
        description: "Delicious beef burger",
        price: 12.99,
        image: "/burger.jpg",
      }}
      onAddToOrder={handleAddToOrder}
      showAvailability={true}
    />
  );
};
```

## 📚 Available Components

### MenuItemCard

- Displays menu items with availability status
- Automatically handles unavailable items
- Responsive design with Tailwind CSS

### OrderItemSelector

- Filters items by availability for order taking
- Includes search and category filtering
- Only shows available items

### PublicMenu

- Public-facing menu with availability
- Shopping cart functionality
- Real-time availability updates

## 🔧 Hooks and Utilities

### useItemAvailability

```tsx
import { useItemAvailability } from "@/lib/use-availability-guard";

const MyComponent = ({ itemId }: { itemId: string }) => {
  const { isAvailable, isUnavailable } = useItemAvailability(itemId);

  return <div>{isAvailable ? "✅ Available" : "❌ Out of Stock"}</div>;
};
```

### useBulkAvailability

```tsx
import { useBulkAvailability } from "@/lib/use-availability-guard";

const MyComponent = ({ itemIds }: { itemIds: string[] }) => {
  const { availableItems, unavailableItems, allAvailable } =
    useBulkAvailability(itemIds);

  return (
    <div>
      <p>{availableItems.length} items available</p>
      <p>{unavailableItems.length} items out of stock</p>
    </div>
  );
};
```

### useAvailabilityGuard

```tsx
import { useAvailabilityGuard } from "@/lib/use-availability-guard";

const MyComponent = ({ itemIds }: { itemIds: string[] }) => {
  const { isChecking, hasUnavailableItems, allItemsAvailable } =
    useAvailabilityGuard(itemIds);

  if (isChecking) return <div>Checking availability...</div>;
  if (hasUnavailableItems) return <div>Some items unavailable</div>;

  return <div>All items available!</div>;
};
```

## 🔌 WebSocket Integration

### With Existing WebSocket

```tsx
// Integrate with your existing WebSocket connection
const wsConnection = /* your existing WebSocket */;
availabilityInitializer.integrateWithExistingWebSocket(wsConnection);
```

### Standalone WebSocket

```tsx
// The system will create its own WebSocket connection
availabilityInitializer.initialize(token);
```

## 📊 Store Management

### Direct Store Access

```tsx
import { useMenuAvailabilityStore } from "@/lib/menu-availability-store";

const MyComponent = () => {
  const setItemAvailability = useMenuAvailabilityStore(
    (state) => state.setItemAvailability
  );
  const isItemAvailable = useMenuAvailabilityStore(
    (state) => state.isItemAvailable
  );

  // Update availability
  setItemAvailability("item_1", false);

  // Check availability
  const available = isItemAvailable("item_1");
};
```

### Bulk Operations

```tsx
const setBulkAvailability = useMenuAvailabilityStore(
  (state) => state.setBulkAvailability
);

// Update multiple items at once
setBulkAvailability([
  { id: "item_1", available: true, lastUpdated: new Date() },
  { id: "item_2", available: false, lastUpdated: new Date() },
]);
```

## 🎨 Styling

### CSS Classes

The system includes pre-built CSS classes for availability states:

- `.availability-badge.available` - Green badge for available items
- `.availability-badge.unavailable` - Red badge for unavailable items
- `.menu-item-card.unavailable` - Styling for unavailable items
- `.out-of-stock-overlay` - Overlay for out-of-stock items

### Custom Styling

```css
/* Custom availability badge */
.custom-availability-badge {
  @apply px-3 py-1 rounded-lg font-semibold;
}

.custom-availability-badge.available {
  @apply bg-emerald-500 text-white;
}

.custom-availability-badge.unavailable {
  @apply bg-rose-500 text-white;
}
```

## 🔄 Real-time Updates

### WebSocket Events

The system listens for these WebSocket events:

```typescript
{
  type: "MENU_ITEM_AVAILABILITY_UPDATE",
  payload: {
    itemId: "item_123",
    available: false
  }
}
```

### Manual Updates

```tsx
// Update availability manually (useful for testing)
availabilityInitializer.updateItemAvailability("item_1", false);
```

## 📱 Mobile Optimization

### Touch-Friendly Design

- Large touch targets for buttons
- Swipe gestures for category navigation
- Responsive grid layouts

### Performance

- Lazy loading of images
- Debounced search input
- Optimized re-renders

## 🧪 Testing

### Test Data

```tsx
// Create test items
const testItems = [
  { id: "test_1", name: "Test Item 1", available: true },
  { id: "test_2", name: "Test Item 2", available: false },
];

// Update availability
testItems.forEach((item) => {
  availabilityInitializer.updateItemAvailability(item.id, item.available);
});
```

### Debug Information

```tsx
// Get system status
const status = availabilityInitializer.getAvailabilityStatus();
console.log("Availability Status:", status);
```

## 🚨 Error Handling

### Network Issues

- Automatic reconnection with exponential backoff
- Fallback to cached availability data
- User-friendly error messages

### Data Validation

- Type checking for availability updates
- Fallback values for missing data
- Graceful degradation

## 🔒 Security

### Authentication

- JWT token validation
- Role-based access control
- Secure WebSocket connections

### Data Protection

- Input sanitization
- XSS prevention
- CSRF protection

## 📈 Performance Tips

1. **Batch Updates**: Use `setBulkAvailability` for multiple items
2. **Memoization**: Memoize expensive availability checks
3. **Lazy Loading**: Load availability data on demand
4. **Caching**: Leverage the built-in availability cache

## 🆘 Troubleshooting

### Common Issues

1. **Items not updating**: Check WebSocket connection status
2. **Performance issues**: Verify bulk operations usage
3. **Styling problems**: Ensure CSS classes are loaded
4. **WebSocket errors**: Check authentication and connection

### Debug Mode

```tsx
// Enable debug logging
localStorage.setItem("debug", "true");

// Check console for detailed logs
```

## 📞 Support

For issues or questions:

1. Check the console for error messages
2. Verify WebSocket connection status
3. Review the integration examples
4. Check network requests in DevTools

---

This availability system provides a robust foundation for managing menu item availability across your entire webapp, ensuring a consistent and reliable user experience.
