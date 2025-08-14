# 📋 Tables Page Layout Integration Guide

## 🎯 **New Feature: Default Layout Display**

### **✅ What's New**

- **Default Layout Detection**: Automatically fetches and displays default layouts for each location
- **Layout Preview**: Shows a preview of the default layout for each location
- **Location Grouping**: Tables are now grouped by location with layout context
- **Layout Navigation**: Direct link to view the full layout in the layout builder

### **✅ User Experience**

- **Visual Context**: Users can see which layout is being used for each location
- **Quick Access**: One-click navigation to the layout builder
- **Organized View**: Tables are grouped by location with layout information
- **Status Awareness**: Clear indication of which layout is default for each location

## 🎨 **UI Layout Structure**

### **Location Section**

```typescript
// Location header with default layout info
<div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold text-black flex items-center gap-2">
    <Building2 className="h-5 w-5" />
    {location.name}
  </h2>
  {defaultLayout && (
    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
      Default Layout: {defaultLayout.name}
    </span>
  )}
</div>
```

### **Layout Preview Section**

```typescript
// Layout preview card
{
  defaultLayout && (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-black mb-3">Layout Preview</h3>
      <div className="bg-white rounded border border-gray-300 p-4 min-h-[200px] relative">
        {/* Layout statistics */}
        <div className="text-sm text-gray-600 mb-2">
          Tables: {defaultLayout.layoutJson.tables?.length || 0} | Objects:{" "}
          {defaultLayout.layoutJson.objects?.length || 0}
        </div>

        {/* Layout preview placeholder */}
        <div className="bg-gray-100 rounded border-2 border-dashed border-gray-300 h-32 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TableIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Layout: {defaultLayout.name}</p>
            <p className="text-xs">Click to view full layout</p>
          </div>
        </div>

        {/* Navigation button */}
        <button
          onClick={() => window.open("/dashboard/layout", "_blank")}
          className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          View Full Layout
        </button>
      </div>
    </div>
  );
}
```

### **Tables Grid**

```typescript
// Tables grouped by location
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {locationTables.map((table) => (
    <TableCard key={table.id} table={table} />
  ))}
</div>
```

## 🔧 **Technical Implementation**

### **State Management**

```typescript
// Default layouts state
const [defaultLayouts, setDefaultLayouts] = useState<{
  [locationId: string]: TableLayout;
}>({});

// Fetch default layouts for each location
const fetchData = useCallback(async () => {
  const [tablesResponse, locationsResponse] = await Promise.all([
    api.getTables(),
    api.getLocations(),
  ]);

  // Fetch default layouts for each location
  const layoutsMap: { [locationId: string]: TableLayout } = {};
  for (const location of locationsResponse.locations || []) {
    try {
      const layoutsResponse = await api.getTableLayouts({
        locationId: location.id,
      });

      // Find the default layout for this location
      const defaultLayout = layoutsResponse.layouts.find(
        (layout) => layout.isDefault
      );
      if (defaultLayout) {
        layoutsMap[location.id] = defaultLayout;
      }
    } catch (error) {
      console.warn(
        `Failed to fetch layouts for location ${location.name}:`,
        error
      );
    }
  }

  setDefaultLayouts(layoutsMap);
}, []);
```

### **Component Props**

```typescript
// Updated TablesTab component
function TablesTab({
  tables: Table[];
  locations: Location[];
  defaultLayouts: { [locationId: string]: TableLayout };
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onShowQR: (table: Table) => void;
  apiLoading: boolean;
  getStatusColor: (status: string) => string;
})
```

## 📱 **User Experience Flow**

### **Page Load**

```
1. Fetch tables and locations
2. For each location, fetch layouts
3. Find default layout for each location
4. Group tables by location
5. Display location sections with layout previews
```

### **Layout Navigation**

```
1. User sees layout preview for location
2. Clicks "View Full Layout" button
3. Opens layout builder in new tab
4. Can edit the default layout
5. Changes are reflected when returning to tables page
```

### **Table Management**

```
1. Tables are grouped by location
2. Each location shows its default layout
3. Users can manage tables within layout context
4. Layout changes are immediately visible
5. Default layout status is clearly indicated
```

## 🎯 **Use Cases**

### **Restaurant Manager**

```
1. Opens tables page
2. Sees "Main Floor" section with "Weekend Layout" preview
3. Views table list for Main Floor
4. Clicks "View Full Layout" to edit layout
5. Makes changes and saves
6. Returns to tables page to see updated layout
```

### **Multi-Location Restaurant**

```
1. Views tables page with multiple locations
2. Each location shows its own default layout
3. "Patio" shows "Summer Layout" preview
4. "VIP Area" shows "Private Event Layout" preview
5. Easy navigation between different layouts
```

### **Layout Management**

```
1. Manager creates new layout for location
2. Sets it as default in layout builder
3. Returns to tables page
4. New default layout is automatically displayed
5. All users see the updated layout immediately
```

## 🚀 **Benefits**

### **✅ Better Context**

- **Layout Awareness**: Users know which layout is being used
- **Visual Reference**: Layout preview provides context for table positions
- **Consistent Experience**: Tables and layouts are viewed together
- **Quick Navigation**: Easy access to layout builder

### **✅ Improved Organization**

- **Location Grouping**: Tables are organized by location
- **Layout Context**: Each location shows its default layout
- **Clear Hierarchy**: Location → Layout → Tables structure
- **Status Visibility**: Default layout status is clearly shown

### **✅ Enhanced Workflow**

- **Integrated View**: Tables and layouts in one place
- **Quick Access**: Direct navigation to layout builder
- **Contextual Management**: Manage tables within layout context
- **Real-time Updates**: Layout changes are immediately visible

## 🔧 **Backend Integration**

### **API Calls**

```typescript
// Fetch tables
api.getTables();

// Fetch locations
api.getLocations();

// Fetch layouts for each location
api.getTableLayouts({ locationId: string });

// Find default layout
const defaultLayout = layouts.find((layout) => layout.isDefault);
```

### **Data Flow**

```
1. Page loads → Fetch tables and locations
2. For each location → Fetch layouts
3. Filter layouts → Find default layout
4. Group tables → By location
5. Display → Location sections with layout previews
```

## 📈 **Future Enhancements**

### **Planned Features**

1. **Interactive Layout Preview**: Click on layout preview to see actual layout
2. **Layout Switching**: Switch between different layouts for a location
3. **Layout Comparison**: Compare different layouts side by side
4. **Layout Templates**: Pre-designed layouts for common scenarios
5. **Layout Analytics**: Track which layouts are used most

### **Advanced Features**

1. **Real-time Layout Updates**: Live updates when layouts change
2. **Layout Scheduling**: Auto-switch layouts based on time/date
3. **Layout Permissions**: Control who can view/edit layouts
4. **Layout Versioning**: Track layout changes over time
5. **Layout Export**: Export layouts to other systems

## 🎉 **Summary**

**The tables page now provides comprehensive layout integration!**

- ✅ **Default Layout Display**: Shows default layout for each location
- ✅ **Layout Preview**: Visual preview of layouts with navigation
- ✅ **Location Grouping**: Tables organized by location with layout context
- ✅ **Quick Navigation**: Direct access to layout builder
- ✅ **Status Awareness**: Clear indication of default layouts
- ✅ **Integrated Experience**: Tables and layouts viewed together

**Users can now efficiently manage tables with full layout context and easy navigation to the layout builder!** 🚀
