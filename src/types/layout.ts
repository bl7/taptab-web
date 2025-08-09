export interface LayoutObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  name: string;
  seats?: number; // Only for tables
  shape?: "round" | "rectangle" | "square"; // For tables
  isExistingTable?: boolean; // True if this is from existing tables API
  tableId?: string; // Reference to existing table ID
}

export type ObjectType =
  | "round_table"
  | "square_table"
  | "rectangle_table"
  | "door"
  | "bar"
  | "plant"
  | "piano"
  | "prep_center"
  | "host_table"
  | "waiter_station"
  | "storage_cabinet"
  | "existing_table"; // For tables from API

export interface ObjectTemplate {
  type: ObjectType;
  name: string;
  icon: string;
  defaultProps: Partial<LayoutObject>;
}

export interface LayoutState {
  objects: LayoutObject[];
  selectedObjectId: string | null;
  currentLocation: string;
  availableLocations: string[];
  zoom: number;
  panX: number;
  panY: number;
  isDragging: boolean;
  dragStartPos: { x: number; y: number } | null;
}

export interface LayoutActions {
  addObject: (object: LayoutObject) => void;
  updateObject: (id: string, updates: Partial<LayoutObject>) => void;
  deleteObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setDragging: (isDragging: boolean, pos?: { x: number; y: number }) => void;
  clearLayout: () => void;
  loadLayout: (objects: LayoutObject[]) => void;
  setCurrentLocation: (location: string) => void;
  setAvailableLocations: (locations: string[]) => void;
  loadLayoutForLocation: (location: string, objects: LayoutObject[]) => void;
  saveLayoutToBackend: (
    layoutName: string,
    description?: string
  ) => Promise<unknown>;
  loadLayoutFromBackend: (layoutId: string) => Promise<unknown>;
}

export interface SavedLayout {
  id: string;
  name: string;
  location: string;
  objects: LayoutObject[];
  createdAt: string;
  updatedAt: string;
}

// Canvas settings
export const CANVAS_CONFIG = {
  GRID_SIZE: 50,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3,
  ZOOM_STEP: 0.1,
  PX_TO_CM: 1, // 1px = 1cm for real-world scaling
};

// Default object sizes (in cm/px)
export const DEFAULT_SIZES = {
  round_table: { width: 120, height: 120 },
  square_table: { width: 100, height: 100 },
  rectangle_table: { width: 150, height: 80 },
  door: { width: 80, height: 20 },
  bar: { width: 400, height: 60 },
  plant: { width: 40, height: 40 },
  piano: { width: 180, height: 120 },
  prep_center: { width: 200, height: 80 },
  host_table: { width: 120, height: 60 },
  waiter_station: { width: 100, height: 100 },
  storage_cabinet: { width: 80, height: 40 },
  existing_table: { width: 100, height: 100 },
};

// Default colors
export const DEFAULT_COLORS = {
  round_table: "#8B4513",
  square_table: "#8B4513",
  rectangle_table: "#8B4513",
  door: "#654321",
  bar: "#2F4F4F",
  plant: "#228B22",
  piano: "#2C1810", // Dark brown for piano
  prep_center: "#4A5568", // Gray for kitchen equipment
  host_table: "#A0522D", // Sienna brown
  waiter_station: "#2D3748", // Dark gray
  storage_cabinet: "#8B7355", // Light brown
  existing_table: "#1E40AF",
};
