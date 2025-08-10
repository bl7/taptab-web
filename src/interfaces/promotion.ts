// Simple Promotions System Interfaces

export interface SimplePromotion {
  id?: string;
  name: string;
  description?: string;
  type: PromotionType;
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string; // HH:MM format for happy hour
  end_time?: string; // HH:MM format for happy hour
  days_of_week?: number[]; // 1=Monday, 7=Sunday
  priority?: number;
  isActive: boolean;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;

  // Targeting fields
  target_type: TargetType;
  target_category_id?: string;
  target_product_ids?: string[];

  // BOGO-specific fields
  buy_quantity?: number;
  get_quantity?: number;
  buy_target_type?: TargetType;
  buy_target_category_id?: string;
  buy_target_product_ids?: string[];
  get_target_type?: TargetType;
  get_target_category_id?: string;
  get_target_product_ids?: string[];
}

export type PromotionType =
  | "HAPPY_HOUR"
  | "BOGO"
  | "PERCENTAGE_OFF"
  | "FIXED_OFF";

export type TargetType = "ALL" | "CATEGORY" | "PRODUCTS";

export interface PromotionCalculationRequest {
  orderItems: OrderItem[];
  tenantId: string;
  orderTime: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  categoryId: string;
}

// Alias for backward compatibility
export type OrderItemForPromotion = OrderItem;

export interface PromotionCalculationResponse {
  applicablePromotions: AppliedPromotion[];
  total_discount: number;
  final_total: number;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  type: PromotionType;
  discount_amount: number;
  applied_items: string[];
}

export interface PromotionFormData {
  name: string;
  description?: string;
  type: PromotionType;
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  priority?: number;
  isActive: boolean;

  // Targeting
  target_type: TargetType;
  target_category_id?: string;
  target_product_ids?: string[];

  // BOGO
  buy_quantity?: number;
  get_quantity?: number;
  buy_target_type?: TargetType;
  buy_target_category_id?: string;
  buy_target_product_ids?: string[];
  get_target_type?: TargetType;
  get_target_category_id?: string;
  get_target_product_ids?: string[];
}

export interface PromotionFilters {
  type?: PromotionType;
  isActive?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// Create and Update request interfaces
export interface SimplePromotionCreateRequest {
  name: string;
  description?: string;
  type: PromotionType;
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  priority?: number;
  isActive: boolean;

  // Targeting
  target_type: TargetType;
  target_category_id?: string;
  target_product_ids?: string[];

  // BOGO
  buy_quantity?: number;
  get_quantity?: number;
  buy_target_type?: TargetType;
  buy_target_category_id?: string;
  buy_target_product_ids?: string[];
  get_target_type?: TargetType;
  get_target_category_id?: string;
  get_target_product_ids?: string[];
}

export interface SimplePromotionUpdateRequest extends Partial<SimplePromotionCreateRequest> {
  id: string;
}
