# Restaurant Layout Builder

## 🎯 Overview

A comprehensive restaurant layout builder built with React-Konva, Zustand, and TypeScript. This feature allows restaurant managers to design their floor plans using a drag-and-drop interface with real-world scaling and professional tools.

## ✨ Features Implemented

### 🖼️ **Canvas & Grid System**

- Full-screen React-Konva canvas with responsive design
- Grid background (50px = 50cm) for precise measurements
- Pan with mouse drag and zoom with mouse wheel
- Real-world scaling: 1px = 1cm
- Grid snapping and alignment helpers

### 📚 **Object Library**

- **Default Templates**: Round table, square table, rectangle table, door, bar/counter, plant
- **Existing Tables Integration**: Automatically fetches tables from your restaurant API
- Drag-and-drop from library to canvas
- Collapsible sections with search/filter capabilities
- Visual previews with size and capacity information

### 🎨 **Interactive Canvas**

- **Selection**: Click objects to select and edit
- **Transform**: Resize, rotate, and move objects with visual handles
- **Multi-select**: Support for selecting multiple objects (planned)
- **Snap-to-grid**: Precise positioning with grid alignment
- **Zoom controls**: 10% to 300% zoom with controls and mouse wheel

### ⚙️ **Properties Panel**

- **Basic Properties**: Name, color (preset + custom picker), rotation
- **Size & Position**: Width, height, X/Y coordinates in centimeters
- **Table-specific**: Number of seats, table type
- **Quick Actions**: Reset rotation, standard sizes, duplicate, delete
- **Real-time Updates**: All changes reflect immediately on canvas

### 💾 **Save & Load System**

- **Local Storage**: Save layouts with names and timestamps
- **Export/Import**: JSON file export/import for backup and sharing
- **Layout Library**: Browse, load, and delete saved layouts
- **Validation**: Ensures layout integrity on import
- **Preview**: Visual summary of objects in each layout

### 🔗 **Tables Integration**

- Fetches existing tables from `/api/tables` endpoint
- Displays table status (available, occupied, reserved, cleaning)
- Maintains connection to original table data
- Shows table numbers, capacity, and location
- Special styling for API-sourced tables

## 🏗️ **Technical Architecture**

### **State Management (Zustand)**

```typescript
interface LayoutStore {
  objects: LayoutObject[];
  selectedObjectId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  // Actions for managing state
}
```

### **Object Types**

- `round_table`, `square_table`, `rectangle_table`
- `door`, `bar`, `plant`
- `existing_table` (from API)

### **File Structure**

```
src/
├── app/dashboard/layout/page.tsx       # Main layout builder page
├── components/layout/
│   ├── ObjectLibrary.tsx               # Draggable object sidebar
│   ├── LayoutCanvas.tsx                # React-Konva canvas
│   ├── PropertiesPanel.tsx             # Object editing panel
│   └── KonvaStage.tsx                  # SSR-safe wrapper
├── lib/
│   ├── layout-store.ts                 # Zustand store
│   └── layout-utils.ts                 # Save/load utilities
└── types/layout.ts                     # TypeScript definitions
```

## 📱 **Responsive Design**

- **Desktop**: Three-panel layout (library, canvas, properties)
- **Tablet**: Collapsible panels with optimized touch targets
- **Mobile**: Bottom sheets and drawer-style interfaces
- **Touch Support**: Optimized for touch interactions

## 🎛️ **Controls & Usage**

### **Mouse Controls**

- **Left Click**: Select objects
- **Drag**: Move selected objects or pan canvas (empty space)
- **Mouse Wheel**: Zoom in/out
- **Transform Handles**: Resize and rotate selected objects

### **Keyboard Shortcuts**

- `Delete`: Remove selected object
- `Ctrl+D`: Duplicate selected object
- `Ctrl+Z`: Undo (planned)
- `Ctrl+S`: Save layout (planned)

### **Canvas Tools**

- Zoom controls (10% - 300%)
- Reset view button
- Grid toggle (planned)
- Snap-to-grid toggle (planned)

## 💻 **Development Setup**

### **Dependencies**

```bash
npm install react-konva konva zustand
```

### **Configuration**

- Next.js webpack config for Konva SSR compatibility
- Dynamic imports to prevent server-side rendering issues
- Canvas module externalization for Node.js builds

## 🚀 **Future Enhancements**

### **Planned Features**

- [ ] Multi-select and group operations
- [ ] Undo/redo system
- [ ] Layer management
- [ ] Templates and themes
- [ ] Measurement tools
- [ ] Print to scale functionality
- [ ] Database integration for persistent storage
- [ ] Collaborative editing
- [ ] Object libraries and asset management
- [ ] Advanced snapping and alignment
- [ ] Grid size customization

### **API Integration**

- Currently uses localStorage for persistence
- Ready for backend API integration
- Structured data format for easy database storage
- Import/export compatibility for data migration

## 📊 **Performance**

- **Bundle Size**: ~9KB for layout page
- **Rendering**: Hardware-accelerated canvas rendering
- **Memory**: Efficient object management with Zustand
- **Loading**: Dynamic imports for optimal bundle splitting

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Canvas not loading**: Ensure React-Konva is client-side only
2. **Build errors**: Check webpack externals for 'canvas' module
3. **Performance**: Use object pooling for large layouts
4. **Touch issues**: Ensure proper touch event handling

### **Browser Support**

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 **Usage Examples**

### **Basic Layout Creation**

1. Navigate to `/dashboard/layout`
2. Drag objects from library to canvas
3. Select and modify properties
4. Save with a descriptive name

### **Integration with Existing Tables**

1. Tables automatically appear in object library
2. Drag existing tables to maintain API connection
3. Properties panel shows original table data
4. Layout preserves table relationships

---

**Built with ❤️ for restaurant management efficiency**
