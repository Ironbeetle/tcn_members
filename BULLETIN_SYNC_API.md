# Bulletin Sync API - For TCN Messaging App

## Overview

This API allows the **TCN Messaging App** to push bulletins and poster images to the **TCN Member Portal** for display to community members.

### Sync Flow
1. User creates bulletin in Messaging App → saved to `msgmanager.BulletinApiLog`
2. Messaging App uploads poster image to Portal
3. Messaging App syncs bulletin data to Portal → saved to `tcnbulletin.bulletin`
4. Portal displays bulletin on TCN_BulletinBoard page
5. Both apps track same bulletin via `sourceId` (your `BulletinApiLog.id`)

---

## Authentication

All API requests require an API key in the `x-api-key` header.

**Portal `.env` (line 15):**
```env
API_KEYS="your-secure-api-key-here"
```

**Messaging App `.env`:**
```env
PORTAL_API_KEY="your-secure-api-key-here"
PORTAL_API_URL="https://your-portal-domain.com/api/sync"
```

---

## API Endpoints

### 1. Upload Poster Image

Upload the bulletin poster image **BEFORE** syncing the bulletin data.

**Endpoint:** `POST /api/sync/poster`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file (jpeg, png, gif, webp, max 10MB) |
| `sourceId` | string | Yes | Your `BulletinApiLog.id` from messaging app |
| `filename` | string | No | Original filename (defaults to file.name) |

**Response:**
```json
{
  "success": true,
  "message": "Poster uploaded successfully",
  "data": {
    "sourceId": "clx123abc456",
    "filename": "clx123abc456.jpg",
    "poster_url": "/bulletinboard/clx123abc456.jpg",
    "size": 245678,
    "contentType": "image/jpeg"
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

**Poster Storage:**
- Files saved to: `/public/bulletinboard/` on portal
- Filename format: `{sourceId}.{ext}` (e.g., `clx123abc456.jpg`)
- Accessible URL: `/bulletinboard/{filename}`

---

### 2. Sync Bulletin

Create or update a bulletin on the portal.

**Endpoint:** `POST /api/sync/bulletin`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "sourceId": "clx123abc456",           // Required: Your BulletinApiLog.id
  "title": "Community Meeting",         // Required
  "subject": "Monthly meeting Dec 15",  // Required
  "poster_url": "/bulletinboard/clx123abc456.jpg",  // Required: From poster upload
  "category": "CHIEFNCOUNCIL",          // Required
  "userId": "clu789def012",             // Optional: Your User.id who created it
  "created": "2025-12-02T10:00:00Z"     // Optional: Original creation time
}
```

**Categories:** 
- `CHIEFNCOUNCIL` - Chief & Council announcements
- `HEALTH` - Health programs/clinics
- `EDUCATION` - Education programs  
- `RECREATION` - Recreation events
- `EMPLOYMENT` - Job postings
- `PROGRAM_EVENTS` - Community programs/events
- `ANNOUNCEMENTS` - General announcements

