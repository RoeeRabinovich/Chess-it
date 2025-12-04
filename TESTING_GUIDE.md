# Testing Guide: Email Removal from localStorage

This guide helps you test that removing email from localStorage doesn't break any functionality.

## Pre-Testing Checklist

1. **Clear existing localStorage data** (to test with fresh data):
   - Open browser DevTools (F12)
   - Go to Application/Storage tab → Local Storage
   - Clear all localStorage items
   - Or run in console: `localStorage.clear()`

## Test Scenarios

### 1. User Registration
**Steps:**
1. Navigate to registration page
2. Fill out the registration form with valid data
3. Submit the form
4. Check browser console for errors
5. Check localStorage: `localStorage.getItem('user')` - should NOT contain email
6. Verify user is redirected successfully

**Expected Results:**
- ✅ Registration succeeds
- ✅ User object in localStorage: `{ _id, username, createdAt }` (NO email)
- ✅ No console errors
- ✅ Success toast appears

**What to Check:**
```javascript
// In browser console after registration:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user); // Should NOT have email property
console.log(user.email); // Should be undefined
```

---

### 2. User Login
**Steps:**
1. Logout if already logged in
2. Navigate to login page
3. Enter valid credentials
4. Submit login form
5. Check browser console for errors
6. Check localStorage: `localStorage.getItem('user')` - should NOT contain email

**Expected Results:**
- ✅ Login succeeds
- ✅ User object in localStorage: `{ _id, username, createdAt, puzzleRating, studiesCreated, isAdmin }` (NO email)
- ✅ No console errors
- ✅ User is authenticated and redirected

**What to Check:**
```javascript
// In browser console after login:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user); // Should NOT have email property
console.log(user.email); // Should be undefined
```

---

### 3. Profile Page Display
**Steps:**
1. Login as a user
2. Navigate to Profile page
3. Check that email is displayed correctly

**Expected Results:**
- ✅ Profile page loads without errors
- ✅ Email is displayed in the profile information card
- ✅ Email comes from API (`getProfile()`), NOT from localStorage

**What to Check:**
- Email should be visible in the Profile Information Card
- Check Network tab - should see API call to `/users/profile` that returns email
- The email displayed comes from the API response, not localStorage

---

### 4. Update Username
**Steps:**
1. Login as a user
2. Navigate to Profile page
3. Click edit on username
4. Change username
5. Submit the change
6. Check localStorage after update

**Expected Results:**
- ✅ Username updates successfully
- ✅ User object in localStorage updated: `{ _id, username, createdAt, puzzleRating, studiesCreated }` (NO email)
- ✅ No console errors
- ✅ Profile page still shows email (from API)

**What to Check:**
```javascript
// After username update:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.email); // Should be undefined
// But profile page should still show email from API
```

---

### 5. Update Puzzle Rating
**Steps:**
1. Login as a user
2. Complete a puzzle (or trigger rating update)
3. Check localStorage after rating update

**Expected Results:**
- ✅ Rating updates successfully
- ✅ User object in localStorage updated: `{ _id, username, createdAt, puzzleRating, studiesCreated }` (NO email)
- ✅ No console errors

**What to Check:**
```javascript
// After puzzle rating update:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.email); // Should be undefined
```

---

### 6. Password Reset from Profile
**Steps:**
1. Login as a user
2. Navigate to Profile page
3. Click "Reset Password" button
4. Verify password reset email is sent

**Expected Results:**
- ✅ Password reset request succeeds
- ✅ Email is sent (email comes from API `getProfile()`, not localStorage)
- ✅ No errors

**What to Check:**
- Check Network tab - should see API call to `/users/profile` before password reset
- Password reset should use email from API response

---

### 7. Page Refresh / App Reload
**Steps:**
1. Login as a user
2. Navigate to any page (e.g., Profile, Home)
3. Refresh the page (F5)
4. Check that app loads correctly

**Expected Results:**
- ✅ App loads without errors
- ✅ User remains authenticated
- ✅ No console errors about missing email
- ✅ Profile page still shows email when visited

**What to Check:**
- Check console for any errors
- User should remain logged in after refresh
- localStorage should have user object without email

---

### 8. Admin Pages (if applicable)
**Steps:**
1. Login as admin user
2. Navigate to Admin → Users Management
3. View user details
4. Check that emails are displayed

**Expected Results:**
- ✅ Admin pages load correctly
- ✅ User emails are displayed in user lists/details
- ✅ Emails come from API (`getAllUsers()`), NOT from localStorage

**What to Check:**
- Admin pages fetch users from API, so emails should still be visible
- Check Network tab - should see API calls that return email

---

## Automated Testing (Optional)

You can also run this in the browser console to verify:

```javascript
// Test function to verify email is not in localStorage
function testEmailRemoval() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    console.log('❌ No user in localStorage');
    return false;
  }
  
  if ('email' in user) {
    console.log('❌ FAIL: Email found in localStorage user object:', user.email);
    return false;
  }
  
  console.log('✅ PASS: Email is NOT in localStorage');
  console.log('User object:', user);
  return true;
}

// Run after login/registration
testEmailRemoval();
```

## Common Issues to Watch For

1. **TypeScript Errors**: If you see TypeScript errors about `email` being required, check that the User type has `email?: string` (optional)

2. **Undefined Email Errors**: If components try to access `user.email` without optional chaining (`user?.email`), they might throw errors. All current code uses optional chaining, so this should be fine.

3. **Profile Page Not Showing Email**: If email doesn't show on Profile page, check:
   - Network tab for `/users/profile` API call
   - API response should include email
   - Component should use the `user` state from `getProfile()`, not from Redux

## Verification Checklist

After testing, verify:

- [ ] Registration works - no email in localStorage
- [ ] Login works - no email in localStorage  
- [ ] Profile page displays email (from API)
- [ ] Username update works - no email in localStorage
- [ ] Puzzle rating update works - no email in localStorage
- [ ] Password reset works (uses email from API)
- [ ] Page refresh works - user stays authenticated
- [ ] Admin pages show emails (from API)
- [ ] No console errors
- [ ] No TypeScript errors

## Summary

The key point is: **Email is removed from localStorage but still available from API calls when needed**. Components that display email (like Profile page) fetch it from the API, not from localStorage.

