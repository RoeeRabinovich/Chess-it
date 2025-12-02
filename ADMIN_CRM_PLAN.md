# Admin CRM Implementation Plan

## Overview
This document outlines the step-by-step plan for implementing an Admin CRM system for the Chess-it application, focusing on User Management and Study Management features.

---

## Phase 1: Foundation & Infrastructure

### Step 1.1: Admin Route Protection
**Goal**: Ensure only admins can access admin routes

**Tasks**:
- Create `AdminRoute` component (similar to `ProtectedRoute`)
- Check `user.isAdmin` or `user.role === 'admin'` 
- Add route guard middleware
- Handle unauthorized access (redirect to home with error message)

**Files to create/modify**:
- `Client/src/components/RouteGuard/AdminRoute.tsx`
- `Client/src/App.tsx` (add admin routes)

---

### Step 1.2: Admin Layout Component
**Goal**: Create a consistent admin layout with navigation sidebar

**Tasks**:
- Create admin layout with sidebar navigation
- Include sections: Dashboard, User Management, Study Management
- Add admin header/navbar
- Responsive design (mobile-friendly sidebar)

**Files to create**:
- `Client/src/pages/Admin/layouts/AdminLayout.tsx`
- `Client/src/pages/Admin/components/AdminSidebar.tsx`
- `Client/src/pages/Admin/components/AdminHeader.tsx`

---

## Phase 2: DataTable Component (Foundation)

### Step 2.1: Core DataTable Component
**Goal**: Build a reusable, flexible DataTable component

**Features**:
- ✅ Column definitions (header, accessor, render function)
- ✅ Row selection (single/multiple)
- ✅ Sorting (ascending/descending per column)
- ✅ Pagination (integrate with existing Pagination component)
- ✅ Search/filtering (integrate with existing SearchInput)
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design (mobile-friendly)
- ✅ Custom cell rendering
- ✅ Action buttons per row

**Component API Design**:
```typescript
interface DataTableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc' | null;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedRows: string[]; // IDs
    onSelectionChange: (selectedIds: string[]) => void;
    selectable?: boolean;
  };
  emptyMessage?: string;
  className?: string;
}
```

**Files to create**:
- `Client/src/components/ui/DataTable/DataTable.tsx`
- `Client/src/components/ui/DataTable/DataTableHeader.tsx`
- `Client/src/components/ui/DataTable/DataTableRow.tsx`
- `Client/src/components/ui/DataTable/DataTableCell.tsx`
- `Client/src/components/ui/DataTable/types.ts`
- `Client/src/components/ui/DataTable/index.ts` (barrel export)

**Styling**:
- Use existing Tailwind design system
- Match existing UI component patterns (Card, Button, etc.)
- Support dark mode
- Responsive: scrollable on mobile, full table on desktop

---

## Phase 3: User Management (Step-by-Step)

### Step 3.1: Backend API - Get All Users
**Goal**: Create endpoint to fetch paginated, searchable users list

**Tasks**:
- Create admin middleware to check `isAdmin`
- Create `GET /admin/users` endpoint
- Support query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- Return: `{ users: User[], total: number, page: number, totalPages: number }`
- Include user stats: studies count, puzzle rating, join date

**Files to create/modify**:
- `Server/middlewares/adminAuth.js` (admin-only middleware)
- `Server/users/routes/adminUsersController.js` (new admin routes)
- `Server/users/services/adminUsersService.js` (admin user operations)
- `Server/users/models/adminUsersDataAccess.js` (data access layer)

---

### Step 3.2: Frontend Service - Admin User API
**Goal**: Create service to interact with admin user endpoints

**Tasks**:
- Create `adminUserService.ts` with methods:
  - `getAllUsers(params)` - fetch paginated users
  - `getUserById(id)` - get user details
  - `deleteUser(id)` - delete user
  - `banUser(id)` - ban/suspend user
  - `unbanUser(id)` - unban user
  - `promoteToAdmin(id)` - promote user to admin
  - `resetPassword(id)` - reset user password
  - `getUserActivityLogs(id)` - get user activity logs

**Files to create**:
- `Client/src/services/adminUserService.ts`

---

### Step 3.3: User Management Page - List View
**Goal**: Display users in a DataTable with basic actions

**Tasks**:
- Create Admin Users page
- Integrate DataTable component
- Fetch users with pagination/search
- Display columns: Username, Email, Role, Puzzle Rating, Join Date, Actions
- Add search functionality
- Add pagination
- Loading and error states

