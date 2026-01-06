# TCN Communications - Deployment Architecture

## Overview

This document describes the deployment architecture for TCN Communications, which consists of:

1. **Desktop App (Tauri)** - Static frontend running on staff computers
2. **Member Portal (VPS)** - Existing Next.js app hosting all API routes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STAFF COMPUTER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TCN Communications (Tauri)                      │  │
│  │                                                                    │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │  │
│  │   │  Dashboard  │    │    SMS      │    │   Email     │          │  │
│  │   │  Component  │    │  Composer   │    │  Composer   │          │  │
│  │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │  │
│  │          │                  │                  │                  │  │
│  │          └──────────────────┼──────────────────┘                  │  │
│  │                             │                                     │  │
│  │                    ┌────────▼────────┐                           │  │
│  │                    │   API Client    │                           │  │
│  │                    │ (lib/api-client)│                           │  │
│  │                    └────────┬────────┘                           │  │
│  └─────────────────────────────┼─────────────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 │ HTTPS + X-API-Key header
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              VPS                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TCN Member Portal (Next.js)                     │  │
│  │                                                                    │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │                     /api/* Routes                            │ │  │
│  │   │                                                              │ │  │
│  │   │  /api/auth/verify  - Validate user credentials               │ │  │
│  │   │  /api/sms          - Send SMS via Twilio                     │ │  │
│  │   │  /api/email        - Send email via Resend                   │ │  │
│  │   │  /api/contacts     - Search/list members                     │ │  │
│  │   │  /api/users        - Staff user management                   │ │  │
│  │   │  /api/forms        - Sign-up form management                 │ │  │
│  │   │  /api/dashboard    - Dashboard statistics                    │ │  │
│  │   │  /api/bulletin     - Bulletin management                     │ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  │   ┌─────────────────┐    ┌─────────────────┐                     │  │
│  │   │     Prisma      │    │   External APIs │                     │  │
│  │   │   PostgreSQL    │    │  Twilio/Resend  │                     │  │
│  │   └─────────────────┘    └─────────────────┘                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture: Same-Origin API (Option 1)

The desktop app is a **static frontend only**. All API routes live on the **member portal VPS**. This eliminates CORS complexity since everything is served from one origin.

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Login Flow                                       │
│                                                                          │
│   1. User opens desktop app → Login screen appears                       │
│   2. User enters email + password                                        │
│   3. App calls POST /api/auth/verify with credentials                    │
│   4. VPS validates against User table (bcrypt password check)            │
│   5. Success → Returns user object → Stored in localStorage              │
│   6. User can now access app features                                    │
│   7. All API calls include X-API-Key header for server auth              │
│                                                                          │
│   Logout → Clear localStorage → Redirect to login                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why This Works (No CORS Issues)

- The Tauri app calls `https://portal.tcn.com/api/*`
- The member portal serves both the portal frontend AND the API routes
- All requests go to the same domain = **same origin**
- No cross-origin restrictions apply

---

## Configuration

### Desktop App (.env.local)

```env
# Point to your VPS member portal
NEXT_PUBLIC_API_URL=https://portal.tcn.com
NEXT_PUBLIC_API_KEY=your-api-key-here
```

### Build Commands

```bash
# Development (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build
```

Build outputs:
- **Linux**: `src-tauri/target/release/bundle/deb/`, `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`, `nsis/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`, `macos/`

---

## Required API Endpoints on VPS

The member portal must implement these endpoints. All requests include:
```
X-API-Key: <your-api-key>
```

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/auth/verify` | Validate login | `{ email: string, password: string }` |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "department": "BAND_OFFICE",
    "role": "STAFF"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Communications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/sms` | Send SMS | `{ message: string, recipients: string[] }` |
| `POST /api/email` | Send Email | FormData: subject, message, recipients (JSON), attachments[] |

### Member Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/contacts` | List/Search | `?query=`, `?limit=` |

### Staff User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/users` | List users | Returns `{ users: User[] }` |
| `POST /api/users` | Create user | User object |
| `PATCH /api/users/:id` | Update user | `{ unlockAccount?: boolean, ... }` |
| `DELETE /api/users/:id` | Delete user | - |

### Sign-Up Forms

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/forms` | List forms | `?includeInactive=true` |
| `POST /api/forms` | Create form | Form definition with fields |
| `PATCH /api/forms/:id` | Update form | `{ isActive: boolean }` |
| `DELETE /api/forms/:id` | Delete form | - |
| `GET /api/forms/:id/submissions` | Get submissions | - |
| `DELETE /api/forms/:id/submissions` | Delete submission | `?submissionId=` |
| `GET /api/forms/sync` | Sync from portal | `?formId=` |

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/dashboard/stats` | Statistics | Returns overview, charts, activity data |

---

## VPS: Auth Verify Endpoint Implementation

Add this endpoint to your member portal:

```typescript
// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  // Verify API key
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
        department: true,
        role: true,
        lockedUntil: true,
        loginAttempts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { success: false, error: `Account locked. Try again in ${minutesLeft} minutes.` },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockedUntil: user.loginAttempts + 1 >= 5
            ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 min
            : null,
        },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Return user (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

### Contacts Response
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": 123,
        "t_number": "T-12345",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "555-123-4567",
        "community": "Main Reserve",
        "status": "active"
      }
    ],
    "count": 1,
    "pagination": { "limit": 50, "offset": 0 }
  }
}
```

### Dashboard Stats Response
```json
{
  "overview": {
    "totalUsers": 10,
    "totalEmails": 150,
    "emailsLast30Days": 45,
    "totalSms": 200,
    "smsLast30Days": 60,
    "totalBulletins": 25,
    "bulletinsLast30Days": 8,
    "totalForms": 5,
    "totalSubmissions": 120,
    "recentLogins": 8
  },
  "usersByRole": [
    { "role": "STAFF", "count": 5 },
    { "role": "ADMIN", "count": 2 }
  ],
  "usersByDepartment": [
    { "department": "BAND_OFFICE", "count": 3 },
    { "department": "HEALTH", "count": 4 }
  ],
  "charts": {
    "emails": [{ "date": "2026-01-01", "count": 5 }],
    "sms": [{ "date": "2026-01-01", "count": 10 }]
  }
}
```

---

## Database Schema Reference

The VPS portal needs these tables (Prisma schema provided in `prisma/schema.prisma`):

### Core Tables
- `User` - Staff accounts with roles (STAFF, STAFF_ADMIN, ADMIN, CHIEF_COUNCIL)
- `Session` - User sessions (optional for VPS-side tracking)
- `LoginLog` - Login audit trail

### Communication Logs
- `SmsLog` - SMS history
- `EmailLog` - Email history  
- `StaffEmailLog` - Internal staff emails

### Content Management
- `BulletinApiLog` - Posted bulletins
- `MsgCnC` - Chief & Council messages

### Sign-Up Forms
- `SignUpForm` - Form definitions
- `FormField` - Form field configurations
- `FormSubmission` - Submitted form data

---

## Security

### API Key Authentication

All requests from the desktop app include:
```
X-API-Key: <your-api-key>
```

VPS validates this header on every request. Generate a secure key:
```bash
openssl rand -hex 32
```

### User Authentication

- Users authenticate via `/api/auth/verify`
- Credentials validated against User table with bcrypt
- User info stored in localStorage on desktop
- Account lockout after 5 failed attempts (30 min)

### Additional Security Options

1. **IP Whitelist** - Only allow office IP range
2. **VPN Required** - Staff must be on office VPN

---

## Deployment Checklist

### VPS (Member Portal)
- [ ] `/api/auth/verify` endpoint implemented
- [ ] Other API routes implemented (see endpoints above)
- [ ] Database tables created (run Prisma migrations)
- [ ] `INTERNAL_API_KEY` environment variable set
- [ ] Twilio credentials configured
- [ ] Resend API key configured
- [ ] HTTPS enabled

### Desktop App
- [ ] Set `NEXT_PUBLIC_API_URL` to portal URL
- [ ] Set `NEXT_PUBLIC_API_KEY` to match VPS key
- [ ] Build with `npm run tauri:build`
- [ ] Test login against VPS
- [ ] Distribute installers to staff computers

---

## Troubleshooting

### "Failed to fetch" Errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check VPS is accessible from staff network
- Verify API routes exist on portal

### "Unauthorized" Errors
- Check `X-API-Key` matches between desktop and VPS
- Verify `INTERNAL_API_KEY` env var is set on VPS

### Login Fails
- Check user exists in VPS database
- Verify password is correct
- Check if account is locked (too many failed attempts)

### API Returns 404
- Ensure endpoint path matches exactly
- Check if route exists on VPS portal

---

## File Structure Reference

```
tcn_comm_tauri/
├── lib/
│   ├── api-client.ts      # All API calls (includes X-API-Key)
│   ├── auth-context.tsx   # Local auth state management
│   └── Providers.tsx      # App providers (AuthProvider, QueryClient)
├── components/
│   ├── Login.tsx          # Login form → calls /api/auth/verify
│   ├── SessionBar.tsx     # Shows logged-in user, logout button
│   ├── Communications.tsx # SMS & Email UI
│   ├── FormBuilder.tsx    # Create sign-up forms
│   └── ...
├── next.config.ts         # Static export config
├── src-tauri/
│   └── tauri.conf.json    # Tauri/security config
└── .env.local             # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_API_KEY
```
