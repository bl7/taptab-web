# Frontend Requirements for Creating Promotions

This document outlines the frontend requirements and implementation for creating promotions in the TapTab webapp.

## Overview

The promotion system supports multiple types of promotions:

- **BOGO**: Buy X Get Y Free
- **HAPPY_HOUR**: Time-based discounts
- **PERCENTAGE_OFF**: Percentage-based discounts
- **FIXED_OFF**: Fixed amount discounts

## Frontend Requirements

### 1. Get Valid Category IDs First

Before creating a promotion, your frontend **MUST** fetch the available categories:

```typescript
// The form component automatically fetches categories on mount
useEffect(() => {
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.getMenuCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  fetchCategories();
}, []);
```

**API Endpoint**: `GET /api/v1/categories` (implemented via `api.getMenuCategories()`)

### 2. Use Valid Category IDs in Promotion Data

When creating a promotion, ensure all category IDs exist in your database:

```typescript
// Example promotion data with valid category IDs
const promotionData = {
  name: "Buy 2 Get 1 Free",
  description: "Buy 2 items, get 1 free",
  type: "BOGO",

  // BOGO specific - what customers need to buy
  buy_target_type: "CATEGORY", // or "ALL" or "PRODUCTS"
  buy_target_category_id: "cat_1234567890_abc12", // MUST exist in categories table
  buy_target_product_ids: null, // or array of valid product IDs

  // BOGO specific - what customers get for free
  get_target_type: "CATEGORY", // or "ALL" or "PRODUCTS"
  get_target_category_id: "cat_1234567890_def34", // MUST exist in categories table
  get_target_product_ids: null, // or array of valid product IDs

  buy_quantity: 2,
  get_quantity: 1,

  // Other fields...
  priority: 1,
  startDate: "2024-01-01",
  endDate: "2024-12-31",
};
```

### 3. Frontend Validation Rules

The form component implements these validation rules:

```typescript
// Rule 1: If buy_target_type is "CATEGORY", buy_target_category_id is REQUIRED
if (buy_target_type === "CATEGORY" && !buy_target_category_id) {
  throw new Error("Category ID required when targeting specific category");
}

// Rule 2: If get_target_type is "CATEGORY", get_target_category_id is REQUIRED
if (get_target_type === "CATEGORY" && !get_target_category_id) {
  throw new Error("Category ID required when targeting specific category");
}

// Rule 3: Category IDs must exist in your categories list
const validCategoryIds = categories.map((cat) => cat.id);
if (
  buy_target_category_id &&
  !validCategoryIds.includes(buy_target_category_id)
) {
  throw new Error("Invalid buy target category ID");
}
if (
  get_target_category_id &&
  !validCategoryIds.includes(get_target_category_id)
) {
  throw new Error("Invalid get target category ID");
}
```

### 4. Complete Frontend Flow

```typescript
async function createPromotion() {
  try {
    // Step 1: Get categories first (automatically done by form component)
    // Step 2: Validate your promotion data (automatically done by form validation)
    // Step 3: Create promotion
    const response = await api.createSimplePromotion(promotionData);

    if (response.success) {
      console.log("Promotion created successfully!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Implementation Details

### Components

1. **SimplePromotionFormV2.tsx** - Main promotion form component
2. **PromotionExample.tsx** - Example usage and demonstration

### Key Features

- ✅ **Automatic Category Fetching**: Categories are loaded on component mount
- ✅ **Real-time Validation**: Form validates category IDs exist before submission
- ✅ **BOGO Support**: Full support for Buy X Get Y Free promotions
- ✅ **Category Targeting**: Support for targeting specific categories
- ✅ **Product Targeting**: Support for targeting specific products
- ✅ **Error Handling**: Comprehensive error messages and validation
- ✅ **Type Safety**: Full TypeScript support with proper interfaces

### Form Validation

The form validates:

1. **Required Fields**: Name, type, and other mandatory fields
2. **Category Existence**: All category IDs must exist in the database
3. **BOGO Logic**: Buy/get quantities and targeting must be valid
4. **Date Logic**: Start/end dates must be logical
5. **Time Logic**: Happy hour times must be valid

### Error Handling

- **Field-level errors**: Specific error messages for each field
- **General errors**: Overall form submission errors
- **Validation errors**: Real-time validation feedback
- **API errors**: Error handling for failed API calls

## Usage Examples

### Basic BOGO Promotion

```typescript
const bogoPromotion = {
  name: "Buy 2 Get 1 Free - Desserts",
  type: "BOGO",
  buy_quantity: 2,
  get_quantity: 1,
  buy_target_type: "CATEGORY",
  buy_target_category_id: "cat_desserts_123", // Must exist
  get_target_type: "CATEGORY",
  get_target_category_id: "cat_desserts_123", // Must exist
  // ... other fields
};
```

### Category-Targeted Percentage Discount

```typescript
const percentagePromotion = {
  name: "20% Off Main Course",
  type: "PERCENTAGE_OFF",
  discount_value: 20,
  target_type: "CATEGORY",
  target_category_id: "cat_main_course_456", // Must exist
  // ... other fields
};
```

## What NOT to Send

❌ **Don't send random strings as category IDs**
❌ **Don't send empty strings for category IDs**
❌ **Don't send category IDs that don't exist in your database**

## What TO Send

✅ **Send valid category IDs from your categories table**
✅ **Send null if you don't want to target specific categories**
✅ **Use "ALL" as target_type if you want to target everything**

## API Integration

The form uses the existing `api` client:

```typescript
import { api } from "@/lib/api";

// Fetch categories
const response = await api.getMenuCategories();

// Create promotion
const result = await api.createSimplePromotion(promotionData);
```

## Testing

Use the `PromotionExample` component to test the promotion creation flow:

1. Navigate to the component
2. Click "Create New Promotion"
3. Fill out the form with valid data
4. Submit and verify validation works
5. Check console for example data structure

## Troubleshooting

### Common Issues

1. **"Category ID required" error**: Set target_type to "CATEGORY" and select a category
2. **"Invalid category ID" error**: Ensure the category exists in your database
3. **Form won't submit**: Check all required fields and validation errors
4. **Categories not loading**: Verify API endpoint is working and accessible

### Debug Mode

Enable console logging to see:

- Category data being fetched
- Validation errors
- Form submission data
- API responses

## Future Enhancements

- [ ] Product search and selection interface
- [ ] Bulk promotion creation
- [ ] Promotion templates
- [ ] Advanced targeting rules
- [ ] Promotion scheduling interface
- [ ] A/B testing support

## Support

For questions or issues with the promotion system, refer to:

- This README file
- The `PromotionExample` component
- The `SimplePromotionFormV2` component
- The promotion interfaces in `src/interfaces/promotion.ts`
