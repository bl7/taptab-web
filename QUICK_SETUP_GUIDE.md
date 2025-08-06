# 🚀 TapTab Promotion System - Quick Setup Guide

## ✅ **What's Already Done**

1. ✅ **Promotion interfaces and types** - `src/interfaces/promotion.ts`
2. ✅ **API service layer** - `src/lib/promotion-api.ts`
3. ✅ **React hooks** - `src/lib/use-promotions.ts`
4. ✅ **UI Components** - `src/components/promotion/`
5. ✅ **Dashboard page** - `src/app/dashboard/promotions/page.tsx`
6. ✅ **Styling** - Added to `src/app/globals.css`
7. ✅ **Navigation** - Added to `src/app/dashboard/layout.tsx`

## 🎯 **Where Everything Is Located**

### 1. **Admin Dashboard** (For Creating Promotions)

- **URL**: `http://localhost:3000/dashboard/promotions`
- **File**: `src/app/dashboard/promotions/page.tsx`
- **Purpose**: Restaurant admins create, edit, manage promotions

### 2. **Customer QR Ordering** (Where Promotions Apply)

- **URL**: `http://localhost:3000/order/[tenantSlug]/[tableNumber]`
- **File**: `src/app/order/[tenantSlug]/[tableNumber]/page.tsx`
- **Purpose**: Customers scan QR codes, promotions auto-apply to their cart

## 🔧 **Quick Integration Steps**

### **Step 1: Test the Admin Dashboard**

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/dashboard/promotions`
3. You should see the promotions management interface
4. Try creating a test promotion

### **Step 2: Integrate Promotions into QR Ordering Page**

You only need to modify your existing QR ordering page. Here's exactly what to add:

#### **A. Add Imports** (top of the file)

```typescript
import { OrderPromotions } from "@/components/promotion";
import { PromotionPreview, Customer } from "@/interfaces/promotion";
```

#### **B. Add State Variables** (after existing useState declarations)

```typescript
const [promotionPreview, setPromotionPreview] =
  useState<PromotionPreview | null>(null);
const [appliedPromoCodes, setAppliedPromoCodes] = useState<string[]>([]);
const [customer, setCustomer] = useState<Customer>({
  name: "Walk-in Customer",
  phone: "",
  email: "",
});
```

#### **C. Update submitOrder Function** (add these lines to your existing function)

```typescript
const orderData = {
  // ... your existing orderData fields
  appliedPromoCodes: appliedPromoCodes, // ADD THIS
  autoApplyPromotions: true, // ADD THIS
  customerName: customer.name || "Walk-in Customer",
  customerPhone: customer.phone || "",
};
```

#### **D. Add Promotions Component** (in your cart sidebar, before order summary)

```typescript
{
  cart.length > 0 && (
    <div className="mb-4">
      <OrderPromotions
        tenantSlug={tenantSlug}
        cart={cart}
        customer={customer}
        onPromotionsUpdate={setPromotionPreview}
        appliedPromoCodes={appliedPromoCodes}
        onPromoCodesUpdate={setAppliedPromoCodes}
      />
    </div>
  );
}
```

#### **E. Update Order Summary** (replace your existing order summary)

See the complete example in `order-with-promotions-example.tsx`

## 🎯 **What Customers Will See**

1. **Available Offers**: Automatic promotions that apply to their cart
2. **Promo Code Input**: Manual entry field for promo codes
3. **Real-time Savings**: Live calculation as they modify their cart
4. **Order Summary**: Clear breakdown showing original price, discounts, and final total

## 🎯 **What Admins Will See**

1. **Promotion Management**: Create, edit, delete promotions
2. **Analytics Dashboard**: See promotion performance metrics
3. **Bulk Operations**: Manage multiple promotions
4. **Advanced Filters**: Search and filter promotions

## 🔗 **Backend Endpoints Expected**

The frontend expects these API endpoints to be working:

```
GET /api/v1/promotions                     - List promotions
POST /api/v1/promotions                    - Create promotion
PUT /api/v1/promotions/:id                 - Update promotion
DELETE /api/v1/promotions/:id              - Delete promotion
POST /api/v1/promotions/validate           - Validate promo code
GET /api/v1/promotions/analytics           - Get analytics
POST /api/v1/orders/preview-promotions     - Preview promotions
GET /api/v1/orders/available-promotions    - Get available promotions
POST /api/v1/public/orders                 - Create order with promotions
```

## 🧪 **Testing Your Setup**

### **Test Admin Dashboard:**

1. Go to `/dashboard/promotions`
2. Create a test promotion (e.g., "10% off orders over Rs. 500")
3. Set it to active

### **Test Customer Experience:**

1. Go to `/order/[your-tenant]/[table-number]`
2. Add items to cart totaling over Rs. 500
3. You should see the promotion automatically apply
4. Try entering a promo code manually

## 🚨 **Important Notes**

1. **No Changes Needed**: Take orders page and order modification modals remain unchanged
2. **Auto-Apply**: Promotions automatically apply when conditions are met
3. **Real-time**: Discounts calculate as customers modify their cart
4. **Backend Required**: Make sure your backend has implemented the promotion routes

## 📞 **Need Help?**

If you have any issues:

1. Check browser console for errors
2. Verify API endpoints are working
3. Ensure your backend has the promotion routes implemented
4. Check that styles are loading from `globals.css`

The system is designed to work seamlessly with your existing order flow without breaking anything!
