# VPS Sync Reference

This document describes the data structure sent from the **TCN Central Database** to the **VPS** during member synchronization.

## Sync Endpoints

The Central DB pushes data to these VPS endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sync/members` | POST | Single member sync |
| `/api/sync/batch` | POST | Batch sync multiple members |
| `/api/sync/status` | GET | Check connection status |

## Authentication

All requests include:
```
Header: x-api-key: <PORTAL_API_KEY>
Content-Type: application/json
```

---

## Member Sync Data Structure

When syncing members, the following JSON structure is sent:

### Single Member (`/api/sync/members`)

```json
{
  "id": "cuid-string",
  "created": "2025-03-20T00:00:00.000Z",
  "updated": "2025-04-10T00:00:00.000Z",
  "birthdate": "1985-11-13T00:00:00.000Z",
  "first_name": "John",
  "last_name": "Smith",
  "t_number": "1234",
  "deceased": null,
  "activated": "NONE",
  "profile": {
    "id": "profile-cuid",
    "created": "2025-03-20T00:00:00.000Z",
    "updated": "2025-04-10T00:00:00.000Z",
    "gender": "male",
    "o_r_status": "onreserve",
    "community": "Split Lake",
    "address": "123 Main St",
    "phone_number": "204-555-1234",
    "email": "john@example.com",
    "image_url": null
  },
  "barcode": {
    "id": "barcode-cuid",
    "created": "2025-03-20T00:00:00.000Z",
    "updated": "2025-04-10T00:00:00.000Z",
    "barcode": "123456789012",
    "activated": 2
  },
  "family": {
    "id": "family-cuid",
    "created": "2025-03-20T00:00:00.000Z",
    "updated": "2025-04-10T00:00:00.000Z",
    "spouse_fname": "Jane",
    "spouse_lname": "Smith",
    "dependents": 2
  }
}
```

### Batch Sync (`/api/sync/batch`)

```json
{
  "syncId": "uuid-string",
  "timestamp": "2026-01-04T12:00:00.000Z",
  "source": "master",
  "items": [
    {
      "operation": "UPSERT",
      "model": "fnmember",
      "data": {
        // Same structure as single member above
      }
    }
  ]
}
```

---

## Field Definitions

### fnmember (Root)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CUID - Primary key |
| `created` | ISO datetime | Record creation timestamp |
| `updated` | ISO datetime | Last update timestamp |
| `birthdate` | ISO datetime | Member's date of birth |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `t_number` | string | **Unique** treaty number |
| `deceased` | string \| null | "yes" if deceased, null otherwise |
| `activated` | enum | "NONE", "PENDING", or "ACTIVATED" |

### profile (Nested Object)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CUID - Primary key |
| `created` | ISO datetime | Record creation timestamp |
| `updated` | ISO datetime | Last update timestamp |
| `gender` | string \| null | "male", "female", or other |
| `o_r_status` | string | "onreserve" or "offreserve" |
| `community` | string | Community name |
| `address` | string | Physical address |
| `phone_number` | string | Phone number |
| `email` | string | Email address |
| `image_url` | string \| null | Profile image URL |

### barcode (Nested Object) ⚠️ **IMPORTANT**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CUID - Primary key |
| `created` | ISO datetime | Record creation timestamp |
| `updated` | ISO datetime | Last update timestamp |
| `barcode` | string | The barcode number/string |
| `activated` | integer | **1 = Available, 2 = Assigned** |

**Note:** Only assigned barcodes (activated=2) are sent. The VPS should:
1. Check if the `barcode` field exists in the incoming data
2. Create or update the Barcode record
3. Link it to the fnmember via `fnmemberId`

### family (Nested Object)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CUID - Primary key |
| `created` | ISO datetime | Record creation timestamp |
| `updated` | ISO datetime | Last update timestamp |
| `spouse_fname` | string \| null | Spouse first name |
| `spouse_lname` | string \| null | Spouse last name |
| `dependents` | integer | Number of dependents (default: 0) |

---

## VPS Handler Requirements

The VPS batch sync handler should process each item like this:

```typescript
// Pseudo-code for VPS batch handler

