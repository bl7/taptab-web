// Promotion system exports
export { PromotionForm } from "./PromotionForm";
export { PromotionsList } from "./PromotionsList";
export { PromotionAnalytics } from "./PromotionAnalytics";
export { OrderPromotions } from "./OrderPromotions";

// Re-export hooks for convenience
export {
  usePromotions,
  usePromotionPreview,
  usePromoCodeValidation,
  useAvailablePromotions,
} from "@/lib/use-promotions";

// Re-export API classes
export { PromotionAPI, OrderAPI } from "@/lib/promotion-api";

// Re-export types
export type {
  Promotion,
  PromotionItem,
  PromotionAnalytics as PromotionAnalyticsData,
  PromotionPreview,
  PromotionValidation,
  PromotionFilters,
  ApplicablePromotion,
  CartItem,
  Customer,
  OrderData,
  PromotionMenuItem,
  Category,
} from "@/interfaces/promotion";