**Response:**
```json
{
  "success": true,
  "message": "Bulletin synced successfully",
  "data": {
    "id": "clb999xyz888",
    "sourceId": "clx123abc456",
    "title": "Community Meeting",
    "subject": "Monthly meeting Dec 15",
    "poster_url": "/bulletinboard/clx123abc456.jpg",
    "category": "CHIEFNCOUNCIL",
    "userId": "clu789def012",
    "created": "2025-12-02T10:00:00.000Z",
    "updated": "2025-12-02T10:30:00.000Z"
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

**Behavior:**
- If `sourceId` doesn't exist → creates new bulletin
- If `sourceId` exists → updates existing bulletin (upsert)

---

### 3. Update Bulletin

Update an existing bulletin (partial update).

**Endpoint:** `POST /api/sync/bulletin`

**Request Body:**
```json
{
  "sourceId": "clx123abc456",           // Required to identify bulletin
  "title": "Updated Title",             // Optional
  "subject": "Updated subject",         // Optional
  "category": "HEALTH",                 // Optional
  "poster_url": "/bulletinboard/new.jpg" // Optional
}
```

---

### 4. Delete Bulletin

Remove a bulletin from the portal.

**Endpoint:** `DELETE /api/sync/bulletin`

**Request Body:**
```json
{
  "sourceId": "clx123abc456"
}
```
Or:
```json
{
  "id": "clb999xyz888"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulletin deleted successfully",
  "data": {
    "id": "clb999xyz888",
    "sourceId": "clx123abc456"
  }
}
```

---

### 5. Delete Poster

Remove a poster image file.

**Endpoint:** `DELETE /api/sync/poster`

**Request Body:**
```json
{
  "sourceId": "clx123abc456"
}
```
Or:
```json
{
  "filename": "clx123abc456.jpg"
}
```

---

### 6. List Bulletins

Get bulletins from the portal (for verification/debugging).

**Endpoint:** `GET /api/sync/bulletin`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `limit` | number | Max results (default 50, max 100) |
| `since` | ISO date | Only bulletins updated after this date |

**Example:**
```
GET /api/sync/bulletin?category=HEALTH&limit=20&since=2025-12-01T00:00:00Z
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bulletins": [
      {
        "id": "clb999xyz888",
        "sourceId": "clx123abc456",
        "title": "Community Meeting",
        "category": "CHIEFNCOUNCIL",
        "created": "2025-12-02T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 7. Check Poster Exists

Verify if a poster file exists on the portal.

**Endpoint:** `GET /api/sync/poster`

**Query Parameters:**
- `sourceId={sourceId}` - Check by bulletin ID
- `filename={filename}` - Check by filename
- No params - List all posters

**Example:**
```
GET /api/sync/poster?sourceId=clx123abc456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "filename": "clx123abc456.jpg",
    "poster_url": "/bulletinboard/clx123abc456.jpg",
    "size": 245678,
    "modified": "2025-12-02T10:30:00.000Z"
  }
}
```

---

## Using the Client Library

Copy `/scripts/portal-bulletin-client.ts` to your messaging app.

### Installation

```typescript
// In your messaging app
import {
  createBulletinWithPoster,
  uploadPoster,
  syncBulletin,
  updateBulletin,
  deleteBulletin,
} from './lib/portal-bulletin-client';
```

### Complete Workflow (Recommended)

```typescript
// After saving BulletinApiLog in your database
async function publishBulletinToPortal(
  bulletinApiLog: BulletinApiLog,
  posterFile: File
) {
  try {
    // One function handles both poster upload + bulletin sync
    const result = await createBulletinWithPoster(
      {
        sourceId: bulletinApiLog.id,
        title: bulletinApiLog.title,
        subject: bulletinApiLog.subject,
        category: bulletinApiLog.category,
        userId: bulletinApiLog.userId,
      },
      posterFile,
      'poster.jpg'
    );

    if (result.success) {
      console.log('✓ Published to portal');
      console.log('Poster URL:', result.data?.poster_url);
      console.log('Bulletin ID:', result.data?.bulletin.id);
      
      // Optionally save portal bulletin ID to your BulletinApiLog
      await prisma.bulletinApiLog.update({
        where: { id: bulletinApiLog.id },
        data: { portalBulletinId: result.data?.bulletin.id },
      });
    } else {
      console.error('✗ Failed to publish:', result.error);
    }
  } catch (error) {
    console.error('✗ Error publishing bulletin:', error);
  }
}
```

### Manual Two-Step Process

```typescript
// Step 1: Upload poster
const uploadResult = await uploadPoster(
  bulletinApiLog.id,
  posterFile,
  'community-meeting.jpg'
);

if (!uploadResult.success) {
  console.error('Failed to upload poster:', uploadResult.error);
  return;
}

const posterUrl = uploadResult.data?.poster_url;

// Step 2: Sync bulletin with poster URL
const bulletinResult = await syncBulletin({
  sourceId: bulletinApiLog.id,
  title: bulletinApiLog.title,
  subject: bulletinApiLog.subject,
  poster_url: posterUrl!,
  category: bulletinApiLog.category,
  userId: bulletinApiLog.userId,
});

if (bulletinResult.success) {
  console.log('✓ Bulletin synced');
}
```

### Upload from File Path (Node.js)

```typescript
import { uploadPosterFromPath } from './lib/portal-bulletin-client';

const result = await uploadPosterFromPath(
  bulletinApiLog.id,
  '/path/to/poster.jpg'
);
```

### Update Existing Bulletin

```typescript
await updateBulletin(bulletinApiLog.id, {
  title: 'Updated Title',
  subject: 'Updated subject',
});
```

### Delete Bulletin

```typescript
await deleteBulletin({ sourceId: bulletinApiLog.id });
```

---

## Integration Pattern

### In Your Messaging App Workflow

```typescript
// 1. User creates bulletin in messaging app
const bulletin = await prisma.bulletinApiLog.create({
  data: {
    title: 'Community Meeting',
    subject: 'Monthly meeting this Saturday',
    poster_url: '/uploads/temp-poster.jpg',
    category: 'CHIEFNCOUNCIL',
    userId: session.user.id,
  },
});

// 2. Read the poster file
const posterFile = await readFile('/uploads/temp-poster.jpg');

// 3. Publish to portal
const portalResult = await createBulletinWithPoster(
  {
    sourceId: bulletin.id,
    title: bulletin.title,
    subject: bulletin.subject,
    category: bulletin.category,
    userId: bulletin.userId,
  },
  posterFile,
  'poster.jpg'
);

// 4. Update your BulletinApiLog with portal info
if (portalResult.success) {
  await prisma.bulletinApiLog.update({
    where: { id: bulletin.id },
    data: {
      portalSynced: true,
      portalPosterUrl: portalResult.data?.poster_url,
    },
  });
  
  // 5. Send SMS/Email notifications here...
}
```

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Invalid API key",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```
**Fix:** Check `PORTAL_API_KEY` matches portal's `API_KEYS`

**400 Bad Request - File Type**
```json
{
  "success": false,
  "error": "Invalid file type: application/pdf. Allowed: image/jpeg, image/png, ..."
}
```
**Fix:** Only upload image files (jpeg, png, gif, webp)

**400 Bad Request - File Size**
```json
{
  "success": false,
  "error": "File too large. Max size: 10MB"
}
```
**Fix:** Resize or compress image before upload

**400 Validation Error**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```
**Fix:** Ensure all required fields are provided

---

## Testing

### Test with curl

```bash
# 1. Upload poster
curl -X POST https://portal.tcn.ca/api/sync/poster \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/poster.jpg" \
  -F "sourceId=clx123abc456" \
  -F "filename=test-poster.jpg"

# 2. Sync bulletin
curl -X POST https://portal.tcn.ca/api/sync/bulletin \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "clx123abc456",
    "title": "Test Bulletin",
    "subject": "Testing sync",
    "poster_url": "/bulletinboard/clx123abc456.jpg",
    "category": "ANNOUNCEMENTS"
  }'