async function handleBatchSync(request) {
  const { items } = request;
  
  for (const item of items) {
    if (item.operation === 'UPSERT' && item.model === 'fnmember') {
      const { data } = item;
      
      // 1. Upsert fnmember
      const member = await prisma.fnmember.upsert({
        where: { t_number: data.t_number },
        create: {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          t_number: data.t_number,
          birthdate: new Date(data.birthdate),
          deceased: data.deceased,
          activated: data.activated,
        },
        update: {
          first_name: data.first_name,
          last_name: data.last_name,
          birthdate: new Date(data.birthdate),
          deceased: data.deceased,
          activated: data.activated,
        },
      });
      
      // 2. Upsert Profile (if provided)
      if (data.profile) {
        await prisma.profile.upsert({
          where: { id: data.profile.id },
          create: {
            id: data.profile.id,
            fnmemberId: member.id,
            gender: data.profile.gender,
            o_r_status: data.profile.o_r_status,
            community: data.profile.community,
            address: data.profile.address,
            phone_number: data.profile.phone_number,
            email: data.profile.email,
            image_url: data.profile.image_url,
          },
          update: {
            gender: data.profile.gender,
            o_r_status: data.profile.o_r_status,
            community: data.profile.community,
            address: data.profile.address,
            phone_number: data.profile.phone_number,
            email: data.profile.email,
            image_url: data.profile.image_url,
          },
        });
      }
      
      // 3. ⚠️ Upsert Barcode (if provided) - THIS MAY BE MISSING
      if (data.barcode) {
        await prisma.barcode.upsert({
          where: { id: data.barcode.id },
          create: {
            id: data.barcode.id,
            fnmemberId: member.id,
            barcode: data.barcode.barcode,
            activated: data.barcode.activated,
          },
          update: {
            fnmemberId: member.id,
            barcode: data.barcode.barcode,
            activated: data.barcode.activated,
          },
        });
      }
      
      // 4. Upsert Family (if provided)
      if (data.family) {
        await prisma.family.upsert({
          where: { id: data.family.id },
          create: {
            id: data.family.id,
            fnmemberId: member.id,
            spouse_fname: data.family.spouse_fname,
            spouse_lname: data.family.spouse_lname,
            dependents: data.family.dependents,
          },
          update: {
            spouse_fname: data.family.spouse_fname,
            spouse_lname: data.family.spouse_lname,
            dependents: data.family.dependents,
          },
        });
      }
    }
  }
}
```

---

## Prisma Schema Reference (VPS should match)

```prisma
model fnmember {
  id             String     @id @default(cuid())
  created        DateTime   @default(now())
  updated        DateTime   @default(now()) @updatedAt
  birthdate      DateTime   @db.Date
  first_name     String
  last_name      String
  t_number       String     @unique
  activated      ActivationStatus @default(NONE)
  deceased       String?
  profile        Profile[]
  barcode        Barcode[]
  family         Family[]
  @@schema("fnmemberlist")
}

model Barcode {
  id         String   @id @default(cuid())
  created    DateTime @default(now())
  updated    DateTime @default(now()) @updatedAt
  barcode    String
  activated  Int      @default(1)  // 1=available, 2=assigned
  fnmemberId String?
  fnmember   fnmember? @relation(fields: [fnmemberId], references: [id], onDelete: Cascade)
  @@schema("fnmemberlist")
}

enum ActivationStatus {
  NONE
  PENDING
  ACTIVATED
  @@schema("fnmemberlist")
}
```

---

## Checklist for VPS Fix

- [ ] Check if `/api/sync/batch` handler processes `data.barcode`
- [ ] Ensure Barcode model exists in VPS Prisma schema
- [ ] Add upsert logic for barcode when `data.barcode` is present
- [ ] Link barcode to fnmember via `fnmemberId`
- [ ] Run `npx prisma generate` after schema changes
- [ ] Run `npx prisma db push` or migration

---

## Testing

After VPS changes, test with a single member:

```bash
curl -X POST https://tcnaux.ca/api/sync/members \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "id": "test123",
    "first_name": "Test",
    "last_name": "User",
    "t_number": "9999",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "activated": "NONE",
    "barcode": {
      "id": "barcode123",
      "barcode": "TEST123456",
      "activated": 2
    }
  }'
```

Then verify the barcode was created in the VPS database.
