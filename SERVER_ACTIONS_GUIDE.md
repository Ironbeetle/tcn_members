# Server Actions with TanStack Query

## Overview

The authentication system now uses **Next.js Server Actions** with **TanStack Query** instead of API routes. This is the modern, recommended approach for Next.js applications.

## Architecture

```
Component
    ↓
TanStack Query Hook (useMutation/useQuery)
    ↓
Server Action (auth-actions.ts)
    ↓
Database (Prisma)
```

## Files Structure

```
src/
├── lib/
│   └── auth-actions.ts              # Server actions for auth operations
├── hooks/
│   ├── useMemberData.ts             # TanStack Query hook for member data
│   └── usePasswordReset.ts          # TanStack Query hooks for password reset
├── contexts/
│   └── AuthContext.tsx              # Uses server actions instead of API
└── components/
    ├── Login.tsx                    # Uses NextAuth signIn
    ├── Register.tsx                 # Uses server action via context
    └── ForgotPassword.tsx           # Uses TanStack Query mutation
```

## Server Actions (auth-actions.ts)

All authentication logic is in server actions:

### Available Actions:

1. **`registerMember()`** - Create new member account
2. **`requestPasswordReset()`** - Request password reset email
3. **`resetPassword()`** - Reset password with token
4. **`getMemberData()`** - Get member profile data
5. **`testDatabaseConnection()`** - Test DB connection

### Example Server Action:

```typescript
"use server"

export async function registerMember(formData: {
  t_number: string
  username: string
  email: string
  password: string
}): Promise<ActionResult> {
  // Validation
  const validatedData = registerSchema.parse(formData)
  
  // Database operations
  const member = await prisma.fnmember.findUnique({
    where: { t_number: validatedData.t_number }
  })
  
  // Return result
  return {
    success: true,
    data: { ... }
  }
}
```

## TanStack Query Hooks

### 1. useMemberData (Query)

Fetches member data when authenticated:

```typescript
import { useMemberData } from '@/hooks/useMemberData'

function MyComponent() {
  const { data: member, isLoading, error } = useMemberData()
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{member.first_name}</div>
}
```

**Features:**
- Automatic caching (5 min stale time)
- Only runs when authenticated
- Refetches on window focus
- Error handling

### 2. useRequestPasswordReset (Mutation)

Requests a password reset:

```typescript
import { useRequestPasswordReset } from '@/hooks/usePasswordReset'

function ForgotPassword() {
  const { mutate, isPending, error } = useRequestPasswordReset()
  
  const handleSubmit = (email: string) => {
    mutate(email, {
      onSuccess: () => {
        // Show success message
      },
      onError: (error) => {
        // Show error
      }
    })
  }
}
```

### 3. useResetPassword (Mutation)

Resets password with token:

```typescript
import { useResetPassword } from '@/hooks/usePasswordReset'

function ResetPassword() {
  const { mutate, isPending } = useResetPassword()
  
  const handleReset = (token: string, password: string) => {
    mutate({ token, password }, {
      onSuccess: () => {
        router.push('/TCN_Enter')
      }
    })
  }
}
```

## Component Usage Examples

### Registration Form

```typescript
// Register.tsx
const { createCredentials } = useAuth()

const onSubmit = async (data) => {
  try {
    await createCredentials(
      data.t_number,
      data.username,
      data.email,
      data.password
    )
    router.push('/TCN_Home')
  } catch (error) {
    setError(error.message)
  }
}
```

### Login Form

```typescript
// Login.tsx
const { login } = useAuth()

const onSubmit = async (data) => {
  try {
    await login(data.username, data.password)
    router.push('/TCN_Home')
  } catch (error) {
    setError(error.message)
  }
}
```

### Forgot Password Form

```typescript
// ForgotPassword.tsx
const { mutate: requestReset, isPending } = useRequestPasswordReset()

const onSubmit = (data) => {
  requestReset(data.email, {
    onSuccess: () => setSuccess(true)
  })
}
```

## Benefits of Server Actions + TanStack Query

### ✅ Advantages:

1. **No API Routes Needed**
   - Direct server-to-database calls
   - Less boilerplate code
   - Simpler architecture

2. **Type Safety**
   - Full TypeScript support
   - Type inference from server to client
   - Compile-time error checking

3. **Automatic Caching**
   - TanStack Query handles caching
   - Smart refetching strategies
   - Optimistic updates support

4. **Better Performance**
   - No extra HTTP round trip
   - Server components by default
   - Smaller client bundle

5. **Built-in Features**
   - Loading states (`isPending`)
   - Error handling
   - Retry logic
   - Cache invalidation

6. **Developer Experience**
   - Less code to write
   - Clearer data flow
   - Easier testing

## Comparison: API Routes vs Server Actions

### Old Way (API Routes):

```typescript
// API Route: /api/register/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  // ... validation and logic
  return NextResponse.json(result)
}

// Component
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const result = await response.json()
```

### New Way (Server Actions):

```typescript
// Server Action: lib/auth-actions.ts
"use server"
export async function registerMember(data) {
  // ... validation and logic
  return result
}

// Component
const result = await registerMember(data)
```

## TanStack Query Configuration

Located in `lib/Providers.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

## Error Handling

Server actions return a consistent error format:

```typescript
type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

Usage:

```typescript
const result = await registerMember(data)

if (!result.success) {
  throw new Error(result.error)
}

// Use result.data
```

## Testing Server Actions

Server actions can be tested directly:

```typescript
import { registerMember } from '@/lib/auth-actions'

test('register member', async () => {
  const result = await registerMember({
    t_number: 'T12345',
    username: 'test',
    email: 'test@example.com',
    password: 'Password123'
  })
  
  expect(result.success).toBe(true)
})
```

## Migration Notes

### What Changed:

1. ✅ Created `lib/auth-actions.ts` with server actions
2. ✅ Updated `AuthContext` to use server actions
3. ✅ Created TanStack Query hooks in `hooks/`
4. ✅ Updated `useMemberData` to use server action
5. ✅ Updated `ForgotPassword` to use mutation hook

### What Still Works:

- ✅ NextAuth API routes (`/api/auth/[...nextauth]`)
- ✅ Login/Logout via NextAuth `signIn`/`signOut`
- ✅ Session management
- ✅ All existing components

### API Routes (Optional):

The API routes in `/api/register/`, `/api/member/`, etc. can now be removed since we're using server actions. However, they can be kept if you want to support external API clients.

## Best Practices

1. **Always use "use server"** at the top of action files
2. **Validate input** with Zod schemas
3. **Return consistent** ActionResult format
4. **Handle errors** gracefully
5. **Use TanStack Query** for caching and state management
6. **Invalidate cache** after mutations when needed:

```typescript
const queryClient = useQueryClient()

mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['member-data'] })
  }
})
```

## Next Steps

1. Create more server actions for:
   - Profile updates
   - Family information
   - Document uploads
   - Bulletin board posts

2. Add optimistic updates:
```typescript
mutate(data, {
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['member'] })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['member'])
    
    // Optimistically update
    queryClient.setQueryData(['member'], newData)
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['member'], context?.previous)
  }
})
```

3. Add loading skeletons and better UI feedback
4. Implement protected route middleware
5. Add more granular error messages
