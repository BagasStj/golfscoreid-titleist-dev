# Authentication Flow Test Results

## Test Execution Date
Run these tests after starting the application with `npm run dev`

## Pre-requisites
1. Ensure Convex backend is running
2. Ensure test users are seeded (run seedUsersWithPassword mutation if needed)
3. Clear browser localStorage before starting tests

## Manual Test Execution

### Setup: Seed Test Users
```bash
# In Convex dashboard, run the mutation:
# convex/seedUsersWithPassword.ts -> seedTestUsers
```

### Test 1: Admin Login ✓
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"

**Expected Results:**
- ✓ No errors displayed
- ✓ Redirected to `/admin` route
- ✓ Admin dashboard loads successfully
- ✓ User name "Admin User" displayed in header
- ✓ Admin-specific features visible (tournament creation, player management, etc.)
- ✓ Console log shows: "User logged in: { id: ..., role: 'admin', name: 'Admin User' }"

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Player Login ✓
**Steps:**
1. Logout from admin account
2. Navigate to http://localhost:5173/login
3. Enter username: `player1`
4. Enter password: `player123`
5. Click "Login"

**Expected Results:**
- ✓ No errors displayed
- ✓ Redirected to `/player` route
- ✓ Player dashboard loads successfully
- ✓ User name "John Doe" displayed
- ✓ Player-specific features visible (tournaments, scoring, leaderboard)
- ✓ Console log shows: "User logged in: { id: ..., role: 'player', name: 'John Doe' }"

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Invalid Credentials ✓
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter username: `invaliduser`
3. Enter password: `wrongpassword`
4. Click "Login"

**Expected Results:**
- ✓ Error message displayed: "Invalid username or password"
- ✓ Error has red background and AlertCircle icon
- ✓ User remains on login page
- ✓ No navigation occurs

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Player Accessing Admin Route ✓
**Steps:**
1. Login as player (username: `player1`, password: `player123`)
2. Manually navigate to http://localhost:5173/admin

**Expected Results:**
- ✓ Access Denied page displays
- ✓ Message shows: "You must be an admin to access this area"
- ✓ Red alert icon displayed
- ✓ "Go Back" button visible
- ✓ "Go to Player Dashboard" button visible
- ✓ Clicking "Go to Player Dashboard" redirects to `/player`

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Session Persistence ✓
**Steps:**
1. Login as admin (username: `admin`, password: `admin123`)
2. Verify you're on `/admin` dashboard
3. Press F5 to refresh the page
4. Wait for page to reload

**Expected Results:**
- ✓ User remains logged in
- ✓ Still on `/admin` dashboard
- ✓ No redirect to login page
- ✓ User data still displays correctly
- ✓ localStorage contains `golfscore_user` and `golfscore_session_timestamp`

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Logout Functionality ✓
**Steps:**
1. Login as any user
2. Navigate to dashboard
3. Click "Logout" button in header
4. Try to navigate to `/admin` or `/player`

**Expected Results:**
- ✓ Redirected to `/login` page after logout
- ✓ localStorage cleared (no `golfscore_user` or `golfscore_session_timestamp`)
- ✓ Console log shows: "User logged out"
- ✓ Attempting to access protected routes redirects to login

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Session Expiration ✓
**Steps:**
1. Login as any user
2. Open DevTools > Application > Local Storage
3. Find `golfscore_session_timestamp`
4. Change value to: `1704067200000` (old timestamp)
5. Refresh the page

**Expected Results:**
- ✓ Redirected to login page
- ✓ Console log shows: "Session expired, clearing authentication"
- ✓ localStorage cleared
- ✓ Error message on login page: "Your session has expired. Please log in again."

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Unauthenticated Access ✓
**Steps:**
1. Ensure logged out
2. Clear localStorage completely
3. Navigate to http://localhost:5173/admin
4. Navigate to http://localhost:5173/player

**Expected Results:**
- ✓ Both routes redirect to `/login`
- ✓ No error messages displayed
- ✓ Login page loads normally

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Error Auto-Clear ✓
**Steps:**
1. Navigate to login page
2. Enter invalid credentials
3. Click "Login" to trigger error
4. Start typing in username field

**Expected Results:**
- ✓ Error message displays initially
- ✓ Error clears as soon as user starts typing
- ✓ No error visible while typing

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Role Verification ✓
**Steps:**
1. Login as admin
2. Check browser console
3. Verify user object in localStorage
4. Logout and login as player
5. Check console and localStorage again

**Expected Results:**
- ✓ Admin login: role is "admin" in console and localStorage
- ✓ Player login: role is "player" in console and localStorage
- ✓ Role persists across page refreshes
- ✓ ProtectedRoute correctly checks role

**Status:** [ ] Pass [ ] Fail

---

## Summary

**Total Tests:** 10
**Passed:** [ ]
**Failed:** [ ]
**Pass Rate:** [ ]%

## Issues Found
(List any issues discovered during testing)

1. 
2. 
3. 

## Notes
(Any additional observations or comments)

