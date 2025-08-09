"use client";

import { useState, useEffect } from "react";
import {
  api,
  MenuItem,
  MenuCategory,
  Ingredient,
  Allergen,
  MenuTag,
} from "@/lib/api";
import toast from "react-hot-toast";
import { PageLoader } from "@/lib/utils";
import CategoriesTab from "@/components/menu/CategoriesTab";
import MenuTab from "@/components/menu/MenuTab";
import IngredientsTab from "@/components/menu/IngredientsTab";
import AllergensTab from "@/components/menu/AllergensTab";
import {
  AddItemModal,
  AddIngredientModal,
  EditIngredientModal,
  AddAllergenModal,
  EditAllergenModal,
  EditCategoryModal,
  EditMenuItemModal,
} from "@/components/menu/Modals";

export default function MenuPage() {
  // Data state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [menuTags, setMenuTags] = useState<MenuTag[]>([]);

  // Debug allergens state changes

  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "menu" | "categories" | "ingredients" | "allergens"
  >("categories");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showEditIngredientModal, setShowEditIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [showAddAllergenModal, setShowAddAllergenModal] = useState(false);
  const [showEditAllergenModal, setShowEditAllergenModal] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null
  );

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

      try {
        // Load allergens separately first
        const allergensResult = await api.getAllergens();
        const allergensArray = allergensResult?.allergens || [];
        setAllergens(allergensArray);

        // Load other data
        const [
          menuResponse,
          categoriesResponse,
          ingredientsResponse,
          menuTagsResponse,
        ] = await Promise.all([
          api.getMenuItems().catch(() => ({ items: [] })),
          api.getMenuCategories().catch(() => ({ categories: [] })),
          (async () => {
            try {
              const result = await api.getIngredients();
              return result;
            } catch {
              return {
                ingredients: [],
                pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
              };
            }
          })(),
          api.getMenuTags().catch(() => ({ tags: [] })),
        ]);

        // Set other state
        setMenuItems(menuResponse?.items || []);
        setCategories(categoriesResponse?.categories || []);
        setIngredients(ingredientsResponse?.ingredients || []);
        setMenuTags(menuTagsResponse?.tags || []);

        // Expand all categories by default
        setExpandedCategories(
          new Set((categoriesResponse?.categories || []).map((c) => c.id))
        );
      } catch {
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
      unit?: string;
    }>;
    tags?: string[];
  }) => {
    // Transform ingredients to match API format
    const transformedData = {
      ...itemData,
      ingredients: itemData.ingredients?.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: parseFloat(ing.quantity.toString()), // ✅ Ensure it's a number
        unit: ing.unit || undefined, // ✅ Optional unit string
      })),
      tags: itemData.tags || [], // ✅ Array of tag ID strings
    };

    setApiLoading(true);
    try {
      const response = await api.createMenuItem(transformedData);
      setMenuItems((prev) => [...prev, response.item]);
      setShowAddModal(false);
      toast.success("Menu item created successfully!");
    } catch (error) {
      console.error("Error creating menu item:", error);

      // ✅ BETTER ERROR HANDLING - Show specific error messages
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          toast.error("A menu item with this name already exists");
        } else if (error.message.includes("validation")) {
          toast.error("Please check your input data");
        } else if (error.message.includes("Invalid response structure")) {
          toast.error("Server response error. Please try again.");
        } else {
          toast.error(error.message || "Failed to create menu item");
        }
      } else {
        toast.error("Failed to create menu item");
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateItem = async (
    id: string,
    itemData: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      image?: string;
      isActive?: boolean;
      ingredients?: Array<{
        ingredientId: string;
        quantity: number;
        unit?: string;
      }>;
      tags?: string[];
    }
  ) => {
    // Transform ingredients to match API format
    const transformedData = {
      ...itemData,
      ingredients: itemData.ingredients?.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: parseFloat(ing.quantity.toString()), // ✅ Ensure it's a number
        unit: ing.unit || undefined, // ✅ Optional unit string
      })),
      tags: itemData.tags || [], // ✅ Array of tag ID strings
    };

    setApiLoading(true);
    try {
      const response = await api.updateMenuItem(id, transformedData);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? response.item : item))
      );
      toast.success("Menu item updated successfully!");
      setShowEditMenuItemModal(false);
      setEditingMenuItem(null);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateCategory = async (categoryData: {
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

  const handleUpdateCategory = async (
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
      setShowEditCategoryModal(false);
      setEditingCategory(null);
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

  const handleUpdateIngredient = async (
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
      setShowEditIngredientModal(false);
      setEditingIngredient(null);
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

      setAllergens((prev) =>
        prev.map((allergen) =>
          allergen.id === id ? updatedAllergen : allergen
        )
      );
      setShowEditAllergenModal(false);
      setEditingAllergen(null);
      toast.success("Allergen updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update allergen"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteAllergen = async (id: string) => {
    if (!confirm("Are you sure you want to delete this allergen?")) return;

    setApiLoading(true);
    try {
      await api.deleteAllergen(id);
      setAllergens((prev) => prev.filter((allergen) => allergen.id !== id));
      toast.success("Allergen deleted successfully!");
    } catch (error) {
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
    return <PageLoader message="Loading menu data..." />;
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-4 md:mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-1 md:space-x-8 overflow-x-auto scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
            {[
              {
                id: "categories",
                label: "Categories",
                count: categories.length,
              },
              { id: "menu", label: "Menu Items", count: menuItems.length },
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
                className={`py-2 px-3 md:px-4 border-b-2 font-medium text-sm whitespace-nowrap min-w-max ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
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
            setEditingMenuItem(item);
            setShowEditMenuItemModal(true);
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
            setEditingCategory(category);
            setShowEditCategoryModal(true);
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
            setEditingIngredient(ingredient);
            setShowEditIngredientModal(true);
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
          availableTags={menuTags}
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

      {showEditIngredientModal && editingIngredient && (
        <EditIngredientModal
          ingredient={editingIngredient}
          onClose={() => {
            setShowEditIngredientModal(false);
            setEditingIngredient(null);
          }}
          onSubmit={(ingredientData) =>
            handleUpdateIngredient(editingIngredient.id, ingredientData)
          }
          loading={apiLoading}
          availableAllergens={allergens}
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

      {showEditMenuItemModal && editingMenuItem && (
        <EditMenuItemModal
          menuItem={editingMenuItem}
          categories={categories}
          availableIngredients={ingredients}
          availableMenuTags={menuTags}
          onClose={() => {
            setShowEditMenuItemModal(false);
            setEditingMenuItem(null);
          }}
          onSubmit={(data) => handleUpdateItem(editingMenuItem.id, data)}
          loading={apiLoading}
        />
      )}

      {showEditCategoryModal && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => {
            setShowEditCategoryModal(false);
            setEditingCategory(null);
          }}
          onSubmit={(data) => handleUpdateCategory(editingCategory.id, data)}
          loading={apiLoading}
        />
      )}
    </div>
  );
}
