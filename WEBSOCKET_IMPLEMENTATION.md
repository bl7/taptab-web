# WebSocket Implementation for Real-time Receipt Printing

## Overview

This implementation provides real-time receipt printing functionality using WebSocket connections. Only users with `TENANT_ADMIN` and `KITCHEN` roles will receive print notifications.

## Features

- ✅ Real-time WebSocket connection with JWT authentication
- ✅ Automatic receipt printing for new orders
- ✅ Role-based access control
- ✅ Connection status monitoring
- ✅ Retry logic with exponential backoff
- ✅ Test print functionality
- ✅ Professional receipt formatting

## Files Created

### Core Implementation
- `src/lib/receipt-printer.ts` - Main WebSocket and printing logic
- `src/lib/use-receipt-printer.ts` - React hook for WebSocket management
- `src/lib/print-permissions.ts` - Role-based permission utilities
- `src/components/WebSocketStatus.tsx` - UI component for connection status

### Integration
- Updated `src/app/dashboard/layout.tsx` - Added WebSocket status component
- Updated `src/app/bossdashboard/layout.tsx` - Added WebSocket status component

## How It Works

### 1. WebSocket Connection
```typescript
// Connect to WebSocket server
const printer = new ReceiptPrinter();
printer.connect(jwtToken);
```

### 2. Event Handling
The backend sends `newOrder` events with this structure:
```typescript
{
  type: 'PRINT_RECEIPT',
  order: {
    id: 'order_1754136443972_spe71',
    orderNumber: 'ORD-1754136443972',
    tableNumber: '10',
    totalAmount: 2.5,
    finalAmount: 2.5,
    status: 'PENDING',
    customerName: 'Test Customer',
    customerPhone: '1234567890',
    items: [
      {
        id: 'oi_1754136444273_hzk6i',
        menuItemId: 'item_1754121213685_fhtow',
        menuItemName: 'Coca Cola',
        quantity: 1,
        price: 2.5,
        total: 2.5,
        notes: 'Extra ice please'
      }
    ],
    createdAt: '2025-08-02T12:07:23.972Z',
    updatedAt: '2025-08-02T12:07:23.972Z'
  },
  timestamp: '2025-08-02T12:07:24.479Z'
}
```

### 3. Receipt Printing
When a `newOrder` event is received:
1. Check if `data.type === 'PRINT_RECEIPT'`
2. Extract order data from `data.order`
3. Generate professional receipt HTML
4. Open print dialog automatically

## Role-Based Access Control

### Users Who Receive Print Notifications
- ✅ **TENANT_ADMIN**: Restaurant owner/admin
- ✅ **KITCHEN**: Kitchen staff

### Users Who Do NOT Receive Print Notifications
- ❌ **MANAGER**: Restaurant manager
- ❌ **CASHIER**: Cashier staff
- ❌ **WAITER**: Waiter staff
- ❌ **READONLY**: Read-only user
- ❌ **SUPER_ADMIN**: System administrator

## Usage

### React Component Integration
```typescript
import { WebSocketStatus } from '@/components/WebSocketStatus';

function Dashboard() {
  const jwtToken = localStorage.getItem('token');
  const userRole = 'TENANT_ADMIN'; // Get from user data

  return (
    <div>
      {/* Your dashboard content */}
      <WebSocketStatus jwtToken={jwtToken} userRole={userRole} />
    </div>
  );
}
```

### Manual WebSocket Management
```typescript
import { ReceiptPrinter } from '@/lib/receipt-printer';
import { useReceiptPrinter } from '@/lib/use-receipt-printer';

function MyComponent() {
  const { connect, disconnect, testPrint, isConnected } = useReceiptPrinter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connect(token);
    }

    return () => disconnect();
  }, []);

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <button onClick={testPrint}>Test Print</button>
    </div>
  );
}
```

## WebSocket Status Component

The `WebSocketStatus` component displays:
- Connection status (🟢 Connected, 🟡 Connecting, 🔴 Error, ⚪ Disconnected)
- User role and permissions
- Test print button (when connected)
- Retry connection button (when error)

### Status Indicators
- **🟢 Connected**: WebSocket is active and ready for print notifications
- **🟡 Connecting**: Attempting to establish WebSocket connection
- **🔴 Error**: Connection failed, retry available
- **⚪ Disconnected**: No active connection
- **🔕 No notifications**: User role doesn't have print permissions

## Testing

### Test Print Function
```typescript
const printer = new ReceiptPrinter();
printer.testPrint(); // Prints a sample receipt
```

### Debug Connected Users
```bash
# Check who's connected (admin endpoint)
curl http://localhost:5050/api/debug/connected-users
```

## Configuration

### WebSocket Server URL
Default: `http://localhost:5050`

To change the WebSocket server URL:
```typescript
// In receipt-printer.ts
this.socket = io('YOUR_WEBSOCKET_URL', {
  transports: ['websocket', 'polling']
});
```

### Environment Variables
```bash
# .env.local
REACT_APP_WEBSOCKET_URL=http://localhost:5050
```

## Error Handling

### Connection Retry Logic
- Maximum 5 retry attempts
- Exponential backoff (2s, 4s, 6s, 8s, 10s)
- Automatic reconnection on network changes

### Authentication Errors
- JWT token validation
- Automatic token refresh handling
- Graceful fallback for invalid tokens

## Production Considerations

### Security
- Use HTTPS in production
- Validate JWT tokens
- Handle token expiration
- Implement rate limiting

### Performance
- Connection pooling
- Multiple browser tab handling
- Network change detection
- Memory leak prevention

### Monitoring
- Connection status logging
- Error tracking
- Print success/failure metrics
- User activity monitoring

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check WebSocket server is running
   - Verify JWT token is valid
   - Check network connectivity

2. **No Print Notifications**
   - Verify user role has print permissions
   - Check JWT token contains correct role
   - Ensure backend is sending events

3. **Print Dialog Not Opening**
   - Check browser popup blockers
   - Verify print permissions
   - Test with manual print function

### Debug Commands
```javascript
// Check WebSocket connection
console.log('Connected:', printer.getConnectionStatus());

// Test print manually
printer.testPrint();

// Check user permissions
import { shouldReceivePrintNotifications } from '@/lib/print-permissions';
console.log('Can receive prints:', shouldReceivePrintNotifications('TENANT_ADMIN'));
```

## API Reference

### ReceiptPrinter Class
```typescript
class ReceiptPrinter {
  connect(jwtToken: string): void
  disconnect(): void
  getConnectionStatus(): boolean
  testPrint(): void
  printReceipt(orderData: OrderData): void
}
```

### useReceiptPrinter Hook
```typescript
const {
  connect,
  disconnect,
  testPrint,
  isConnected,
  connectionStatus,
  printer
} = useReceiptPrinter();
```

### Permission Utilities
```typescript
shouldReceivePrintNotifications(role: string): boolean
getPrintPermissionDescription(role: string): string
getRolePermissions(): object
```

## Summary

This implementation provides a complete real-time receipt printing solution with:
- Secure WebSocket connections with JWT authentication
- Role-based access control
- Professional receipt formatting
- Automatic printing functionality
- Comprehensive error handling
- User-friendly status monitoring

The system automatically handles new orders and prints receipts for authorized users (TENANT_ADMIN and KITCHEN roles) while providing clear feedback about connection status and permissions. 