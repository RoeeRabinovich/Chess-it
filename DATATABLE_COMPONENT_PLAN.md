# DataTable Component - Detailed Implementation Plan

## Overview
Build a reusable, flexible DataTable component that will serve as the foundation for Admin CRM tables (Users, Studies, etc.).

---

## Component Architecture

### File Structure
```
Client/src/components/ui/DataTable/
├── DataTable.tsx          # Main component
├── DataTableHeader.tsx    # Table header with sorting
├── DataTableRow.tsx       # Table row component
├── DataTableCell.tsx      # Table cell component
├── DataTableToolbar.tsx   # Search, filters, bulk actions
├── DataTablePagination.tsx # Pagination wrapper
├── DataTableEmpty.tsx     # Empty state component
├── DataTableLoading.tsx   # Loading state component
├── types.ts               # TypeScript types/interfaces
├── utils.ts               # Helper functions
└── index.ts               # Barrel exports
```

---

## Component API Design

### Core Types

```typescript
// Column definition
export interface DataTableColumn<T> {
  /** Column header text */
  header: string;
  
  /** 
   * Accessor: key path or function to get cell value
   * Examples: "username" or (row) => row.user.name
   */
  accessor: keyof T | ((row: T) => any);
  
  /** Whether column is sortable */
  sortable?: boolean;
  
  /** 
   * Custom render function for cell content
   * Receives: (value, row, column)
   */
  render?: (value: any, row: T, column: DataTableColumn<T>) => React.ReactNode;
  
  /** CSS classes for header cell */
  headerClassName?: string;
  
  /** CSS classes for data cells */
  cellClassName?: string;
  
  /** Column width (CSS value or number for pixels) */
  width?: string | number;
  
  /** Minimum column width */
  minWidth?: string | number;
  
  /** Whether column is visible (for responsive) */
  visible?: boolean | ((breakpoint: string) => boolean);
}

// Sorting state
export interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

// Selection state
export interface SelectionState {
  selectedIds: string[];
  selectable?: boolean;
  selectAll?: boolean;
}

// Pagination props
export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
}

// Main component props
export interface DataTableProps<T> {
  /** Array of data rows */
  data: T[];
  
  /** Column definitions */
  columns: DataTableColumn<T>[];
  
  /** Unique identifier key for each row (default: 'id' or '_id') */
  rowIdKey?: keyof T | ((row: T) => string);
  
  /** Loading state */
  loading?: boolean;
  
  /** Pagination configuration */
  pagination?: DataTablePaginationProps;
  
  /** Search configuration */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
  };
  
  /** Sorting configuration */
  sorting?: {
    state: SortState;
    onSort: (column: string, direction: 'asc' | 'desc' | null) => void;
  };
  
  /** Row selection configuration */
  selection?: {
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    selectable?: boolean;
  };
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  
  /** Row click handler */
  onRowClick?: (row: T) => void;
  
  /** Row hover effect */
  hoverable?: boolean;
  
  /** Striped rows */
  striped?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Table container CSS classes */
  containerClassName?: string;
  
  /** Responsive: show cards on mobile instead of table */
  responsive?: boolean;
  
  /** Mobile card render function */
  renderMobileCard?: (row: T) => React.ReactNode;
}
```

---

## Features Breakdown

### 1. Basic Table Rendering
- ✅ Render rows and columns from data array
- ✅ Support custom cell rendering
- ✅ Column width control
- ✅ Responsive design (horizontal scroll on mobile)

### 2. Sorting
- ✅ Click column header to sort
- ✅ Visual indicators (arrows) for sort direction
- ✅ Toggle: none → asc → desc → none
- ✅ Callback to parent for server-side sorting

### 3. Search/Filtering
- ✅ Search input in toolbar
- ✅ Debounced search (configurable)
- ✅ Search callback to parent (server-side filtering)
- ✅ Clear search button

### 4. Pagination
- ✅ Integrate existing Pagination component
- ✅ Show page info (e.g., "Showing 1-10 of 100")
- ✅ Optional page size selector
- ✅ Callback to parent for page changes

