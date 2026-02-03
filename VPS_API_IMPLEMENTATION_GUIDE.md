# TCN Communications Desktop App - Complete VPS API Implementation Guide

> **IMPORTANT**: This document provides COMPLETE specifications for implementing ALL VPS API endpoints required by the TCN Communications desktop app. The desktop app is now 100% VPS-dependent - no local database. All data is stored centrally on the VPS for multi-location staff access.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication & Headers](#authentication--headers)
3. [Response Format Standard](#response-format-standard)
4. [Complete Database Schema](#complete-database-schema)
5. [User Authentication API](#user-authentication-api)
6. [User Management API](#user-management-api)
7. [SMS Logs API](#sms-logs-api)
8. [Email Logs API](#email-logs-api)
9. [Bulletin Board API](#bulletin-board-api)
10. [Sign-Up Forms API](#sign-up-forms-api)
11. [Timesheets API](#timesheets-api)
12. [Travel Forms API](#travel-forms-api)
13. [File Structure](#file-structure)
14. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                    TCN Communications Desktop App                       │
│                         (Electron App)                                  │
│                                                                         │
│   NO LOCAL DATABASE - All data on VPS                                  │
│   Local session storage only (electron-store for current user)          │
├────────────────────────────────────────────────────────────────────────┤
│   Services (all use VPS API):                                          │
│   ├── auth-api.js      → User login/logout/management                  │
│   ├── sms-api.js       → SMS sending (Twilio) + log storage            │
│   ├── email-api.js     → Email sending (Resend) + log storage          │
│   ├── bulletin-api.js  → Bulletin board posts                          │
│   ├── forms-api.js     → Sign-up forms and submissions                 │
│   ├── timesheets-api.js → Staff timesheets                             │
│   └── travelForms-api.js → Travel authorization forms                  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                │ HTTPS (JSON)
                                │ Headers: x-api-key, x-source: tcn-comm
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    VPS (Next.js App Router)                            │
│                    PostgreSQL - msgmanager schema                       │
├────────────────────────────────────────────────────────────────────────┤
│   API Routes:                                                          │
│   ├── /api/comm/auth/*           → Authentication                      │
│   ├── /api/comm/users/*          → User management                     │
│   ├── /api/comm/sms-logs/*       → SMS logs                           │
│   ├── /api/comm/email-logs/*     → Email logs                         │
│   ├── /api/comm/staff-email-logs/* → Internal staff email logs        │
│   ├── /api/comm/bulletin/*       → Bulletin board                      │
│   ├── /api/comm/signup-forms/*   → Sign-up forms                      │
│   ├── /api/timesheets/*          → Staff timesheets                   │
│   └── /api/travel-forms/*        → Travel forms                       │
│                                                                         │
│   NOTE: Does NOT modify fnmemberlist or governance schemas             │
│   Only uses msgmanager schema for comm_* tables                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Why VPS-Centric?**
- Staff work in multiple buildings (Band Office, Health Center, CSCMEC, etc.)
- Users need to log in from ANY computer
- All communication logs accessible from anywhere
- Centralized timesheet and travel form management

---

## Authentication & Headers

### Required Headers on EVERY Request

```typescript
{
  "Content-Type": "application/json",
  "x-api-key": "<your-api-key>",
  "x-source": "tcn-comm"
}
```

### Middleware Implementation

```typescript
// lib/auth.ts
export function validateCommApiRequest(headers: Headers): { valid: boolean; error?: string } {
  const apiKey = headers.get('x-api-key');
  const source = headers.get('x-source');
  
  if (!apiKey || apiKey !== process.env.TCN_COMM_API_KEY) {
    return { valid: false, error: 'Invalid or missing API key' };
  }
  
  if (source !== 'tcn-comm') {
    return { valid: false, error: 'Invalid source header' };
  }
  
  return { valid: true };
}
```

---

## Response Format Standard

### Success Response
```json
{
  "success": true,
  "data": { /* object or array */ },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Complete Database Schema

Add ALL of these to your VPS Prisma schema in the `msgmanager` schema.

### Enums

```prisma
// ==================== ENUMS ====================

enum comm_Department {
  BAND_OFFICE
  J_W_HEALTH_CENTER
  CSCMEC
  COUNCIL
  RECREATION
  UTILITIES
  TRSC

  @@schema("msgmanager")
}

enum comm_UserRole {
  STAFF
  STAFF_ADMIN
  ADMIN
  CHIEF_COUNCIL

  @@schema("msgmanager")
}

enum comm_TimeSheetStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED

  @@schema("msgmanager")
}

enum comm_TransportationType {
  PERSONAL_VEHICLE
  PUBLIC_TRANSPORT_WINNIPEG
  PUBLIC_TRANSPORT_THOMPSON
  COMBINATION
  OTHER

  @@schema("msgmanager")
}

enum comm_TravelFormStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  ISSUED
  COMPLETED
  CANCELLED

  @@schema("msgmanager")
}

enum comm_BulletinCategory {
  CHIEFNCOUNCIL
  HEALTH
  EDUCATION
  RECREATION
  EMPLOYMENT
  PROGRAM_EVENTS
  ANNOUNCEMENTS

  @@schema("msgmanager")
}

enum comm_FormCategory {
  BAND_OFFICE
  J_W_HEALTH_CENTER
  CSCMEC
  COUNCIL
  RECREATION
  UTILITIES
  TRSC

  @@schema("msgmanager")
}

enum comm_FieldType {
  TEXT
  TEXTAREA
  EMAIL
  PHONE
  NUMBER
  DATE
  SELECT
  MULTISELECT
  CHECKBOX

  @@schema("msgmanager")
}
```

### User & Session Models

```prisma
// ==================== USER & AUTH ====================

model comm_User {
  id                     String                @id @default(cuid())
  email                  String                @unique
  password               String                // bcrypt hashed
  first_name             String
  last_name              String
  created                DateTime              @default(now())
  updated                DateTime              @updatedAt
  department             comm_Department       @default(BAND_OFFICE)
  role                   comm_UserRole         @default(STAFF)
  
  // Authentication
  pin                    String?               // 6-digit PIN for password reset
  pinExpiresAt           DateTime?
  lastLogin              DateTime?
  loginAttempts          Int                   @default(0)
  lockedUntil            DateTime?
  
  // Password reset tracking
  passwordResetRequested DateTime?
  passwordResetCompleted DateTime?
  
  // Relations
  sessions               comm_Session[]
  loginLogs              comm_LoginLog[]
  smsLogs                comm_SmsLog[]
  emailLogs              comm_EmailLog[]
  staffEmailLogs         comm_StaffEmailLog[]
  bulletins              comm_BulletinLog[]
  signUpForms            comm_SignUpForm[]
  timesheets             comm_TimeSheet[]
  travelForms            comm_TravelForm[]

  @@map("User")
  @@schema("msgmanager")
}

model comm_Session {
  id            String    @id @default(cuid())
  sessionToken  String    @unique @default(cuid())
  userId        String
  user          comm_User @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires       DateTime
  created       DateTime  @default(now())
  updated       DateTime  @updatedAt

  @@map("Session")
  @@schema("msgmanager")
}

model comm_LoginLog {
  id          String          @id @default(cuid())
  userId      String
  user        comm_User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  loginTime   DateTime        @default(now())
  department  comm_Department
  ipAddress   String?
  userAgent   String?
  success     Boolean         @default(true)
  failReason  String?

  @@map("LoginLog")
  @@schema("msgmanager")
}
```

### Communication Log Models

```prisma
// ==================== COMMUNICATION LOGS ====================

model comm_SmsLog {
  id         String    @id @default(cuid())
  created    DateTime  @default(now())
  updated    DateTime  @updatedAt
  message    String    @db.Text
  recipients Json      // Array of phone numbers
  status     String    // 'sent', 'failed', 'partial'
  messageIds Json      // Array of Twilio message SIDs
  error      String?   @db.Text
  userId     String
  user       comm_User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([created])
  @@map("SmsLog")
  @@schema("msgmanager")
}

model comm_EmailLog {
  id          String    @id @default(cuid())
  created     DateTime  @default(now())
  updated     DateTime  @updatedAt
  subject     String
  message     String    @db.Text
  recipients  Json      // Array of email addresses
  status      String    // 'sent', 'failed', 'partial'
  messageId   String?   // Resend message ID
  error       String?   @db.Text
  attachments Json?     // [{ filename, size }]
  userId      String
  user        comm_User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([created])
  @@map("EmailLog")
  @@schema("msgmanager")
}

model comm_StaffEmailLog {
  id          String    @id @default(cuid())
  created     DateTime  @default(now())
  updated     DateTime  @updatedAt
  subject     String
  message     String    @db.Text
  recipients  Json      // Array of staff email addresses
  status      String
  messageId   String?
  error       String?   @db.Text
  attachments Json?
  userId      String
  user        comm_User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("StaffEmailLog")
  @@schema("msgmanager")
}
```

### Bulletin Board Model

```prisma
// ==================== BULLETIN BOARD ====================

model comm_BulletinLog {
  id         String                 @id @default(cuid())
  created    DateTime               @default(now())
  updated    DateTime               @updatedAt
  title      String
  subject    String                 @db.Text
  poster_url String                 // URL to poster image
  category   comm_BulletinCategory  @default(ANNOUNCEMENTS)
  userId     String
  user       comm_User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([category])
  @@index([created])
  @@map("BulletinLog")
  @@schema("msgmanager")
}
```

### Sign-Up Forms Models

```prisma
// ==================== SIGN-UP FORMS ====================

model comm_SignUpForm {
  id              String             @id @default(cuid())
  created         DateTime           @default(now())
  updated         DateTime           @updatedAt
  title           String
  description     String?            @db.Text
  category        comm_FormCategory  @default(BAND_OFFICE)
  deadline        DateTime?
  maxEntries      Int?
  isActive        Boolean            @default(true)
  allowResubmit   Boolean            @default(false)
  resubmitMessage String?            @db.Text
  createdBy       String
  creator         comm_User          @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  // Relations
  fields          comm_FormField[]
  submissions     comm_FormSubmission[]

  @@index([createdBy])
  @@index([category])
  @@index([isActive])
  @@map("SignUpForm")
  @@schema("msgmanager")
}

model comm_FormField {
  id          String         @id @default(cuid())
  formId      String
  form        comm_SignUpForm @relation(fields: [formId], references: [id], onDelete: Cascade)
  fieldId     String         // Semantic ID like "full_name", "email"
  label       String
  fieldType   comm_FieldType
  options     Json?          // For SELECT/MULTISELECT: ["Option1", "Option2"]
  placeholder String?
  required    Boolean        @default(false)
  order       Int            @default(0)

  @@index([formId])
  @@map("FormField")
  @@schema("msgmanager")
}

model comm_FormSubmission {
  id          String          @id @default(cuid())
  formId      String
  form        comm_SignUpForm @relation(fields: [formId], references: [id], onDelete: Cascade)
  memberId    String?         // Optional link to fnmember
  name        String
  email       String?
  phone       String?
  responses   Json            // { fieldId: value, ... }
  submittedAt DateTime        @default(now())

  @@index([formId])
  @@index([memberId])
  @@map("FormSubmission")
  @@schema("msgmanager")
}
```

### Timesheet Model

```prisma
// ==================== TIMESHEETS ====================

model comm_TimeSheet {
  id              String                @id @default(cuid())
  created         DateTime              @default(now())
  updated         DateTime              @updatedAt
  userId          String
  user            comm_User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Pay period
  payPeriodStart  DateTime
  payPeriodEnd    DateTime
  
  // Daily hours as JSON
  // { "2026-01-06": { "startTime": "08:00", "endTime": "16:30", "breakMinutes": 30, "totalHours": 8.0 }, ... }
  dailyHours      Json                  @default("{}")
  
  // Totals
  regularHours    Float                 @default(0)
  overtimeHours   Float                 @default(0)
  sickHours       Float                 @default(0)
  vacationHours   Float                 @default(0)
  statHolidayHours Float                @default(0)
  totalHours      Float                 @default(0)
  
  notes           String?               @db.Text
  
  // Status workflow
  status          comm_TimeSheetStatus  @default(DRAFT)
  submittedDate   DateTime?
  approvedDate    DateTime?
  approvedBy      String?
  rejectedDate    DateTime?
  rejectedBy      String?
  rejectionReason String?

  @@unique([userId, payPeriodStart])
  @@index([userId])
  @@index([status])
  @@index([payPeriodStart])
  @@map("TimeSheet")
  @@schema("msgmanager")
}
```

### Travel Form Model

```prisma
// ==================== TRAVEL FORMS ====================

model comm_TravelForm {
  id                    String                   @id @default(cuid())
  created               DateTime                 @default(now())
  updated               DateTime                 @updatedAt
  userId                String
  user                  comm_User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Basic Info
  name                  String
  destination           String
  departureDate         DateTime
  returnDate            DateTime
  reasonsForTravel      String                   @db.Text
  
  // Accommodation
  hotelRate             Float                    @default(200)
  hotelNights           Int                      @default(0)
  hotelTotal            Float                    @default(0)
  privateRate           Float                    @default(50)
  privateNights         Int                      @default(0)
  privateTotal          Float                    @default(0)
  
  // Meals
  breakfastRate         Float                    @default(20.50)
  breakfastDays         Int                      @default(0)
  breakfastTotal        Float                    @default(0)
  lunchRate             Float                    @default(20.10)
  lunchDays             Int                      @default(0)
  lunchTotal            Float                    @default(0)
  dinnerRate            Float                    @default(50.65)
  dinnerDays            Int                      @default(0)
  dinnerTotal           Float                    @default(0)
  
  // Incidentals
  incidentalRate        Float                    @default(10)
  incidentalDays        Int                      @default(0)
  incidentalTotal       Float                    @default(0)
  
  // Transportation
  transportationType    comm_TransportationType  @default(PERSONAL_VEHICLE)
  personalVehicleRate   Float                    @default(0.50)
  licensePlateNumber    String?
  oneWayWinnipegKm      Int                      @default(904)
  oneWayWinnipegTrips   Int                      @default(0)
  oneWayWinnipegTotal   Float                    @default(0)
  oneWayThompsonKm      Int                      @default(150)
  oneWayThompsonTrips   Int                      @default(0)
  oneWayThompsonTotal   Float                    @default(0)
  winnipegFlatRate      Float                    @default(450)
  thompsonFlatRate      Float                    @default(100)
  publicTransportTotal  Float                    @default(0)
  
  // Taxi
  taxiFareRate          Float                    @default(17.30)
  taxiFareDays          Int                      @default(0)
  taxiFareTotal         Float                    @default(0)
  
  // Parking
  parkingTotal          Float                    @default(0)
  
  // Grand Total
  grandTotal            Float                    @default(0)
  
  // Status workflow
  status                comm_TravelFormStatus    @default(DRAFT)
  submittedDate         DateTime?
  approvedDate          DateTime?
  approvedBy            String?
  rejectedDate          DateTime?
  rejectedBy            String?
  rejectionReason       String?
  issuedDate            DateTime?
  completedDate         DateTime?

  @@index([userId])
  @@index([status])
  @@index([departureDate])
  @@map("TravelForm")
  @@schema("msgmanager")
}
```

---

## User Authentication API

### POST /api/comm/auth/login

Login user with email and password.

**Request:**
```json
{
  "email": "john@tcn.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxyz123",
      "email": "john@tcn.com",
      "first_name": "John",
      "last_name": "Doe",
      "department": "BAND_OFFICE",
      "role": "STAFF"
    },
    "sessionToken": "clsession456"
  }
}
```

**Response (Error - Locked):**
```json
{
  "success": false,
  "error": "Account locked. Try again in 15 minutes."
}
```

**Implementation:**
```typescript
// app/api/comm/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateCommApiRequest } from '@/lib/auth';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request: Request) {
  const validation = validateCommApiRequest(request.headers);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 401 });
  }

  try {
    const { email, password } = await request.json();
    
    const user = await prisma.comm_User.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Check lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json({ 
        success: false, 
        error: `Account locked. Try again in ${remainingTime} minutes.` 
      }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const newAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: newAttempts };
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }
      
      await prisma.comm_User.update({
        where: { id: user.id },
        data: updateData
      });

      // Log failed attempt
      await prisma.comm_LoginLog.create({
        data: {
          userId: user.id,
          department: user.department,
          success: false,
          failReason: 'Invalid password'
        }
      });

      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Success - reset attempts, create session
    await prisma.comm_User.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    });

    // Create session (expires in 24 hours)
    const session = await prisma.comm_Session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Log successful login
    await prisma.comm_LoginLog.create({
      data: {
        userId: user.id,
        department: user.department,
        success: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department,
          role: user.role
        },
        sessionToken: session.sessionToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
```

### POST /api/comm/auth/logout

Invalidate session.

**Request:**
```json
{
  "sessionToken": "clsession456"
}
```

### POST /api/comm/auth/verify

Verify session is still valid.

**Request:**
```json
{
  "sessionToken": "clsession456"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "valid": true }
}
```

---

## User Management API

### GET /api/comm/users

Get all users.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123",
      "email": "john@tcn.com",
      "first_name": "John",
      "last_name": "Doe",
      "department": "BAND_OFFICE",
      "role": "STAFF",
      "created": "2026-01-01T00:00:00.000Z",
      "lastLogin": "2026-02-01T10:30:00.000Z"
    }
  ]
}
```

### POST /api/comm/users

Create a new user.

**Request:**
```json
{
  "email": "jane@tcn.com",
  "password": "securePassword123",
  "first_name": "Jane",
  "last_name": "Smith",
  "department": "J_W_HEALTH_CENTER",
  "role": "STAFF"
}
```

**Note:** Hash password with bcrypt before storing.

### GET /api/comm/users/[id]

Get single user by ID.

### PUT /api/comm/users/[id]

Update user (don't allow password update through this endpoint).

### DELETE /api/comm/users/[id]

Delete user.

### POST /api/comm/users/[id]/password

Change password.

**Request:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
}
```

---

## SMS Logs API

### POST /api/comm/sms-logs

Log SMS send attempt.

**Request:**
```json
{
  "message": "Meeting reminder for tomorrow",
  "recipients": ["+12045551234", "+12045555678"],
  "status": "sent",
  "messageIds": ["SM123", "SM456"],
  "error": null,
  "userId": "cluser123"
}
```

### GET /api/comm/sms-logs

Get SMS logs.

**Query Parameters:**
- `userId` (optional): Filter by user
- `limit` (optional): Max results (default 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cllog123",
      "created": "2026-02-01T10:00:00.000Z",
      "message": "Meeting reminder",
      "recipients": ["+12045551234"],
      "status": "sent",
      "messageIds": ["SM123"],
      "user": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@tcn.com"
      }
    }
  ]
}
```

### GET /api/comm/sms-logs/stats

Get SMS statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": 150,
    "failed": 5
  }
}
```

---

## Email Logs API

### POST /api/comm/email-logs

Log email send attempt.

**Request:**
```json
{
  "subject": "Meeting Notification",
  "message": "Please attend the meeting tomorrow...",
  "recipients": ["member1@email.com", "member2@email.com"],
  "status": "sent",
  "messageId": "resend-msg-123",
  "error": null,
  "attachments": [{ "filename": "agenda.pdf", "size": 1024 }],
  "userId": "cluser123"
}
```

### GET /api/comm/email-logs

Get email logs (same pattern as SMS).

### GET /api/comm/email-logs/stats

Get email statistics.

---

## Staff Email Logs API

Same pattern as email-logs but for internal staff communications.

- POST /api/comm/staff-email-logs
- GET /api/comm/staff-email-logs
- GET /api/comm/staff-email-logs/stats

---

## Bulletin Board API

### POST /api/comm/bulletin

Create bulletin record.

**Request:**
```json
{
  "title": "Community BBQ",
  "subject": "Join us for the annual community BBQ this Saturday!",
  "category": "PROGRAM_EVENTS",
  "poster_url": "",
  "userId": "cluser123"
}
```

### POST /api/comm/bulletin/poster

Upload poster image (multipart/form-data).

**Fields:**
- `sourceId`: Bulletin ID
- `file`: Image file

**Response:**
```json
{
  "success": true,
  "data": {
    "poster_url": "https://your-vps.com/uploads/bulletins/clbulletin123.jpg"
  }
}
```

### PUT /api/comm/bulletin/[id]

Update bulletin.

### DELETE /api/comm/bulletin/[id]

Delete bulletin and its poster.

### GET /api/comm/bulletin

Get all bulletins.

**Query Parameters:**
- `userId` (optional)
- `limit` (optional)

### GET /api/comm/bulletin/[id]

Get single bulletin.

### GET /api/comm/bulletin/stats

Get bulletin statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "thisMonth": 8
  }
}
```

---

## Sign-Up Forms API

### POST /api/comm/signup-forms

Create form.

**Request:**
```json
{
  "title": "Community Event Registration",
  "description": "Register for the upcoming event",
  "category": "RECREATION",
  "deadline": "2026-03-01T00:00:00.000Z",
  "maxEntries": 100,
  "isActive": true,
  "allowResubmit": false,
  "resubmitMessage": null,
  "createdBy": "cluser123",
  "fields": [
    {
      "fieldId": "full_name",
      "label": "Full Name",
      "fieldType": "TEXT",
      "required": true,
      "order": 0
    },
    {
      "fieldId": "email",
      "label": "Email Address",
      "fieldType": "EMAIL",
      "required": true,
      "order": 1
    },
    {
      "fieldId": "attending",
      "label": "Will you be attending?",
      "fieldType": "SELECT",
      "options": ["Yes", "No", "Maybe"],
      "required": true,
      "order": 2
    }
  ]
}
```

### PUT /api/comm/signup-forms/[id]

Update form (replaces fields).

### DELETE /api/comm/signup-forms/[id]

Delete form (cascades to fields and submissions).

### GET /api/comm/signup-forms

Get all forms.

### GET /api/comm/signup-forms/[id]

Get form with fields and submission count.

### POST /api/comm/signup-forms/[id]/submissions

Submit form response.

**Request:**
```json
{
  "memberId": "clmember123",
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+12045551234",
  "responses": {
    "full_name": "John Doe",
    "email": "john@email.com",
    "attending": "Yes"
  }
}
```

### GET /api/comm/signup-forms/[id]/submissions

Get form submissions.

### DELETE /api/comm/signup-forms/submissions/[submissionId]

Delete submission.

### GET /api/comm/signup-forms/stats

Get form statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalForms": 15,
    "activeForms": 8,
    "totalSubmissions": 234
  }
}
```

---

## Timesheets API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/timesheets` | Get all timesheets (admin) |
| GET | `/api/timesheets/user/[userId]` | Get user's timesheets |
| GET | `/api/timesheets/[id]` | Get single timesheet |
| POST | `/api/timesheets` | Create/upsert timesheet |
| POST | `/api/timesheets/[id]/submit` | Submit for approval |
| POST | `/api/timesheets/[id]/approve` | Approve (body: `{ approverId }`) |
| POST | `/api/timesheets/[id]/reject` | Reject (body: `{ rejecterId, reason }`) |
| DELETE | `/api/timesheets/[id]` | Delete draft |

**Pay Period Logic:**
- Bi-weekly periods starting from **January 6, 2025** (Monday)
- Each period is 14 days

```typescript
// lib/payPeriod.ts
export function getPayPeriodDates(date: Date = new Date()): { start: Date; end: Date } {
  const referenceDate = new Date('2025-01-06T00:00:00.000Z');
  
  const daysSinceReference = Math.floor(
    (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const periodIndex = Math.floor(daysSinceReference / 14);
  
  const start = new Date(referenceDate);
  start.setDate(start.getDate() + periodIndex * 14);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  
  return { start, end };
}
```

**DailyHours JSON Format:**
```json
{
  "2026-01-06": {
    "startTime": "08:00",
    "endTime": "16:30",
    "breakMinutes": 30,
    "totalHours": 8.0
  }
}
```

**CRITICAL: Upsert Logic**

The desktop app sends full timesheet on every save. Use `upsert` with `userId` + `payPeriodStart`:

```typescript
const timesheet = await prisma.comm_TimeSheet.upsert({
  where: {
    userId_payPeriodStart: {
      userId,
      payPeriodStart: new Date(payPeriodStart)
    }
  },
  update: {
    dailyHours: dailyHours || {},
    regularHours: regularHours || 0,
    totalHours: totalHours || 0,
    notes,
    status: status || 'DRAFT',
    updated: new Date()
  },
  create: {
    userId,
    payPeriodStart: new Date(payPeriodStart),
    payPeriodEnd: new Date(payPeriodEnd),
    dailyHours: dailyHours || {},
    regularHours: regularHours || 0,
    totalHours: totalHours || 0,
    notes,
    status: status || 'DRAFT'
  }
});
```

---

## Travel Forms API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/travel-forms` | Get all travel forms (admin) |
| GET | `/api/travel-forms/user/[userId]` | Get user's forms |
| GET | `/api/travel-forms/[id]` | Get single form |
| GET | `/api/travel-forms/rates` | Get default rates |
| GET | `/api/travel-forms/stats/[userId]` | Get stats |
| POST | `/api/travel-forms` | Create form |
| PUT | `/api/travel-forms/[id]` | Update form |
| POST | `/api/travel-forms/[id]/submit` | Submit |
| POST | `/api/travel-forms/[id]/approve` | Approve |
| POST | `/api/travel-forms/[id]/reject` | Reject |
| DELETE | `/api/travel-forms/[id]` | Delete draft |

**Default Rates:**
```json
{
  "hotelRate": 200.00,
  "privateRate": 50.00,
  "breakfastRate": 20.50,
  "lunchRate": 20.10,
  "dinnerRate": 50.65,
  "incidentalRate": 10.00,
  "personalVehicleRate": 0.50,
  "oneWayWinnipegKm": 904,
  "oneWayThompsonKm": 150,
  "winnipegFlatRate": 450.00,
  "thompsonFlatRate": 100.00,
  "taxiFareRate": 17.30
}
```

**Travel Form Calculation Logic:**

```typescript
// lib/travelFormCalculations.ts
export function calculateTravelFormTotals(data: any) {
  // Accommodation totals
  const hotelTotal = (data.hotelRate || 0) * (data.hotelNights || 0);
  const privateTotal = (data.privateRate || 0) * (data.privateNights || 0);
  
  // Meal totals
  const breakfastTotal = (data.breakfastRate || 0) * (data.breakfastDays || 0);
  const lunchTotal = (data.lunchRate || 0) * (data.lunchDays || 0);
  const dinnerTotal = (data.dinnerRate || 0) * (data.dinnerDays || 0);
  
  // Incidental total
  const incidentalTotal = (data.incidentalRate || 0) * (data.incidentalDays || 0);
  
  // Transportation totals
  let oneWayWinnipegTotal = 0;
  let oneWayThompsonTotal = 0;
  let publicTransportTotal = 0;
  
  const transportType = data.transportationType || 'PERSONAL_VEHICLE';
  
  if (transportType === 'PERSONAL_VEHICLE' || transportType === 'COMBINATION') {
    oneWayWinnipegTotal = (data.oneWayWinnipegKm || 0) * 
      (data.oneWayWinnipegTrips || 0) * (data.personalVehicleRate || 0);
    oneWayThompsonTotal = (data.oneWayThompsonKm || 0) * 
      (data.oneWayThompsonTrips || 0) * (data.personalVehicleRate || 0);
  }
  
  if (transportType === 'PUBLIC_TRANSPORT_WINNIPEG') {
    publicTransportTotal = data.winnipegFlatRate || 0;
  } else if (transportType === 'PUBLIC_TRANSPORT_THOMPSON') {
    publicTransportTotal = data.thompsonFlatRate || 0;
  } else if (transportType === 'COMBINATION') {
    publicTransportTotal = (data.winnipegFlatRate || 0) + (data.thompsonFlatRate || 0);
  }
  
  // Taxi total
  const taxiFareTotal = (data.taxiFareRate || 0) * (data.taxiFareDays || 0);
  
  // Grand total
  const grandTotal = 
    hotelTotal + privateTotal +
    breakfastTotal + lunchTotal + dinnerTotal +
    incidentalTotal +
    oneWayWinnipegTotal + oneWayThompsonTotal +
    publicTransportTotal +
    taxiFareTotal +
    (data.parkingTotal || 0);
  
  // Round all values
  const round = (n: number) => Math.round(n * 100) / 100;
  
  return {
    hotelTotal: round(hotelTotal),
    privateTotal: round(privateTotal),
    breakfastTotal: round(breakfastTotal),
    lunchTotal: round(lunchTotal),
    dinnerTotal: round(dinnerTotal),
    incidentalTotal: round(incidentalTotal),
    oneWayWinnipegTotal: round(oneWayWinnipegTotal),
    oneWayThompsonTotal: round(oneWayThompsonTotal),
    publicTransportTotal: round(publicTransportTotal),
    taxiFareTotal: round(taxiFareTotal),
    grandTotal: round(grandTotal)
  };
}
```

---

## File Structure

Create these files on your VPS:

```
app/
├── api/
│   └── comm/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── verify/route.ts
│       │   ├── reset-request/route.ts
│       │   └── reset-complete/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── password/route.ts
│       ├── sms-logs/
│       │   ├── route.ts
│       │   └── stats/route.ts
│       ├── email-logs/
│       │   ├── route.ts
│       │   └── stats/route.ts
│       ├── staff-email-logs/
│       │   ├── route.ts
│       │   └── stats/route.ts
│       ├── bulletin/
│       │   ├── route.ts
│       │   ├── poster/route.ts
│       │   ├── stats/route.ts
│       │   └── [id]/route.ts
│       └── signup-forms/
│           ├── route.ts
│           ├── stats/route.ts
│           ├── submissions/
│           │   └── [submissionId]/route.ts
│           └── [id]/
│               ├── route.ts
│               └── submissions/route.ts
│   ├── timesheets/
│   │   ├── route.ts
│   │   ├── [id]/
│   │   │   ├── route.ts
│   │   │   ├── submit/route.ts
│   │   │   ├── approve/route.ts
│   │   │   └── reject/route.ts
│   │   └── user/
│   │       └── [userId]/route.ts
│   └── travel-forms/
│       ├── route.ts
│       ├── rates/route.ts
│       ├── stats/
│       │   └── [userId]/route.ts
│       ├── [id]/
│       │   ├── route.ts
│       │   ├── submit/route.ts
│       │   ├── approve/route.ts
│       │   └── reject/route.ts
│       └── user/
│           └── [userId]/route.ts
│
lib/
├── auth.ts
├── prisma.ts
├── payPeriod.ts
└── travelFormCalculations.ts
```

---

## Implementation Checklist

### Schema Setup
- [ ] Add all enums to Prisma schema (msgmanager schema)
- [ ] Add comm_User model
- [ ] Add comm_Session model
- [ ] Add comm_LoginLog model
- [ ] Add comm_SmsLog model
- [ ] Add comm_EmailLog model
- [ ] Add comm_StaffEmailLog model
- [ ] Add comm_BulletinLog model
- [ ] Add comm_SignUpForm model
- [ ] Add comm_FormField model
- [ ] Add comm_FormSubmission model
- [ ] Add comm_TimeSheet model
- [ ] Add comm_TravelForm model
- [ ] Run `prisma migrate dev --name add_comm_tables`

### API Routes
- [ ] Implement /api/comm/auth/* (login, logout, verify, reset)
- [ ] Implement /api/comm/users/*
- [ ] Implement /api/comm/sms-logs/*
- [ ] Implement /api/comm/email-logs/*
- [ ] Implement /api/comm/staff-email-logs/*
- [ ] Implement /api/comm/bulletin/*
- [ ] Implement /api/comm/signup-forms/*
- [ ] Implement /api/timesheets/*
- [ ] Implement /api/travel-forms/*

### Environment
- [ ] Add TCN_COMM_API_KEY to VPS .env

### Seed Data
- [ ] Create initial admin user with hashed password

```typescript
// Seed example - Default TCN Admin User
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash('555BXc6.1aVb', 10);

await prisma.comm_User.upsert({
  where: { email: 'tcnadmin@tataskweyak.com' },
  update: {},
  create: {
    email: 'tcnadmin@tataskweyak.com',
    password: hashedPassword,
    first_name: 'Tataskweyak',
    last_name: 'Admin',
    department: 'BAND_OFFICE',
    role: 'ADMIN'
  }
});
```

### Testing
- [ ] Test login/logout flow
- [ ] Test user CRUD
- [ ] Test SMS log creation
- [ ] Test email log creation
- [ ] Test bulletin creation with poster upload
- [ ] Test form creation with fields
- [ ] Test form submission
- [ ] Test timesheet upsert
- [ ] Test travel form creation

---

**Document Version:** 2.0 (Complete VPS Integration)  
**Last Updated:** February 2, 2026  
**Desktop App:** TCN Communications (Electron)  
**VPS:** Next.js App Router + PostgreSQL (msgmanager schema)