# 3. List bulletins
curl -H "x-api-key: YOUR_API_KEY" \
  "https://portal.tcn.ca/api/sync/bulletin?limit=10"

# 4. Delete bulletin
curl -X DELETE https://portal.tcn.ca/api/sync/bulletin \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "clx123abc456"}'
```

---

## Database Schema Mapping

### Your Messaging App (msgmanager schema)
```prisma
model BulletinApiLog {
  id          String    @id @default(cuid())
  title       String
  subject     String
  poster_url  String
  category    Categories @default(CHIEFNCOUNCIL)
  userId      String
  User        User      @relation(fields: [userId], references: [id])
  created     DateTime   @default(now())
  updated     DateTime   @default(now()) @updatedAt
  @@schema("msgmanager")
}
```

### Portal (tcnbulletin schema)
```prisma
model bulletin {
  id            String     @id @default(cuid())
  created       DateTime   @default(now())
  updated       DateTime   @default(now()) @updatedAt
  title         String
  subject       String
  poster_url    String
  category      Categories @default(CHIEFNCOUNCIL)
  sourceId      String?    @unique  // YOUR BulletinApiLog.id
  userId        String?              // YOUR User.id
  @@schema("tcnbulletin")
}
```

**Key Mapping:**
- `BulletinApiLog.id` → `bulletin.sourceId`
- `BulletinApiLog.userId` → `bulletin.userId`
- Both use same `Categories` enum values

---

## VPS Portal API Status

> ✅ **Verified (January 2026):** The VPS Portal API endpoints are correctly implemented and match this documentation. If you're experiencing sync issues, the problem is likely on the **Messaging App (client) side**.

### What's Been Verified on VPS:
- ✅ `POST /api/sync/poster` - Accepts multipart/form-data uploads
- ✅ `POST /api/sync/bulletin` - Creates/updates bulletins with upsert
- ✅ `GET /api/sync/bulletin` - Lists bulletins with filters
- ✅ `DELETE /api/sync/bulletin` - Deletes by sourceId or id
- ✅ `GET /api/sync/poster` - Checks poster existence
- ✅ `DELETE /api/sync/poster` - Removes poster files
- ✅ Categories enum matches between Prisma schema, validation, and docs
- ✅ All required fields validated correctly

---

## Troubleshooting (Messaging App Side)

### ⚠️ Common Errors to Check in Your Messaging App

#### 1. **sourceId Format Error (400 Bad Request)**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [{ "path": ["sourceId"], "message": "Invalid cuid" }]
}
```
**Cause:** The `sourceId` must be a valid **CUID** format (e.g., `clx123abc456def`).  
**Fix:** Ensure your `BulletinApiLog.id` is generated with `@default(cuid())` in Prisma, not UUID or auto-increment.

