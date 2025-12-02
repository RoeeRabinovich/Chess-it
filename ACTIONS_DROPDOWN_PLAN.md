# Actions Dropdown & View Details Modal - Implementation Plan

## Overview

This plan covers implementing the "View Details" action in the DataTable actions dropdown, which will open a modal showing the user's profile information. It also includes adding a `studiesCreated` counter to the User type and incrementing it when studies are created.

---

## Step 1: Add `studiesCreated` Field to User Type

### 1.1 Frontend User Type

**File:** `Client/src/types/user.ts`

- Add `studiesCreated?: number;` to the `User` interface
- Default value: `0` (optional field)

### 1.2 Backend User Schema

**File:** `Server/users/models/mongodb/User.js` (or equivalent)

- Add `studiesCreated: { type: Number, default: 0, min: 0 }` to the user schema
- Ensure it's included in user responses

### 1.3 Demo User Type (for DataTableDemo)

**File:** `Client/src/pages/DataTableDemo/DataTableDemo.page.tsx`

- Add `studiesCreated: number;` to `DemoUser` interface
- Update mock data to include `studiesCreated` values

---

## Step 2: Increment `studiesCreated` on Study Creation

### 2.1 Backend - Study Creation Service

**File:** `Server/studies/services/studiesService.js`

- After successfully creating a study, increment the user's `studiesCreated` count
- Use MongoDB `$inc` operator for atomic increment
- Add error handling if user update fails

### 2.2 Implementation Details

- Location: In `createStudyService` function, after `createStudy(normalizedStudy)` succeeds
- Use User model to find and update: `User.findByIdAndUpdate(userId, { $inc: { studiesCreated: 1 } })`
- This ensures atomic operation and prevents race conditions

---

## Step 3: Create User Details Modal Component

### 3.1 Component Structure

**File:** `Client/src/pages/DataTableDemo/components/UserDetailsModal.tsx`

**Props:**

```typescript
interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DemoUser | null;
}
```

### 3.2 Modal Content Sections

#### Section 1: User Header

- Avatar (or username initial)
- Username (large, prominent)
- Role badge (Admin/User)
- Email address

#### Section 2: Profile Information

- **Username:** [value]
- **Email:** [value]
- **Role:** [Badge: ADMIN/USER]
- **Puzzle Rating:** [value] (if available)
- **Studies Created:** [value] (new field)
- **Join Date:** [formatted date]

#### Section 3: Statistics (Optional - can be added later)

- Total studies created
- Account age
- Last activity (if we add this later)

### 3.3 Design Considerations

- Use existing `Modal` component from `Client/src/components/ui/Modal.tsx`
- Match styling with existing modals (DeleteSelectedModal)
- Responsive design (mobile-friendly)
- Use `Card` components for sections if needed
- Format dates using existing date formatting utilities

---

## Step 4: Integrate View Details Action

### 4.1 Update Actions Dropdown

**File:** `Client/src/pages/DataTableDemo/DataTableDemo.page.tsx`

**Changes:**

1. Add state for modal: `const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);`
2. Add state for modal open: `const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);`
3. Update "View Details" action in dropdown:
   ```typescript
   <DropdownMenuItem
     onClick={(e) => {
       e.stopPropagation();
       setSelectedUser(user);
       setIsUserDetailsModalOpen(true);
     }}
   >
     <Eye className="mr-2 h-4 w-4" />
     View Details
   </DropdownMenuItem>
   ```

### 4.2 Add Modal to Component

- Import `UserDetailsModal`
- Add modal component at the end of the return statement
- Pass `isOpen`, `onClose`, and `user` props

---

## Step 5: Update Mock Data

### 5.1 Add `studiesCreated` to Mock Users

**File:** `Client/src/pages/DataTableDemo/DataTableDemo.page.tsx`

Update each user in `mockUsers` array:

```typescript
{
  _id: "1",
  username: "chessmaster",
  email: "chessmaster@example.com",
  role: "admin",
  puzzleRating: 1850,
  studiesCreated: 12, // Add this
  createdAt: "2024-01-15T10:30:00Z",
},
```

---

## Step 6: Backend Implementation Details

### 6.1 User Model Update

**File:** `Server/users/models/mongodb/User.js`

Add to schema:

```javascript
studiesCreated: {
  type: Number,
  default: 0,
  min: 0,
},
```

### 6.2 Study Creation Service Update

**File:** `Server/studies/services/studiesService.js`

In `createStudyService` function, after successful study creation:

```javascript
// After: const result = await createStudy(normalizedStudy);

// Increment user's studiesCreated count
const User = require("../../users/models/mongodb/User");
await User.findByIdAndUpdate(userId, {
  $inc: { studiesCreated: 1 },
});

return Promise.resolve(result);
```

### 6.3 Error Handling

- If user update fails, log error but don't fail the study creation
- Consider adding a transaction if using MongoDB transactions
- Ensure backward compatibility (existing users without field default to 0)

---

## Step 7: Testing Checklist

### 7.1 Frontend

- [ ] Modal opens when "View Details" is clicked
- [ ] Modal displays all user information correctly
- [ ] Modal closes when clicking outside or close button
- [ ] Modal is responsive on mobile
- [ ] `studiesCreated` displays correctly in modal
- [ ] Mock data includes `studiesCreated` values

### 7.2 Backend

- [ ] User schema includes `studiesCreated` field
- [ ] New users default to `studiesCreated: 0`
- [ ] Study creation increments `studiesCreated` correctly
- [ ] Multiple rapid study creations increment correctly (no race conditions)
- [ ] Existing users without field work correctly (defaults to 0)

---

## Step 8: Future Enhancements (Optional)

### 8.1 Additional Modal Features

- Link to user's studies list
- Activity timeline
- Edit user button (for admins)
- Ban/Suspend user button (for admins)

### 8.2 Additional Statistics

- Studies liked count
- Last login date
- Account status (active/banned/suspended)

---

## Implementation Order

1. **Step 1:** Add `studiesCreated` to User types (Frontend & Backend)
2. **Step 2:** Update backend to increment count on study creation
3. **Step 3:** Create `UserDetailsModal` component
4. **Step 4:** Integrate modal with actions dropdown
5. **Step 5:** Update mock data
6. **Step 6:** Test all functionality

---

## Questions to Consider

1. **Should we show studiesCreated in the DataTable itself?**

   - Could add as a column (optional, can be hidden on mobile)
   - Or keep it only in the details modal

2. **Should we decrement on study deletion?**

   - For now: No (keeps history)
   - Future: Could add if needed

3. **What about study updates?**

   - No change needed (count is for creation only)

4. **Should admins be able to edit user details from the modal?**
   - Future enhancement
   - For now: View-only

---

## Files to Create/Modify

### New Files:

- `Client/src/pages/DataTableDemo/components/UserDetailsModal.tsx`

### Modified Files:

- `Client/src/types/user.ts` - Add `studiesCreated` field
- `Client/src/pages/DataTableDemo/DataTableDemo.page.tsx` - Add modal state and integration
- `Server/users/models/mongodb/User.js` - Add `studiesCreated` to schema
- `Server/studies/services/studiesService.js` - Increment count on creation

---

## Approval

Please review this plan and confirm:

- [ ] Modal content and layout are acceptable
- [ ] `studiesCreated` field approach is correct
- [ ] Backend increment logic is appropriate
- [ ] Implementation order makes sense

Once approved, we'll proceed with implementation step by step.
