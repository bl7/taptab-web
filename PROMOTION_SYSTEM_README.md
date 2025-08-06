# TapTab Promotion System Frontend Implementation

This document outlines the complete frontend implementation of the promotion system for TapTab, providing comprehensive promotion management and order integration capabilities.

## 🚀 Features Implemented

### 1. Admin Dashboard

- **Promotion Management**: Full CRUD operations for promotions
- **Analytics Dashboard**: Real-time promotion performance metrics
- **Bulk Operations**: Manage multiple promotions simultaneously
- **Advanced Filtering**: Search and filter promotions by various criteria

### 2. Order Integration

- **Real-time Preview**: Live calculation of promotion discounts
- **Promo Code Support**: Manual promo code entry and validation
- **Auto-apply Promotions**: Automatic application of eligible promotions
- **Detailed Breakdown**: Clear order summary with promotion details

### 3. Promotion Types Supported

- Cart Discounts (percentage/fixed amount)
- Item-specific Discounts
- Buy One Get One (BOGO) offers
- Combo Deals
- Fixed Price promotions
- Time-based promotions
- Coupon codes

## 📁 File Structure

```
src/
├── interfaces/
│   └── promotion.ts              # TypeScript interfaces and types
├── lib/
│   ├── promotion-api.ts          # API service layer
│   └── use-promotions.ts         # Custom React hooks
├── components/
│   └── promotion/
│       ├── index.ts              # Export file
│       ├── PromotionForm.tsx     # Promotion creation/editing form
│       ├── PromotionsList.tsx    # Promotion listing with filters
│       ├── PromotionAnalytics.tsx # Analytics dashboard
│       └── OrderPromotions.tsx   # Order integration component
├── app/
│   └── dashboard/
│       └── promotions/
│           └── page.tsx          # Main promotions page
└── app/
    └── globals.css               # Promotion-specific styles
```

## 🔧 Key Components

### PromotionForm

Complete form for creating and editing promotions with:

- Basic information (name, description, type)
- Discount configuration (percentage, fixed amount, etc.)
- Conditions (minimum cart value, usage limits)
- Time-based restrictions
- Promo code settings
- Item selection for targeted promotions

### PromotionsList

Advanced table view with:

- Real-time filtering and search
- Pagination support
- Bulk operations
- Status indicators
- Quick actions (edit, toggle, duplicate, delete)

### PromotionAnalytics

Performance dashboard featuring:

- Summary cards with key metrics
- Detailed analytics table
- Top performing promotions
- Custom date range filtering

### OrderPromotions

Order integration component providing:

- Available promotions display
- Promo code input and validation
- Real-time promotion preview
- Order summary with discounts

## 🎯 API Integration

### Promotion Management

```typescript
import { PromotionAPI } from "@/lib/promotion-api";

// Get all promotions
const promotions = await PromotionAPI.getPromotions({
  active: true,
  type: "CART_DISCOUNT",
});

// Create new promotion
const newPromotion = await PromotionAPI.createPromotion({
  name: "Summer Sale",
  type: "CART_DISCOUNT",
  discountType: "PERCENTAGE",
  discountValue: 20,
});
```

### Order Integration

```typescript
import { OrderAPI } from "@/lib/promotion-api";

// Preview promotions for cart
const preview = await OrderAPI.previewPromotions({
  items: cartItems,
  tenantSlug: "restaurant-abc",
  promoCodes: ["SUMMER20"],
});

// Create order with promotions
const order = await OrderAPI.createOrderWithPromotions(orderData, tenantSlug);
```

## 🎨 Styling

The promotion system includes comprehensive CSS styling in `globals.css` with:

- Modern, responsive design
- Consistent color scheme
- Interactive elements with hover states
- Loading states and animations
- Mobile-first responsive breakpoints

### Key Style Classes

- `.promotion-form` - Form styling
- `.promotions-page` - Dashboard layout
- `.order-promotions` - Order integration styles
- `.promotion-card` - Promotion display cards
- `.summary-line` - Order summary lines

## 🔗 React Hooks

### usePromotions

Main hook for promotion management:

```typescript
const {
  promotions,
  loading,
  error,
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = usePromotions();
```

### usePromotionPreview

Real-time promotion preview:

```typescript
const { preview, loading, previewPromotions } = usePromotionPreview(tenantSlug);
```

### usePromoCodeValidation

Promo code validation:

```typescript
const { validatePromoCode, loading } = usePromoCodeValidation(tenantSlug);
```

## 🚀 Usage Examples

### Adding Promotions Page to Dashboard

```typescript
// Add to your dashboard navigation
import PromotionsPage from "@/app/dashboard/promotions/page";

// Route: /dashboard/promotions
```

### Integrating with Order Flow

```typescript
import { OrderPromotions } from "@/components/promotion";

function OrderPage({ tenantSlug, cart, customer }) {
  const [promotionPreview, setPromotionPreview] = useState(null);
  const [appliedPromoCodes, setAppliedPromoCodes] = useState([]);

  return (
    <div>
      {/* Your existing order components */}

      <OrderPromotions
        tenantSlug={tenantSlug}
        cart={cart}
        customer={customer}
        onPromotionsUpdate={setPromotionPreview}
        appliedPromoCodes={appliedPromoCodes}
        onPromoCodesUpdate={setAppliedPromoCodes}
      />

      {/* Order submit button */}
    </div>
  );
}
```

## 🔄 Backend Integration

The frontend expects the following API endpoints:

### Promotion Management

- `GET /api/v1/promotions` - List promotions
- `POST /api/v1/promotions` - Create promotion
- `PUT /api/v1/promotions/:id` - Update promotion
- `DELETE /api/v1/promotions/:id` - Delete promotion
- `POST /api/v1/promotions/validate` - Validate promo code
- `GET /api/v1/promotions/analytics` - Get analytics

### Order Integration

- `POST /api/v1/orders/preview-promotions` - Preview promotions
- `GET /api/v1/orders/available-promotions` - Get available promotions
- `POST /api/v1/public/orders` - Create order with promotions

## 📱 Responsive Design

The implementation is fully responsive with:

- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🛠 Installation & Setup

1. All files are already created in the correct locations
2. Styles are added to `globals.css`
3. Components are ready to use
4. TypeScript interfaces are defined

### Dependencies

The implementation uses existing project dependencies:

- React & Next.js
- TypeScript
- CSS (no additional styling libraries needed)
- Lodash (for debouncing)

## 🎯 Next Steps

1. **Backend Integration**: Ensure backend APIs match the expected interface
2. **Testing**: Add unit tests for components and hooks
3. **Error Handling**: Enhance error handling with toast notifications
4. **Performance**: Add React.memo and useMemo optimizations as needed
5. **Accessibility**: Add ARIA labels and keyboard navigation support

## 🤝 Contributing

When extending the promotion system:

1. Follow the established patterns in existing components
2. Add proper TypeScript types
3. Include comprehensive error handling
4. Update this documentation

## 📋 Checklist

- ✅ Promotion interfaces and types
- ✅ API service layer
- ✅ Custom React hooks
- ✅ Promotion form component
- ✅ Promotions list with filtering
- ✅ Analytics dashboard
- ✅ Order integration component
- ✅ Dashboard page
- ✅ Comprehensive styling
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Export utilities

The promotion system is now fully implemented and ready for use!
