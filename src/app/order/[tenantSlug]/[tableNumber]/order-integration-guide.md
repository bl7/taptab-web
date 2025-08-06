# Order Page Promotion Integration Guide

## Overview

This guide shows how to integrate the promotion system into the existing order page.

## Integration Steps

### 1. Import Required Components and Hooks

Add these imports to your order page:

```typescript
import { OrderPromotions } from "@/components/promotion";
import { PromotionPreview, Customer } from "@/interfaces/promotion";
```

### 2. Add State Management

Add these state variables to your order page component:

```typescript
// Add after existing useState declarations
const [promotionPreview, setPromotionPreview] =
  useState<PromotionPreview | null>(null);
const [appliedPromoCodes, setAppliedPromoCodes] = useState<string[]>([]);
const [customer, setCustomer] = useState<Customer>({
  name: "Walk-in Customer",
  phone: "",
  email: "",
});
```

### 3. Update Cart Section

Replace the existing cart summary (around lines 705-720) with:

```typescript
{
  /* Promotions Section - Add after cart items but before order summary */
}
{
  cart.length > 0 && (
    <div className="mt-4">
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

{
  /* Enhanced Order Summary */
}
{
  cart.length > 0 && (
    <div className="mt-6 space-y-3">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {promotionPreview ? (
          // With promotions
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-black">Subtotal:</span>
              <span className="font-semibold text-black">
                Rs. {promotionPreview.originalSubtotal.toFixed(2)}
              </span>
            </div>

            {promotionPreview.promotions.applicablePromotions.map((promo) => (
              <div
                key={promo.promotionId}
                className="flex justify-between items-center mb-2 text-green-600"
              >
                <span className="text-sm">{promo.promotionName}:</span>
                <span className="font-semibold">
                  -Rs. {promo.discountAmount.toFixed(2)}
                </span>
              </div>
            ))}

            {promotionPreview.promotions.totalDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600 border-t pt-2">
                <span className="font-semibold">Total Savings:</span>
                <span className="font-bold">
                  -Rs. {promotionPreview.promotions.totalDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-black">Total Amount:</span>
              <span className="font-bold text-black">
                Rs. {promotionPreview.estimatedFinalAmount.toFixed(2)}
              </span>
            </div>

            {promotionPreview.promotions.totalDiscount > 0 && (
              <div className="mt-2 text-center bg-green-50 p-2 rounded">
                <span className="text-green-700 text-sm font-medium">
                  🎉 You save Rs.{" "}
                  {promotionPreview.promotions.totalDiscount.toFixed(2)}!
                </span>
              </div>
            )}
          </>
        ) : (
          // Without promotions (fallback)
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-black">Items:</span>
              <span className="font-semibold text-black">
                Rs. {getCartTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-black">Total Amount:</span>
              <span className="font-bold text-black">
                Rs. {getCartTotal().toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={submitOrder}
        disabled={orderLoading}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {orderLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Placing Order...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Place Order
            {promotionPreview &&
              promotionPreview.promotions.totalDiscount > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save Rs.{" "}
                  {promotionPreview.promotions.totalDiscount.toFixed(2)}
                </span>
              )}
          </>
        )}
      </button>
    </div>
  );
}
```

### 4. Update Submit Order Function

Modify the `submitOrder` function to include promotion data:

```typescript
const submitOrder = async () => {
  if (cart.length === 0) return;

  setOrderLoading(true);
  setError("");

  try {
    const orderData = {
      tableNumber: tableNumber,
      items: cart.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      customerName: customer.name || "Walk-in Customer",
      customerPhone: customer.phone || "",
      customerEmail: customer.email || "",
      appliedPromoCodes: appliedPromoCodes, // Add this line
      autoApplyPromotions: true, // Add this line
    };

    // Rest of the submit order logic remains the same...
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/orders?tenant=${tenantSlug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    // ... rest of the existing logic
  } catch (error) {
    // ... existing error handling
  } finally {
    setOrderLoading(false);
  }
};
```

### 5. Add Customer Information Section (Optional)

To collect customer information for better promotion targeting, add this before the cart section:

```typescript
{
  /* Customer Information Section - Add before cart items */
}
{
  cart.length > 0 && (
    <div className="p-4 border-b">
      <h3 className="text-sm font-semibold text-black mb-3">
        Customer Information (Optional)
      </h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Your name"
          value={customer.name || ""}
          onChange={(e) =>
            setCustomer((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-black"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={customer.phone || ""}
          onChange={(e) =>
            setCustomer((prev) => ({ ...prev, phone: e.target.value }))
          }
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-black"
        />
      </div>
    </div>
  );
}
```

## Mobile Layout Integration

For the mobile layout (after line 745), add similar integration in the mobile cart section. The mobile layout should include the same promotion components but with mobile-optimized spacing.

## Testing the Integration

1. **Test Auto-apply Promotions**: Add items to cart and verify promotions automatically apply
2. **Test Promo Codes**: Try entering valid/invalid promo codes
3. **Test Real-time Updates**: Modify cart quantities and verify promotion calculations update
4. **Test Order Submission**: Ensure orders submit successfully with promotion data

## Expected Behavior

- Promotions automatically apply when cart conditions are met
- Users can enter promo codes manually
- Real-time calculation shows savings
- Order summary displays all discounts clearly
- Final order includes promotion information

## Backend Communication

The integration will communicate with these backend endpoints:

- `GET /api/v1/orders/available-promotions` - Load available promotions
- `POST /api/v1/orders/preview-promotions` - Real-time promotion preview
- `POST /api/v1/promotions/validate` - Validate promo codes
- `POST /api/v1/public/orders` - Submit order with promotions

## Troubleshooting

1. **Promotions not loading**: Check API endpoints and network requests
2. **Preview not updating**: Verify cart format matches expected CartItem interface
3. **Styles not applied**: Ensure globals.css includes promotion styles
4. **Real-time updates slow**: Check debouncing settings in usePromotionPreview hook

This integration provides a seamless promotion experience without disrupting the existing order flow.
