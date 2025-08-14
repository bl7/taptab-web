# 🎛️ Layout Management Features Guide

## 🎯 **New Layout Management Features**

### **✅ Default Layout Management**

- **Set as Default**: Mark any layout as the default for a location
- **Default Indicator**: Clear visual badge showing which layout is default
- **One Default Per Location**: Only one layout can be default per location
- **Automatic Selection**: Default layouts are highlighted in lists

### **✅ Active/Inactive Status**

- **Toggle Active Status**: Activate or deactivate layouts
- **Inactive Indicator**: Clear visual badge for inactive layouts
- **Status Management**: Control which layouts are available for use
- **Filtering**: Inactive layouts are still visible but clearly marked

## 🎨 **UI Features**

### **Layout Status Badges**

```typescript
// Default Layout Badge
<span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
  Default
</span>

// Inactive Layout Badge
<span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
  Inactive
</span>

// Location Badge
<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
  {locationName}
</span>
```

### **Action Buttons**

```typescript
// Set as Default Button (only shown if not already default)
{
  !layout.isDefault && (
    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded">
      Set Default
    </button>
  );
}

// Toggle Active Status Button
<button
  className={`px-3 py-1 text-sm rounded ${
    layout.isActive
      ? "bg-orange-600 text-white" // Deactivate
      : "bg-gray-600 text-white" // Activate
  }`}
>
  {layout.isActive ? "Deactivate" : "Activate"}
</button>;
```

## 🔧 **Backend Integration**

### **API Endpoints Used**

```typescript
// Set layout as default
api.setDefaultTableLayout(layoutId: string)

// Update layout status
api.updateTableLayout(layoutId: string, { isActive: boolean })

// Get layouts with status
api.getTableLayouts({ locationId: string })
```

### **Layout Properties**

```typescript
interface TableLayout {
  id: string;
  name: string;
  description?: string;
  isActive: boolean; // Whether layout is active
  isDefault: boolean; // Whether layout is default for location
  locationId: string;
  layoutJson: LayoutData;
  // ... other properties
}
```

## 📱 **User Experience Flow**

### **Setting Default Layout**

```
1. Open Load Layout modal
2. Find layout you want as default
3. Click "Set Default" button
4. Layout becomes default (green badge appears)
5. Other layouts lose default status
```

### **Managing Active Status**

```
1. Open Load Layout modal
2. Find layout to toggle
3. Click "Activate" or "Deactivate" button
4. Layout status changes immediately
5. Inactive layouts show gray badge
```

### **Layout Selection with Status**

```
1. Select location with multiple layouts
2. Modal shows all layouts with status badges
3. Default layout is highlighted
4. Inactive layouts are marked but still selectable
5. Choose based on status and content
```

## 🎯 **Use Cases**

### **Restaurant Manager Scenario**

```
1. Manager creates "Weekend Layout" for Main Floor
2. Sets it as default for weekend operations
3. Creates "Weekday Layout" for regular days
4. Both layouts are active and available
5. Staff can easily switch between layouts
```

### **Seasonal Layouts**

```
1. Restaurant has "Summer Patio Layout"
2. Sets it as default during summer months
3. Deactivates "Winter Layout" during summer
4. Activates "Winter Layout" when season changes
5. Easy seasonal layout management
```

### **Event Layouts**

```
1. Restaurant creates "Private Event Layout"
2. Keeps it inactive for regular use
3. Activates it only for special events
4. Sets as default during event periods
5. Deactivates after events end
```

## 🔄 **Status Management Logic**

### **Default Layout Rules**

- **One Default Per Location**: Only one layout can be default per location
- **Automatic Update**: Setting a new default removes default from others
- **Persistent**: Default status is saved in database
- **Visual Feedback**: Default layouts are clearly marked

### **Active Status Rules**

- **Independent**: Active status is independent of default status
- **Multiple Active**: Multiple layouts can be active simultaneously
- **Toggle-able**: Can activate/deactivate any layout
- **Visual Indicators**: Inactive layouts are clearly marked

### **Combination States**