### 5. Row Selection
- ✅ Checkbox column (if selection enabled)
- ✅ Select individual rows
- ✅ Select all rows (current page)
- ✅ Visual feedback for selected rows
- ✅ Bulk actions toolbar when rows selected

### 6. Loading & Empty States
- ✅ Loading spinner overlay
- ✅ Empty state message/component
- ✅ Customizable empty state

### 7. Actions Column
- ✅ Support action buttons per row
- ✅ Dropdown menu for multiple actions
- ✅ Customizable action renderer

### 8. Responsive Design
- ✅ Mobile: Horizontal scroll or card view
- ✅ Tablet: Optimized column visibility
- ✅ Desktop: Full table view
- ✅ Breakpoint-aware column visibility

---

## Implementation Steps

### Step 1: Basic Structure & Types
**Goal**: Set up component structure and TypeScript types

**Tasks**:
1. Create file structure
2. Define all TypeScript interfaces/types
3. Create basic DataTable component shell
4. Export types and components

**Files**:
- `types.ts` - All type definitions
- `DataTable.tsx` - Main component (basic structure)
- `index.ts` - Exports

---

### Step 2: Basic Table Rendering
**Goal**: Render a simple table with data

**Tasks**:
1. Implement basic table HTML structure
2. Render header row from columns
3. Render data rows
4. Handle accessor (key path or function)
5. Basic styling (match design system)

**Files**:
- `DataTable.tsx` - Main rendering logic
- `DataTableHeader.tsx` - Header row
- `DataTableRow.tsx` - Data row
- `DataTableCell.tsx` - Individual cell

**Styling**:
- Use existing Card, Button components
- Match existing table-like patterns
- Support dark mode
- Border and spacing consistent with design system

---

### Step 3: Sorting
**Goal**: Add column sorting functionality

**Tasks**:
1. Add sort state management
2. Visual sort indicators (arrows)
3. Click handler on sortable columns
4. Toggle sort direction
5. Callback to parent with sort info

**Files**:
- `DataTableHeader.tsx` - Add sorting UI and logic
- `DataTable.tsx` - Handle sort callbacks

**UI Elements**:
- Sort icons (ChevronUp, ChevronDown from lucide-react)
- Active sort highlight
- Hover state on sortable columns

---

### Step 4: Search Integration
**Goal**: Add search input to table toolbar

**Tasks**:
1. Create DataTableToolbar component
2. Integrate existing SearchInput component
3. Handle search value changes
4. Debounce search input
5. Clear search functionality

**Files**:
- `DataTableToolbar.tsx` - Toolbar with search
- `DataTable.tsx` - Integrate toolbar

---

### Step 5: Pagination Integration
**Goal**: Add pagination controls

**Tasks**:
1. Create DataTablePagination wrapper
2. Integrate existing Pagination component
3. Show page info (e.g., "1-10 of 100")
4. Handle page change callbacks
5. Optional page size selector

**Files**:
- `DataTablePagination.tsx` - Pagination wrapper
- `DataTable.tsx` - Integrate pagination

---

### Step 6: Row Selection
**Goal**: Add checkbox selection for rows

**Tasks**:
1. Add checkbox column (if selection enabled)
2. Individual row selection
3. Select all checkbox in header
4. Visual feedback (selected row styling)
5. Selection state management
6. Bulk actions toolbar

**Files**:
- `DataTable.tsx` - Selection logic
- `DataTableHeader.tsx` - Select all checkbox
- `DataTableRow.tsx` - Row checkbox
- `DataTableToolbar.tsx` - Bulk actions

---

### Step 7: Loading & Empty States
**Goal**: Add loading and empty state components

**Tasks**:
1. Create DataTableLoading component
2. Create DataTableEmpty component
3. Show loading overlay when loading=true
4. Show empty state when data.length === 0
5. Customizable empty messages/components

**Files**:
- `DataTableLoading.tsx` - Loading spinner overlay
- `DataTableEmpty.tsx` - Empty state message
- `DataTable.tsx` - Conditional rendering

---

### Step 8: Responsive Design
**Goal**: Make table mobile-friendly

