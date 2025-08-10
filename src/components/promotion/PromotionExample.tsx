"use client";

import React, { useState } from "react";
import { SimplePromotionFormV2 } from "./SimplePromotionFormV2";
import { SimplePromotionCreateRequest } from "@/interfaces/promotion";
import { api } from "@/lib/api";

/**
 * Example component demonstrating proper promotion creation flow
 * This follows the frontend requirements for creating promotions
 */
export const PromotionExample: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Example of proper promotion creation flow
   * 1. Get valid category IDs first
   * 2. Use valid category IDs in promotion data
   * 3. Apply frontend validation rules
   * 4. Submit promotion
   */
  const handleCreatePromotion = async (
    promotionData: SimplePromotionCreateRequest
  ) => {
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Get categories first (already done in the form component)
      // The form component automatically fetches categories on mount

      // Step 2: Validate promotion data (already done in form validation)
      // The form component validates all category IDs exist

      // Step 3: Create promotion
      const response = await api.createSimplePromotion(promotionData);

      if (response.success) {
        setMessage("Promotion created successfully!");
        setIsFormOpen(false);
        // You could also refresh the promotions list here
      } else {
        setMessage("Failed to create promotion. Please try again.");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      setMessage("An error occurred while creating the promotion.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example of how to create a BOGO promotion with valid category IDs
   * This demonstrates the proper data structure
   */
  const createExampleBOGOPromotion = () => {
    // This is just an example - in practice, you'd get these IDs from your categories
    const examplePromotionData: SimplePromotionCreateRequest = {
      name: "Buy 2 Get 1 Free - Main Course",
      description: "Buy 2 main course items, get 1 free from the same category",
      type: "BOGO",
      discount_value: 0, // BOGO doesn't use discount_value
      min_order_amount: 0,
      max_discount_amount: 0,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      priority: 1,
      isActive: true,

      // BOGO specific - what customers need to buy
      buy_quantity: 2,
      buy_target_type: "CATEGORY",
      buy_target_category_id: "cat_1234567890_abc12", // MUST exist in categories table
      buy_target_product_ids: [], // or array of valid product IDs

      // BOGO specific - what customers get for free
      get_quantity: 1,
      get_target_type: "CATEGORY",
      get_target_category_id: "cat_1234567890_abc12", // MUST exist in categories table
      get_target_product_ids: [], // or array of valid product IDs

      // General targeting (not used for BOGO but required by interface)
      target_type: "ALL",
      target_category_id: undefined,
      target_product_ids: undefined,
    };

    console.log("Example BOGO promotion data:", examplePromotionData);
    setMessage(
      "Example BOGO promotion data logged to console. Check the console to see the structure."
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Promotion Creation Example
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Frontend Requirements for Creating Promotions
          </h2>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">
                ✅ What&apos;s Already Implemented:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Categories are automatically fetched on form mount using{" "}
                  <code>api.getMenuCategories()</code>
                </li>
                <li>
                  Form validation ensures category IDs exist before submission
                </li>
                <li>BOGO promotions support category and product targeting</li>
                <li>Proper error handling and validation messages</li>
                <li>Form follows the required data structure</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-900 mb-2">
                🔧 How to Use:
              </h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click &quot;Create New Promotion&quot; to open the form</li>
                <li>Select promotion type (BOGO, Percentage Off, etc.)</li>
                <li>
                  For category targeting, select from the dropdown (categories
                  are pre-loaded)
                </li>
                <li>Fill in required fields and submit</li>
                <li>
                  The form validates all category IDs exist before submission
                </li>
              </ol>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md mb-4 ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Promotion
          </button>

          <button
            onClick={createExampleBOGOPromotion}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            View Example BOGO Data
          </button>
        </div>

        {/* Promotion Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Create New Promotion
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <SimplePromotionFormV2
                  onSubmit={handleCreatePromotion}
                  onCancel={() => setIsFormOpen(false)}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
