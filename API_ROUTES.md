# API Routes Documentation

## Authentication Routes

### 1. NextAuth Endpoint
**Path:** `/api/auth/[...nextauth]`
**Methods:** GET, POST
**Description:** Handles NextAuth authentication flow (login, logout, session management)

**Login Credentials:**
- `username`: String (3-20 chars, alphanumeric + underscore)
- `password`: String (8+ chars, must include uppercase, lowercase, number)

**Features:**
- Account locking after 5 failed attempts (15 minutes)
- Last login tracking
- JWT session management (30 days)

---

### 2. Register
**Path:** `/api/register`
**Method:** POST
**Description:** Creates new member account credentials

**Request Body:**
```json
{
  "t_number": "T12345",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- Treaty number must exist in `fnmember` table
- Username: 3-20 chars, alphanumeric + underscore only
- Email: Valid email format
- Password: 8+ chars with uppercase, lowercase, and number

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully! You can now login.",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `404`: Treaty number not found
- `409`: Account already exists / Username taken / Email registered
- `400`: Validation failed

---

### 3. Forgot Password
**Path:** `/api/auth/forgot-password`
**Method:** POST
**Description:** Initiates password reset process

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists in our system, a password reset link has been sent."
}
```

**Note:** Returns same message regardless of email existence to prevent enumeration

---

### 4. Reset Password
**Path:** `/api/auth/reset-password`
**Method:** POST
**Description:** Completes password reset with token

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

**Features:**
- Token expires after 1 hour
- Clears login attempts and account locks
- Invalidates reset token after use

**Response (Success):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

---

### 5. Get Member Data
**Path:** `/api/member`
**Method:** GET
**Description:** Retrieves authenticated member's full profile
**Auth Required:** Yes (NextAuth session)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "first_name": "John",
    "last_name": "Doe",
    "t_number": "T12345",
    "birthdate": "1990-01-01",
    "activated": "ACTIVATED",
    "auth": {
      "username": "johndoe",
      "email": "john@example.com",
      "verified": true,
      "lastLogin": "2025-11-25T..."
    },
    "profile": [...],
    "barcode": [...],
    "family": [...]
  }
}
```

---

## Environment Variables Required

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=fnmemberlist"
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
NEXTAUTH_SECRET="your-secret-key"      # Generate with: openssl rand -base64 32
NODE_ENV="development"
```

---

## Session Structure

When logged in, the session contains:
```typescript
{
  user: {
    id: string;           // fnmember.id
    email: string;        // fnauth.email
    name: string;         // "FirstName LastName"
    firstName: string;    // fnmember.first_name
    lastName: string;     // fnmember.last_name
    tNumber: string;      // fnmember.t_number
    verified: boolean;    // fnauth.verified
  }
}
```

---

## Security Features

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - Hashed with bcrypt (12 rounds)

2. **Account Protection:**
   - Login attempt tracking
   - Auto-lock after 5 failed attempts (15 min)
   - Password reset token expiration (1 hour)
   - Secure session cookies (httpOnly, sameSite)

3. **Data Protection:**
   - JWT sessions (30-day expiration)
   - Secure session storage
   - Protected routes via NextAuth

---

## Next Steps

- [ ] Set up email service for password reset emails
- [ ] Implement email verification flow
- [ ] Add rate limiting for API routes
- [ ] Configure production security settings
- [ ] Set up monitoring and logging
