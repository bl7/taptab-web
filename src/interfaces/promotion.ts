export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type:
    | "ITEM_DISCOUNT"
    | "COMBO_DEAL"
    | "CART_DISCOUNT"
    | "BOGO"
    | "FIXED_PRICE"
    | "TIME_BASED"
    | "COUPON";
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_ITEM" | "FIXED_PRICE";
  discountValue?: number;
  fixedPrice?: number;
  minCartValue: number;
  maxDiscountAmount?: number;
  minItems: number;
  maxItems?: number;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startDate?: string;
  endDate?: string;
  timeRangeStart?: string;
  timeRangeEnd?: string;
  daysOfWeek?: number[];
  requiresCode: boolean;
  promoCode?: string;
  autoApply: boolean;
  customerSegments: string[];
  customerTypes: string[];
  priority: number;
  canCombineWithOthers: boolean;
  isActive: boolean;
  items?: PromotionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionItem {
  id: string;
  menuItemId?: string;
  categoryId?: string;
  requiredQuantity: number;
  freeQuantity: number;
  discountedPrice?: number;
  isRequired: boolean;
  maxQuantity?: number;
  menuItemName?: string;
  categoryName?: string;
}

export interface PromotionAnalytics {
  id: string;
  name: string;
  type: string;
  discountType: string;
  total_uses: number;
  total_discount_given: number;
  total_original_amount: number;
  avg_discount_per_use: number;
}

export interface PromotionPreview {
  originalSubtotal: number;
  estimatedFinalAmount: number;
  promotions: {
    applicablePromotions: ApplicablePromotion[];
    totalDiscount: number;
    autoAppliedPromotions: ApplicablePromotion[];
  };
  tax?: number;
  serviceCharge?: number;
}

export interface ApplicablePromotion {
  promotionId: string;
  promotionName: string;
  promotionType: string;
  discountAmount: number;
  discountType: string;
  applied: boolean;
  reason?: string;
}

export interface PromotionValidation {
  valid: boolean;
  promotion?: Promotion;
  estimatedDiscount: number;
  reason?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PromotionFilters {
  active?: boolean;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PromotionMenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  categoryId?: string;
}

export interface Customer {
  name?: string;
  phone?: string;
  email?: string;
  segment?: string;
  type?: string;
}

export interface OrderData {
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  appliedPromoCodes?: string[];
  autoApplyPromotions?: boolean;
}