**Files to create**:
- `Client/src/pages/Admin/Users/Users.page.tsx`
- `Client/src/pages/Admin/Users/hooks/useUsers.ts` (data fetching hook)
- `Client/src/pages/Admin/Users/components/UsersTable.tsx`

---

### Step 3.4: User Actions - Delete, Ban, Promote
**Goal**: Implement user action buttons and modals

**Tasks**:
- Add action buttons per row (Delete, Ban/Unban, Promote, View Details)
- Create confirmation modals for destructive actions
- Implement delete user functionality
- Implement ban/unban user functionality
- Implement promote to admin functionality
- Show success/error toasts
- Refresh table after actions

**Files to create**:
- `Client/src/pages/Admin/Users/components/UserActions.tsx`
- `Client/src/pages/Admin/Users/components/DeleteUserModal.tsx`
- `Client/src/pages/Admin/Users/components/BanUserModal.tsx`
- `Client/src/pages/Admin/Users/components/PromoteUserModal.tsx`

---

### Step 3.5: User Details View
**Goal**: Show detailed user information in a modal or separate page

**Tasks**:
- Create user details view/modal
- Display: Profile info, Studies list, Puzzle rating history, Activity logs
- Show user's studies (with links)
- Display join date, last login, etc.
- Add "Reset Password" functionality

**Files to create**:
- `Client/src/pages/Admin/Users/components/UserDetailsModal.tsx`
- `Client/src/pages/Admin/Users/components/UserStudiesList.tsx`
- `Client/src/pages/Admin/Users/components/UserActivityLogs.tsx`
- `Client/src/pages/Admin/Users/components/ResetPasswordModal.tsx`

---

### Step 3.6: Backend - User Activity Logs
**Goal**: Track and return user activity logs

**Tasks**:
- Design activity log schema (if not exists)
- Create endpoint `GET /admin/users/:id/activity-logs`
- Track: login/logout, study creation, puzzle attempts, etc.
- Return paginated activity logs

**Files to create/modify**:
- `Server/users/models/mongodb/UserActivityLog.js` (if needed)
- `Server/users/routes/adminUsersController.js` (add activity logs endpoint)

---

## Phase 4: Study Management (Future)

### Step 4.1: Backend API - Get All Studies
**Goal**: Create endpoint to fetch all studies (public + private)

**Tasks**:
- Create `GET /admin/studies` endpoint
- Support pagination, search, filtering
- Return study metadata + analytics

---

### Step 4.2: Study Management Page
**Goal**: Display studies in DataTable with management actions

**Tasks**:
- Create Admin Studies page
- List all studies (public + private)
- Actions: Delete, Edit metadata, Toggle visibility
- Bulk actions: Delete multiple, Change category

---

### Step 4.3: Study Analytics
**Goal**: Display study analytics

**Tasks**:
- Show views, likes, creation date
- Display study engagement metrics

---

## Implementation Order

### Immediate Next Steps:
1. ✅ **Step 1.1**: Admin Route Protection
2. ✅ **Step 1.2**: Admin Layout Component  
3. ✅ **Step 2.1**: Core DataTable Component ← **START HERE**
4. Step 3.1: Backend API - Get All Users
5. Step 3.2: Frontend Service - Admin User API
6. Step 3.3: User Management Page - List View
7. Step 3.4: User Actions - Delete, Ban, Promote
8. Step 3.5: User Details View
9. Step 3.6: Backend - User Activity Logs

---

## Technical Decisions

### DataTable Implementation:
- **Custom component** (not external library) to maintain design consistency
- **TypeScript** for type safety
- **Tailwind CSS** for styling (match existing design system)
- **Client-side pagination** initially (can switch to server-side later)
- **Server-side search** (more efficient for large datasets)

### State Management:
- Use **React hooks** (useState, useEffect) for local state
- Consider **React Query** or **SWR** for data fetching (if needed)
- Use **Redux** only if state needs to be shared across components

### API Design:
- RESTful endpoints
- Consistent error handling
- Pagination: `page`, `limit` query params
- Search: `search` query param
- Sorting: `sortBy`, `sortOrder` query params

---

## Notes
- Each step should be reviewed and approved before proceeding
- Focus on one step at a time
- Test each feature before moving to the next
- Maintain code consistency with existing codebase patterns