#### 2. **Missing Required Fields (400 Bad Request)**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [{ "path": ["title"], "message": "Required" }]
}
```
**Cause:** One or more required fields are missing.  
**Required fields:** `sourceId`, `title`, `subject`, `poster_url`, `category`  
**Fix:** Ensure all required fields are included in the request body.

#### 3. **Invalid Category (400 Bad Request)**
```json
{
  "success": false,
  "error": "Validation error", 
  "details": [{ "path": ["category"], "message": "Invalid enum value" }]
}
```
**Cause:** Category doesn't match the allowed values.  
**Valid values:** `CHIEFNCOUNCIL`, `HEALTH`, `EDUCATION`, `RECREATION`, `EMPLOYMENT`, `PROGRAM_EVENTS`, `ANNOUNCEMENTS`  
**Fix:** Use exact uppercase category names.

#### 4. **API Key Error (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```
**Checklist:**
- [ ] `PORTAL_API_KEY` in your `.env` matches `API_KEYS` on VPS portal
- [ ] Header is exactly `x-api-key` (lowercase)
- [ ] No extra whitespace or quotes around the key value
- [ ] Portal was restarted after any API_KEYS change

#### 5. **Wrong API URL (Network Error / 404)**
```json
{
  "success": false,
  "error": "Network error"
}
```
**Checklist:**
- [ ] `PORTAL_API_URL` should be `https://your-portal-domain.com/api/sync` (no trailing slash)
- [ ] URL is reachable from your server (test with `curl`)
- [ ] Using HTTPS in production

#### 6. **Poster Upload Content-Type Issue**
**Cause:** Manually setting `Content-Type: multipart/form-data` header.  
**Fix:** Do NOT set Content-Type header manually when uploading posters. Let the HTTP client set it automatically with the boundary parameter.

#### 7. **Poster Not Uploaded Before Bulletin Sync**
**Cause:** Trying to sync bulletin before poster upload completes.  
**Fix:** Always wait for poster upload to complete and use the returned `poster_url` in the bulletin sync request.

### Debug Checklist for Messaging App

```bash
# 1. Test API key works
curl -X GET "https://portal.tcn.ca/api/sync/bulletin?limit=1" \
  -H "x-api-key: YOUR_API_KEY"

# 2. Test poster upload
curl -X POST "https://portal.tcn.ca/api/sync/poster" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/test.jpg" \
  -F "sourceId=cltest123456789" \
  -F "filename=test.jpg"

# 3. Test bulletin sync  
curl -X POST "https://portal.tcn.ca/api/sync/bulletin" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "cltest123456789",
    "title": "Test",
    "subject": "Test subject",
    "poster_url": "/bulletinboard/cltest123456789.jpg",
    "category": "ANNOUNCEMENTS"
  }'
```

### Bulletin not appearing on portal?
1. Check bulletin was synced successfully (check API response)
2. Verify poster image uploaded (check `/public/bulletinboard/` directory)
3. Check category matches portal's Categories enum
4. Verify portal is displaying bulletins from `tcnbulletin.bulletin` table

### Poster image broken/missing?
1. Check `poster_url` format: `/bulletinboard/{sourceId}.{ext}`
2. Verify file exists in portal's `/public/bulletinboard/` directory
3. Check file permissions (should be readable by web server)
4. Verify image URL is accessible: `https://portal.tcn.ca/bulletinboard/filename.jpg`

---

## Security Notes

1. **API Keys:** Store securely, never commit to git
2. **HTTPS:** Always use HTTPS in production
3. **File Validation:** Portal validates file type and size
4. **Rate Limiting:** Portal has rate limits (100 req/min standard)
5. **Access Logs:** All API calls are logged on portal for audit

---

## Support Files

- **Client Library:** `/scripts/portal-bulletin-client.ts`
- **Full API Docs:** `/SYNC_API_DOCS.md` (sections 7-10)
- **Validation Schemas:** `/src/lib/bulletin-validation.ts`