```
✅ Active + Default: Primary layout for location
✅ Active + Not Default: Available for selection
❌ Inactive + Default: Default but not available (edge case)
❌ Inactive + Not Default: Not available for use
```

## 📊 **Layout List Display**

### **Layout Information Shown**

```typescript
// Layout header with badges
<h4 className="font-medium text-black">{layout.name}</h4>
<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
  {locationName}
</span>
{layout.isDefault && <DefaultBadge />}
{!layout.isActive && <InactiveBadge />}

// Layout details
<p className="text-sm text-gray-600">{layout.description}</p>
<p className="text-xs text-gray-500">
  Tables: {tableCount} | Objects: {objectCount} |
  Created: {creationDate}
</p>
```

### **Action Buttons Available**

```typescript
// Primary actions
<LoadButton />           // Load layout
<SetDefaultButton />     // Set as default (if not default)
<ToggleActiveButton />   // Activate/Deactivate
<DeleteButton />         // Delete layout
```

## 🚀 **Benefits**

### **✅ Better Organization**

- **Clear Hierarchy**: Default layouts are clearly identified
- **Status Management**: Easy to control which layouts are available
- **Visual Clarity**: Status badges make layout state obvious
- **Flexible Control**: Independent control of default and active status

### **✅ Improved Workflow**

- **Quick Selection**: Default layouts are easy to find
- **Status Awareness**: Users know which layouts are available
- **Efficient Management**: Easy to toggle layouts on/off
- **Clear Actions**: Obvious buttons for each action

### **✅ Enhanced User Experience**

- **Intuitive Interface**: Status badges are self-explanatory
- **Flexible Options**: Multiple ways to organize layouts
- **Visual Feedback**: Immediate feedback on status changes
- **Consistent Design**: Status badges follow design system

## 🔧 **Technical Implementation**

### **State Management**

```typescript
// Track layout status changes
const handleSetDefaultLayout = async (layoutId: string) => {
  await api.setDefaultTableLayout(layoutId);
  await fetchSavedLayouts(); // Refresh to update status
  showToast.success("Layout set as default");
};

const handleToggleLayoutActive = async (
  layoutId: string,
  isActive: boolean
) => {
  await api.updateTableLayout(layoutId, { isActive });
  await fetchSavedLayouts(); // Refresh to update status
  showToast.success(`Layout ${isActive ? "activated" : "deactivated"}`);
};
```

### **UI Updates**

```typescript
// Conditional rendering based on status
{
  !layout.isDefault && (
    <SetDefaultButton onClick={() => onSetDefault(layout.id)} />
  );
}

<ToggleActiveButton
  onClick={() => onToggleActive(layout.id, !layout.isActive)}
  className={layout.isActive ? "deactivate" : "activate"}
>
  {layout.isActive ? "Deactivate" : "Activate"}
</ToggleActiveButton>;
```

## 📈 **Future Enhancements**

### **Planned Features**

1. **Layout Scheduling**: Auto-activate layouts based on time/date
2. **Layout Templates**: Pre-designed layouts for common scenarios
3. **Layout Categories**: Organize layouts by type (dining, events, etc.)
4. **Layout Permissions**: Control who can modify default layouts
5. **Layout Analytics**: Track which layouts are used most

### **Advanced Features**

1. **Layout Versioning**: Track changes and revert to previous versions
2. **Layout Collaboration**: Multiple users can edit layouts
3. **Layout Automation**: Auto-generate layouts based on table data
4. **Layout Validation**: Check for design issues and conflicts
5. **Layout Integration**: Connect with POS and reservation systems

## 🎉 **Summary**

**The layout system now provides comprehensive layout management!**

- ✅ **Default Layout Management**: Set and manage default layouts per location
- ✅ **Active/Inactive Status**: Control which layouts are available for use
- ✅ **Visual Status Indicators**: Clear badges show layout status
- ✅ **Flexible Actions**: Easy buttons for all layout management tasks
- ✅ **Backend Integration**: Full API support for status management
- ✅ **Improved UX**: Intuitive interface for layout organization

**Users can now efficiently manage multiple layouts with clear status control and default layout selection!** 🚀
