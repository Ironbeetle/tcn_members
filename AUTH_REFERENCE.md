# Authentication System Reference

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth handler
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts          # Password reset request
│   │   │   └── reset-password/
│   │   │       └── route.ts          # Password reset completion
│   │   ├── register/
│   │   │   └── route.ts              # Account registration
│   │   ├── member/
│   │   │   └── route.ts              # Get member data
│   │   └── test-db/
│   │       └── route.ts              # Database connection test
│   ├── TCN_Enter/
│   │   └── page.tsx                  # Login/Register page
│   ├── TCN_Home/
│   │   └── page.tsx                  # Member dashboard (protected)
│   └── TCN_BulletinBoard/
│       └── page.tsx                  # Bulletin board (protected)
├── components/
│   ├── Login.tsx                     # Login form
│   ├── Register.tsx                  # Registration form
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── tabs.tsx
├── contexts/
│   └── AuthContext.tsx               # Authentication context & hooks
├── hooks/
│   └── useMemberData.ts              # Hook for fetching member data
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── prisma.ts                     # Prisma client singleton
│   └── Providers.tsx                 # App providers wrapper
└── types/
    └── next-auth.d.ts                # NextAuth type extensions
```

## How It Works

### 1. User Registration Flow

```typescript
// User fills out registration form in Register.tsx
const { createCredentials } = useAuth()

await createCredentials(t_number, username, email, password)
  ↓
// Calls POST /api/register
  ↓
// Validates treaty number exists in fnmember table
  ↓
// Creates fnauth record with hashed password
  ↓
// Auto-login using NextAuth signIn()
  ↓
// Redirects to /TCN_Home
```

### 2. User Login Flow

```typescript
// User fills out login form in Login.tsx
const { login } = useAuth()

await login(username, password)
  ↓
// Calls NextAuth signIn('credentials', { username, password })
  ↓
// NextAuth validates credentials in auth.ts
  ↓
// Checks fnauth table for username
  ↓
// Verifies password with bcrypt
  ↓
// Creates JWT session (30 days)
  ↓
// Returns session with user data
  ↓
// Redirects to /TCN_Home
```

### 3. Session Management

```typescript
// SessionProvider wraps the app in Providers.tsx
<SessionProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
</SessionProvider>

// useAuth() hook provides:
{
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    tNumber: string
    verified: boolean
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username, password) => Promise<void>
  logout: () => Promise<void>
  createCredentials: (...) => Promise<void>
}
```

### 4. Protected Routes

Currently implemented in pages with manual checks:
```typescript
const { user, isAuthenticated } = useAuth()

if (!isAuthenticated) {
  // Show login prompt or redirect
}
```

Next step: Add middleware for automatic protection

### 5. Member Data Fetching

```typescript
import { useMemberData } from '@/hooks/useMemberData'

const MyComponent = () => {
  const { data: member, isLoading, error } = useMemberData()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading member data</div>
  
  return (
    <div>
      <h1>{member.first_name} {member.last_name}</h1>
      <p>Treaty #: {member.t_number}</p>
      <p>Email: {member.auth?.email}</p>
    </div>
  )
}
```

## Key Components

### AuthContext

Located: `src/contexts/AuthContext.tsx`

Provides authentication functionality throughout the app.

**Exports:**
- `AuthProvider` - Wrap your app with this
- `useAuth()` - Hook to access auth state and functions

**Usage:**
```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, login, logout } = useAuth()
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  )
}
```

### Login Component

Located: `src/components/Login.tsx`

**Props:** None

**Features:**
- Username/password form
- Form validation with react-hook-form
- Error handling
- Loading states
- Auto-redirect on success

### Register Component

Located: `src/components/Register.tsx`

**Props:** None

**Features:**
- Treaty number validation
- Username/email/password creation
- Password confirmation
- Form validation
- Success message with auto-redirect

## Environment Variables

Required in `.env`:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NODE_ENV="development"
```

## API Endpoints

### POST /api/register
Register new member account

**Body:**
```json
{
  "t_number": "T12345",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/[...nextauth]
NextAuth endpoint for login/logout

**Handled automatically by NextAuth**

### POST /api/auth/forgot-password
Request password reset

**Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /api/auth/reset-password
Reset password with token

**Body:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123"
}
```

### GET /api/member
Get logged-in member data (requires authentication)

**Returns:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "first_name": "John",
    "last_name": "Doe",
    "t_number": "T12345",
    "auth": { ... },
    "profile": [ ... ],
    "family": [ ... ]
  }
}
```

### GET /api/test-db
Test database connection

**Returns:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 100,
    "activatedAccounts": 25,
    "databaseConnected": true
  }
}
```

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **Login Attempts**: Tracks failed attempts
3. **Account Locking**: Locks for 15 min after 5 failed attempts
4. **JWT Sessions**: Secure, httpOnly cookies
5. **CSRF Protection**: Built into NextAuth
6. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

## Common Tasks

### Check if user is logged in
```typescript
const { isAuthenticated, user } = useAuth()
```

### Login a user
```typescript
const { login } = useAuth()
await login(username, password)
```

### Logout a user
```typescript
const { logout } = useAuth()
await logout()
```

### Register a new user
```typescript
const { createCredentials } = useAuth()
await createCredentials(tNumber, username, email, password)
```

### Get member data
```typescript
const { data: member } = useMemberData()
```

### Show content only to logged-in users
```typescript
const { isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return <div>Please login to view this content</div>
}

return <div>Protected content</div>
```

## Testing

1. **Test Database Connection:**
   - Visit: http://localhost:3000/api/test-db
   - Should show member counts

2. **Test Registration:**
   - Go to: http://localhost:3000/TCN_Enter
   - Click "Activate Account" tab
   - Use a treaty number from your database
   - Fill in credentials
   - Should redirect to /TCN_Home

3. **Test Login:**
   - Go to: http://localhost:3000/TCN_Enter
   - Click "Login" tab
   - Use created credentials
   - Should redirect to /TCN_Home

4. **Test Session Persistence:**
   - Login
   - Refresh page
   - Should remain logged in

5. **Test Logout:**
   - Click logout button
   - Should redirect to home
   - Session should be cleared