**Tasks**:
1. Horizontal scroll on mobile (basic)
2. Optional card view for mobile
3. Hide less important columns on small screens
4. Responsive toolbar
5. Touch-friendly interactions

**Files**:
- `DataTable.tsx` - Responsive logic
- `DataTableRow.tsx` - Mobile card rendering (if needed)

---

### Step 9: Actions Column
**Goal**: Support action buttons per row

**Tasks**:
1. Support actions column in column definition
2. Render action buttons/dropdown
3. Handle action clicks
4. Customizable action renderer

**Files**:
- `DataTable.tsx` - Actions column support
- `DataTableCell.tsx` - Action button rendering

---

### Step 10: Polish & Refinement
**Goal**: Final touches and optimization

**Tasks**:
1. Add hover effects
2. Striped rows option
3. Keyboard navigation (optional)
4. Accessibility (ARIA labels)
5. Performance optimization (memoization)
6. Documentation comments

---

## Styling Guidelines

### Design System Integration:
- Use existing Tailwind classes
- Match Card component styling
- Use existing color variables (--border, --background, etc.)
- Support dark mode automatically

### Table Styling:
```css
/* Table container */
- Border: 1px solid hsl(var(--border))
- Background: hsl(var(--card))
- Rounded corners: rounded-lg
- Shadow: shadow-sm

/* Header */
- Background: hsl(var(--muted))
- Font weight: semibold
- Border bottom: 2px solid hsl(var(--border))

/* Rows */
- Hover: bg-muted/50
- Selected: bg-accent/20
- Striped: even rows bg-muted/30

/* Cells */
- Padding: px-4 py-3
- Border: border-b border-border
```

---

## Example Usage

```typescript
// Example: Users table
const columns: DataTableColumn<User>[] = [
  {
    header: 'Username',
    accessor: 'username',
    sortable: true,
  },
  {
    header: 'Email',
    accessor: 'email',
    sortable: true,
  },
  {
    header: 'Role',
    accessor: 'role',
    render: (value) => (
      <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
  {
    header: 'Join Date',
    accessor: 'createdAt',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    header: 'Actions',
    accessor: '_id',
    render: (value, row) => (
      <UserActions userId={value} user={row} />
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  rowIdKey="_id"
  loading={isLoading}
  pagination={{
    currentPage: page,
    totalPages: totalPages,
    pageSize: 10,
    totalItems: totalUsers,
    onPageChange: setPage,
  }}
  search={{
    value: searchQuery,
    onChange: setSearchQuery,
    placeholder: "Search users...",
    debounceMs: 300,
  }}
  sorting={{
    state: { column: sortBy, direction: sortOrder },
    onSort: handleSort,
  }}
  selection={{
    selectedIds: selectedUserIds,
    onSelectionChange: setSelectedUserIds,
    selectable: true,
  }}
  emptyMessage="No users found"
/>
```

---

## Testing Considerations

### Manual Testing Checklist:
- [ ] Renders data correctly
- [ ] Sorting works (asc/desc)
- [ ] Search filters data
- [ ] Pagination navigates pages
- [ ] Row selection works (single & all)
- [ ] Loading state displays
- [ ] Empty state displays
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Actions buttons work
- [ ] Custom cell rendering works

---

## Next Steps After DataTable

Once DataTable is complete:
1. Create AdminRoute component
2. Create AdminLayout component
3. Build backend API for users
4. Build Users Management page using DataTable

---

## Questions to Consider

1. **Client-side vs Server-side sorting/filtering?**
   - Recommendation: Start with server-side (more scalable)
   - DataTable just triggers callbacks

2. **Virtual scrolling for large datasets?**
   - Not needed initially (pagination handles it)
   - Can add later if needed

3. **Export to CSV/Excel?**
   - Future enhancement
   - Not in initial scope

4. **Column resizing?**
   - Future enhancement
   - Not in initial scope

5. **Column reordering?**
   - Future enhancement
   - Not in initial scope

---

## Approval Checklist

Before starting implementation, confirm:
- [ ] Component API design approved
- [ ] File structure approved
- [ ] Feature set approved
- [ ] Styling approach approved
- [ ] Implementation order approved

