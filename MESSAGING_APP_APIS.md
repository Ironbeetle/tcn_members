# TCN Portal APIs - Quick Reference for Messaging App

## Overview

Two APIs available for the messaging app:
1. **Bulletin Sync API** - Push bulletins and poster images to portal
2. **Member Contacts API** - Query member contact info for SMS/Email campaigns

---

## Setup

**Environment Variables (.env):**
```env
PORTAL_API_KEY="your-secure-api-key"
PORTAL_API_URL="https://your-portal-domain.com/api/sync"
```

**Authentication:**
All requests require `x-api-key` header:
```typescript
headers: {
  'x-api-key': process.env.PORTAL_API_KEY,
}
```

---

## Bulletin Sync API

### Quick Start

```typescript
// Copy this file to your messaging app
import { createBulletinWithPoster } from './lib/portal-bulletin-client';

// After creating BulletinApiLog
await createBulletinWithPoster(
  {
    sourceId: bulletinApiLog.id,
    title: bulletinApiLog.title,
    subject: bulletinApiLog.subject,
    category: bulletinApiLog.category,
    userId: bulletinApiLog.userId,
  },
  posterImageFile,
  'poster.jpg'
);
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sync/poster` | Upload poster image (multipart) |
| POST | `/api/sync/bulletin` | Create/update bulletin |
| GET | `/api/sync/bulletin` | List bulletins |
| DELETE | `/api/sync/bulletin` | Delete bulletin |

### Categories
`CHIEFNCOUNCIL`, `HEALTH`, `EDUCATION`, `RECREATION`, `EMPLOYMENT`, `PROGRAM_EVENTS`, `ANNOUNCEMENTS`

**Full Documentation:** `/BULLETIN_SYNC_API.md`

---

## Member Contacts API

### Get All Phone Numbers (SMS)

```typescript
const response = await fetch(
  `${process.env.PORTAL_API_URL}/contacts?activated=true&fields=phone&limit=500`,
  { headers: { 'x-api-key': process.env.PORTAL_API_KEY! } }
);

const { contacts } = await response.json().then(r => r.data);
const phoneNumbers = contacts.map(c => c.phone).filter(Boolean);
```

### Get All Emails

```typescript
const response = await fetch(
  `${process.env.PORTAL_API_URL}/contacts?activated=true&fields=email&limit=500`,
  { headers: { 'x-api-key': process.env.PORTAL_API_KEY! } }
);

const { contacts } = await response.json().then(r => r.data);
const emails = contacts.map(c => ({ email: c.email, name: c.name }));
```

### Search for Member

```typescript
const response = await fetch(
  `${process.env.PORTAL_API_URL}/contacts?search=John+Flett`,
  { headers: { 'x-api-key': process.env.PORTAL_API_KEY! } }
);
```

### Lookup by T-Number

```typescript
const response = await fetch(
  `${process.env.PORTAL_API_URL}/contacts`,
  {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PORTAL_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ t_number: 'TCN-12345' }),
  }
);
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sync/contacts` | Query/search contacts |
| POST | `/api/sync/contacts` | Lookup specific member(s) |

### Query Parameters

| Parameter | Values | Default | Example |
|-----------|--------|---------|---------|
| `search` | string | - | `?search=John` |
| `community` | string | - | `?community=Split%20Lake` |
| `activated` | `true`\|`false`\|`all` | `all` | `?activated=true` |
| `fields` | `phone`\|`email`\|`both` | `both` | `?fields=phone` |
| `limit` | 1-500 | 100 | `?limit=200` |
| `cursor` | string | - | For pagination |

**Full Documentation:** `/CONTACTS_API.md`

---

## Response Format

### Bulletin API Response
```json
{
  "success": true,
  "message": "Bulletin synced successfully",
  "data": { /* bulletin data */ },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

### Contacts API Response
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "memberId": "clx123abc456",
        "t_number": "TCN-12345",
        "name": "John Flett",
        "phone": "(204) 555-1234",
        "email": "john@example.com",
        "community": "Split Lake",
        "activated": "ACTIVATED"
      }
    ],
    "count": 1
  }
}
```

---

## Common Patterns

### Send SMS to All Members
```typescript
// 1. Get contacts
const res = await fetch(
  `${PORTAL_API_URL}/contacts?activated=true&fields=phone`,
  { headers: { 'x-api-key': API_KEY } }
);
const { contacts } = (await res.json()).data;

// 2. Send SMS
const phones = contacts.map(c => c.phone).filter(Boolean);
await sendBulkSms(phones, message);

// 3. Log in SmsLog
await prisma.smsLog.create({
  data: { message, recipients: phones, status: 'sent', userId }
});
```

### Send Email to Specific Community
```typescript
// 1. Get contacts from community
const res = await fetch(
  `${PORTAL_API_URL}/contacts?community=Split%20Lake&activated=true&fields=email`,
  { headers: { 'x-api-key': API_KEY } }
);
const { contacts } = (await res.json()).data;

// 2. Send emails
for (const contact of contacts) {
  await sendEmail(contact.email, subject, body);
}
```

### Create Bulletin with Poster
```typescript
// 1. Create BulletinApiLog in your DB
const bulletin = await prisma.bulletinApiLog.create({
  data: { title, subject, category, userId, poster_url: '/temp.jpg' }
});

// 2. Sync to portal (uploads poster + creates bulletin)
const result = await createBulletinWithPoster(
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

// 3. Update your BulletinApiLog
if (result.success) {
  await prisma.bulletinApiLog.update({
    where: { id: bulletin.id },
    data: { poster_url: result.data.poster_url, synced: true }
  });
}
```

---

## Files to Copy to Messaging App

1. **`/scripts/portal-bulletin-client.ts`**
   - Functions for bulletin sync
   - Place in: `src/lib/portal-bulletin-client.ts`

---

## Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 401 | Invalid API key | Check PORTAL_API_KEY matches portal |
| 400 | Validation error | Check request format |
| 404 | Not found | Member/bulletin doesn't exist |
| 500 | Server error | Check portal logs |

---

## Rate Limits

- Standard endpoints: **100 requests/minute**
- Batch operations: **10 requests/minute**

---

## Best Practices

1. **Contacts:**
   - Use `activated=true` for campaigns
   - Cache contact lists for 5-15 minutes
   - Use `fields` parameter to limit data transfer
   - Use pagination for large queries

2. **Bulletins:**
   - Always upload poster before syncing bulletin
   - Use `sourceId` (your BulletinApiLog.id) to track sync
   - Delete from portal when deleted in messaging app

3. **Security:**
   - Never expose API key publicly
   - Store in environment variables
   - Use HTTPS in production
   - Monitor API access logs

---

## Testing

```bash
# Test contacts API
curl -H "x-api-key: YOUR_KEY" \
  "https://portal.tcn.ca/api/sync/contacts?limit=5"

# Test bulletin API
curl -H "x-api-key: YOUR_KEY" \
  "https://portal.tcn.ca/api/sync/bulletin?limit=5"
```

---

## Support

- **Bulletin Sync:** See `/BULLETIN_SYNC_API.md`
- **Contacts API:** See `/CONTACTS_API.md`
- **Full API Docs:** See `/SYNC_API_DOCS.md`
