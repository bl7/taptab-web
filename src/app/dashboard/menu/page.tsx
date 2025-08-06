"use client";

import { useState, useEffect } from "react";
import { api, MenuItem, MenuCategory, Ingredient, Allergen } from "@/lib/api";
import toast from "react-hot-toast";
import CategoriesTab from "@/components/menu/CategoriesTab";
import MenuTab from "@/components/menu/MenuTab";
import IngredientsTab from "@/components/menu/IngredientsTab";
import AllergensTab from "@/components/menu/AllergensTab";
import {
  AddItemModal,
  AddIngredientModal,
  AddAllergenModal,
  EditAllergenModal,
} from "@/components/menu/Modals";

export default function MenuPage() {
  // Data state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);

  // Debug allergens state changes
  useEffect(() => {
    console.log("sup allergen list - Allergens state changed:", allergens);
    console.log("sup allergen list - Allergens state count:", allergens.length);
  }, [allergens]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "menu" | "categories" | "ingredients" | "allergens"
  >("menu");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showAddAllergenModal, setShowAddAllergenModal] = useState(false);
  const [showEditAllergenModal, setShowEditAllergenModal] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [allergenSearchTerm, setAllergenSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [allergenFilterType, setAllergenFilterType] = useState<
    "all" | "standard" | "custom"
  >("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log("sup allergen list - Starting data load...");

      try {
        // Load allergens separately first
        console.log("sup allergen list - Loading allergens...");
        const allergensResult = await api.getAllergens();
        console.log("sup allergen list - Allergens result:", allergensResult);

        const allergensArray = allergensResult?.allergens || [];
      console.log(
          "sup allergen list - Extracted allergens array:",
          allergensArray
      );
        console.log(
          "sup allergen list - Allergens count:",
          allergensArray.length
        );

        // Set allergens immediately
        setAllergens(allergensArray);

        // Load other data
        const [menuResponse, categoriesResponse, ingredientsResponse] =
          await Promise.all([
            api.getMenuItems().catch(() => ({ items: [] })),
            api.getMenuCategories().catch(() => ({ categories: [] })),
            api.getIngredients().catch(() => ({ ingredients: [] })),
          ]);

        // Set other state
        setMenuItems(menuResponse?.items || []);
        setCategories(categoriesResponse?.categories || []);
        setIngredients(ingredientsResponse?.ingredients || []);

        // Expand all categories by default
        setExpandedCategories(
          new Set((categoriesResponse?.categories || []).map((c) => c.id))
        );
    } catch (error) {
        console.error("sup allergen list - Error loading data:", error);
        // Don't reset allergens since they're loaded separately
    } finally {
      setLoading(false);
    }
    };

    loadData();
  }, []);

  // Menu Item handlers
  const handleCreateItem = async (itemData: {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    image?: string;
    ingredients?: Array<{
      ingredientId: string;
      quantity: number;
      unit: string;
    }>;
  }) => {
    setApiLoading(true);
    try {
      const response = await api.createMenuItem(itemData);
      setMenuItems((prev) => [...prev, response.item]);
      setShowAddModal(false);
      toast.success("Menu item created successfully!");
    } catch (error) {
      console.error("Error creating menu item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create menu item"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateItem = async (id: string, itemData: Partial<MenuItem>) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setApiLoading(true);
    try {
      const response = await api.updateMenuItem(id, itemData);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? response.item : item))
      );
      toast.success("Menu item updated successfully!");
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update menu item"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    setApiLoading(true);
    try {
      await api.deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Menu item deleted successfully!");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete menu item"
      );
    } finally {
      setApiLoading(false);
    }
  };

  // Category handlers
  const handleCreateCategory = async (categoryData: { // eslint-disable-line @typescript-eslint/no-unused-vars
    name: string;
    sortOrder?: number;
  }) => {
    setApiLoading(true);
    try {
      const response = await api.createMenuCategory(categoryData);
      setCategories((prev) => [...prev, response.category]);
      setShowAddCategoryModal(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateCategory = async ( // eslint-disable-line @typescript-eslint/no-unused-vars
    id: string,
    categoryData: Partial<MenuCategory>
  ) => {
    setApiLoading(true);
    try {
      const response = await api.updateMenuCategory(id, categoryData);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? response.category : category
        )
      );
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setApiLoading(true);
    try {
      await api.deleteMenuCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setApiLoading(false);
    }
  };

  // Ingredient handlers
  const handleCreateIngredient = async (ingredientData: {
    name: string;
    description: string;
    unit: string;
    costPerUnit: number;
    allergens?: string[];
  }) => {
    setApiLoading(true);
    try {
      const { allergens, ...ingredientDataWithoutAllergens } = ingredientData;

      const response = await api.createIngredient(
        ingredientDataWithoutAllergens
      );
      setIngredients((prev) => [...prev, response.ingredient]);

      // Add allergens to the ingredient if provided
      if (allergens && allergens.length > 0) {
        for (const allergenId of allergens) {
          try {
            await api.addAllergenToIngredient({
              ingredientId: response.ingredient.id,
              allergenId: allergenId,
            });
          } catch (error) {
            console.error(
              `Error adding allergen ${allergenId} to ingredient:`,
              error
            );
          }
        }
      }

      setShowAddIngredientModal(false);
      toast.success("Ingredient created successfully!");
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create ingredient"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateIngredient = async ( // eslint-disable-line @typescript-eslint/no-unused-vars
    id: string,
    ingredientData: Partial<Ingredient>
  ) => {
    setApiLoading(true);
    try {
      const response = await api.updateIngredient(id, ingredientData);
      setIngredients((prev) =>
        prev.map((ingredient) =>
          ingredient.id === id ? response.ingredient : ingredient
        )
      );
      toast.success("Ingredient updated successfully!");
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update ingredient"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;

    setApiLoading(true);
    try {
      await api.deleteIngredient(id);
      setIngredients((prev) =>
        prev.filter((ingredient) => ingredient.id !== id)
      );
      toast.success("Ingredient deleted successfully!");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete ingredient"
      );
    } finally {
      setApiLoading(false);
    }
  };

  // Allergen handlers
  const handleCreateAllergen = async (allergenData: {
    name: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) => {
    console.log(
      "sup allergen list - Creating allergen with data:",
      allergenData
    );
    setApiLoading(true);
    try {
      const response = await api.createAllergen(allergenData);
      console.log("sup allergen list - Create response:", response);
      setAllergens((prev) => [...prev, response.allergen]);
      setShowAddAllergenModal(false);
      toast.success("Allergen created successfully!");
    } catch (error) {
      console.error("sup allergen list - Error creating allergen:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create allergen"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateAllergen = async (
    id: string,
    allergenData: Partial<Allergen>
  ) => {
    console.log("sup allergen list - Updating allergen with ID:", id);
    console.log("sup allergen list - Update data:", allergenData);
    setApiLoading(true);
    try {
      console.log("sup allergen list - About to call updateAllergen API...");
      const response = await api.updateAllergen(id, allergenData);
      console.log("sup allergen list - Raw response received:", response);
      console.log("sup allergen list - Response type:", typeof response);
      console.log(
        "sup allergen list - Response is null/undefined:",
        response == null
      );

      if (response) {
        console.log(
          "sup allergen list - Response structure:",
          Object.keys(response)
        );
        console.log(
          "sup allergen list - Has allergen property:",
          "allergen" in response
        );
        if (response.allergen) {
          console.log("sup allergen list - Allergen value:", response.allergen);
        }
      }

      // Handle response structure - API returns { allergen: Allergen }
      const updatedAllergen =
        response?.allergen ||
        (() => {
          console.warn(
            "sup allergen list - No allergen in response, using fallback"
          );
          const currentAllergen = allergens.find((a) => a.id === id);
          return { ...currentAllergen, id, ...allergenData };
        })();

      console.log(
        "sup allergen list - Final updated allergen:",
        updatedAllergen
      );

      setAllergens((prev) =>
        prev.map((allergen) =>
          allergen.id === id ? updatedAllergen : allergen
        )
      );
      setShowEditAllergenModal(false);
      setEditingAllergen(null);
      toast.success("Allergen updated successfully!");
    } catch (error) {
      console.error("sup allergen list - Error updating allergen:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update allergen"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteAllergen = async (id: string) => {
    if (!confirm("Are you sure you want to delete this allergen?")) return;

    console.log("sup allergen list - Deleting allergen with ID:", id);
    setApiLoading(true);
    try {
      await api.deleteAllergen(id);
      console.log("sup allergen list - Allergen deleted successfully:", id);
      setAllergens((prev) => prev.filter((allergen) => allergen.id !== id));
      toast.success("Allergen deleted successfully!");
    } catch (error) {
      console.error("sup allergen list - Error deleting allergen:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete allergen"
      );
    } finally {
      setApiLoading(false);
    }
  };

  // UI handlers
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Menu Management</h1>
        <p className="text-gray-600">
          Manage your menu items, categories, ingredients, and allergens
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "menu", label: "Menu Items", count: menuItems.length },
              {
                id: "categories",
                label: "Categories",
                count: categories.length,
              },
              {
                id: "ingredients",
                label: "Ingredients",
                count: ingredients.length,
              },
              { id: "allergens", label: "Allergens", count: allergens.length },
            ].map((tab) => (
          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                              </span>
                            </button>
            ))}
          </nav>
                          </div>
                          </div>

      {/* Tab Content */}
        {activeTab === "menu" && (
        <MenuTab
          menuItems={menuItems}
          categories={categories}
          apiLoading={apiLoading}
          onShowAddModal={() => setShowAddModal(true)}
          onShowEditModal={(item) => {
            // TODO: Implement edit modal
            console.log("Edit item:", item);
          }}
          onDeleteItem={handleDeleteItem}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
        />
      )}

      {activeTab === "categories" && (
        <CategoriesTab
                categories={categories}
          apiLoading={apiLoading}
          onShowAddModal={() => setShowAddCategoryModal(true)}
          onShowEditModal={(category) => {
            // TODO: Implement edit modal
            console.log("Edit category:", category);
          }}
          onDeleteCategory={handleDeleteCategory}
          searchTerm={categorySearchTerm}
          onSearchChange={setCategorySearchTerm}
        />
        )}

        {activeTab === "ingredients" && (
        <IngredientsTab
          ingredients={ingredients}
          apiLoading={apiLoading}
          onShowAddModal={() => setShowAddIngredientModal(true)}
          onShowEditModal={(ingredient) => {
            // TODO: Implement edit modal
            console.log("Edit ingredient:", ingredient);
          }}
          onDeleteIngredient={handleDeleteIngredient}
          searchTerm={ingredientSearchTerm}
          onSearchChange={setIngredientSearchTerm}
        />
        )}

        {activeTab === "allergens" && (
        <AllergensTab
          allergens={allergens}
          apiLoading={apiLoading}
          onShowAddModal={() => setShowAddAllergenModal(true)}
          onShowEditModal={(allergen) => {
            setEditingAllergen(allergen);
                                  setShowEditAllergenModal(true);
                                }}
          onDeleteAllergen={handleDeleteAllergen}
          searchTerm={allergenSearchTerm}
          onSearchChange={setAllergenSearchTerm}
          filterType={allergenFilterType}
          onFilterTypeChange={setAllergenFilterType}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddItemModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateItem}
          loading={apiLoading}
          onCreateIngredient={handleCreateIngredient}
        />
      )}

      {showAddIngredientModal && (
        <AddIngredientModal
          onClose={() => setShowAddIngredientModal(false)}
          onSubmit={handleCreateIngredient}
          loading={apiLoading}
        />
      )}

      {showAddAllergenModal && (
        <AddAllergenModal
          onClose={() => setShowAddAllergenModal(false)}
          onSubmit={handleCreateAllergen}
          loading={apiLoading}
        />
      )}

      {showEditAllergenModal && editingAllergen && (
        <EditAllergenModal
          allergen={editingAllergen}
          onClose={() => {
            setShowEditAllergenModal(false);
            setEditingAllergen(null);
          }}
          onSubmit={(data) => handleUpdateAllergen(editingAllergen.id, data)}
          loading={apiLoading}
        />
      )}

      {/* TODO: Add other modals as needed */}
    </div>
  );
}
