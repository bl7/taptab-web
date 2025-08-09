import { LayoutObject, SavedLayout } from "@/types/layout";

// Save layout to localStorage (will be replaced with DB later)
export const saveLayoutToStorage = async (
  name: string,
  location: string,
  objects: LayoutObject[]
): Promise<void> => {
  try {
    const layout: SavedLayout = {
      id: `layout_${Date.now()}`,
      name,
      location,
      objects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing layouts
    const existingLayouts = getLayoutsFromStorage();
    const updatedLayouts = [...existingLayouts, layout];

    // Save to localStorage
    localStorage.setItem("restaurant_layouts", JSON.stringify(updatedLayouts));

    console.log("Layout saved successfully:", layout);
  } catch (error) {
    console.error("Error saving layout:", error);
    throw new Error("Failed to save layout");
  }
};

// Load layouts from localStorage
export const getLayoutsFromStorage = (): SavedLayout[] => {
  try {
    const stored = localStorage.getItem("restaurant_layouts");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading layouts from storage:", error);
    return [];
  }
};

// Delete layout from localStorage
export const deleteLayoutFromStorage = (layoutId: string): void => {
  try {
    const existingLayouts = getLayoutsFromStorage();
    const updatedLayouts = existingLayouts.filter(
      (layout) => layout.id !== layoutId
    );
    localStorage.setItem("restaurant_layouts", JSON.stringify(updatedLayouts));
  } catch (error) {
    console.error("Error deleting layout:", error);
    throw new Error("Failed to delete layout");
  }
};

// Export layout to JSON file
export const exportLayoutToFile = (layout: SavedLayout): void => {
  try {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${layout.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_layout.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting layout:", error);
    throw new Error("Failed to export layout");
  }
};

// Import layout from JSON file
export const importLayoutFromFile = (): Promise<SavedLayout> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const layout = JSON.parse(content) as SavedLayout;

          // Validate layout structure
          if (!layout.id || !layout.name || !Array.isArray(layout.objects)) {
            throw new Error("Invalid layout file format");
          }

          // Update timestamps
          layout.updatedAt = new Date().toISOString();

          resolve(layout);
        } catch {
          reject(new Error("Failed to parse layout file"));
        }
      };
      reader.readAsText(file);
    };

    input.click();
  });
};

// Validate layout objects
export const validateLayout = (
  objects: LayoutObject[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(objects)) {
    errors.push("Layout must contain an array of objects");
    return { valid: false, errors };
  }

  objects.forEach((obj, index) => {
    if (!obj.id) errors.push(`Object ${index}: Missing ID`);
    if (!obj.type) errors.push(`Object ${index}: Missing type`);
    if (typeof obj.x !== "number")
      errors.push(`Object ${index}: Invalid X position`);
    if (typeof obj.y !== "number")
      errors.push(`Object ${index}: Invalid Y position`);
    if (typeof obj.width !== "number" || obj.width <= 0)
      errors.push(`Object ${index}: Invalid width`);
    if (typeof obj.height !== "number" || obj.height <= 0)
      errors.push(`Object ${index}: Invalid height`);
    if (!obj.color) errors.push(`Object ${index}: Missing color`);
    if (!obj.name) errors.push(`Object ${index}: Missing name`);
  });

  return { valid: errors.length === 0, errors };
};

// Convert layout to different formats for future API integration
export const convertLayoutForAPI = (layout: SavedLayout) => {
  return {
    name: layout.name,
    objects: layout.objects.map((obj) => ({
      type: obj.type,
      position: { x: obj.x, y: obj.y },
      dimensions: { width: obj.width, height: obj.height },
      rotation: obj.rotation,
      properties: {
        color: obj.color,
        name: obj.name,
        seats: obj.seats,
        isExistingTable: obj.isExistingTable,
        tableId: obj.tableId,
      },
    })),
  };
};

// Generate layout preview/thumbnail (simplified object positions)
export const generateLayoutPreview = (objects: LayoutObject[]): string => {
  if (objects.length === 0) return "Empty layout";

  const objectCounts: Record<string, number> = {};
  objects.forEach((obj) => {
    const type = obj.type.replace("_", " ");
    objectCounts[type] = (objectCounts[type] || 0) + 1;
  });

  const summary = Object.entries(objectCounts)
    .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
    .join(", ");

  return summary;
};

// Get layouts for a specific location
export const getLayoutsForLocation = (location: string): SavedLayout[] => {
  const allLayouts = getLayoutsFromStorage();
  return allLayouts.filter((layout) => layout.location === location);
};

// Get all unique locations from saved layouts
export const getAllLocationsFromLayouts = (): string[] => {
  const allLayouts = getLayoutsFromStorage();
  const locations = [...new Set(allLayouts.map((layout) => layout.location))];
  return locations.length > 0 ? locations : ["Main Floor"];
};

// Get all unique locations from tables
export const getLocationsFromTables = (
  tables: { location?: string }[]
): string[] => {
  const locations = [
    ...new Set(
      tables
        .map((table) => table.location)
        .filter(
          (location): location is string =>
            location !== undefined && location.trim() !== ""
        )
    ),
  ];
  return locations.length > 0 ? locations : ["Main Floor"];
};
