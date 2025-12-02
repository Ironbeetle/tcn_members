# Member Contacts API - For TCN Messaging App

## Overview

This API allows the **TCN Messaging App** to query member contact information (phone numbers and email addresses) from the portal's member database for SMS and email campaigns.

**Endpoint Base:** `/api/sync/contacts`

---

## Authentication

Same API key as bulletin sync - add to `x-api-key` header.

```bash
curl -H "x-api-key: YOUR_API_KEY" https://portal.tcn.ca/api/sync/contacts
```

---

## API Endpoints

### 1. Query Member Contacts

Search and filter members to get contact lists for messaging campaigns.

**Endpoint:** `GET /api/sync/contacts`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search by name or t_number (partial match) |
| `community` | string | - | Filter by community name |
| `activated` | `true`\|`false`\|`all` | `all` | Filter by activation status |
| `includeDeceased` | `true`\|`false` | `false` | Include deceased members |
| `limit` | number | `100` | Max results (1-500) |
| `cursor` | string | - | Pagination cursor |
| `fields` | `phone`\|`email`\|`both` | `both` | Which contact fields to return |

**Examples:**

```bash
# Get all activated members with phone numbers
GET /api/sync/contacts?activated=true&fields=phone&limit=200

# Search for specific member
GET /api/sync/contacts?search=John

# Get all members from Split Lake community
GET /api/sync/contacts?community=Split%20Lake

# Get only email addresses
GET /api/sync/contacts?fields=email&activated=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "memberId": "clx123abc456",
        "t_number": "TCN-12345",
        "name": "John Flett",
        "firstName": "John",
        "lastName": "Flett",
        "phone": "(204) 555-1234",
        "email": "john.flett@example.com",
        "community": "Split Lake",
        "status": "On-Reserve",
        "activated": "ACTIVATED",
        "birthdate": "1990-05-15"
      },
      {
        "memberId": "clx789def012",
        "t_number": "TCN-67890",
        "name": "Jane Flett",
        "firstName": "Jane",
        "lastName": "Flett",
        "phone": "(204) 555-5678",
        "email": "jane.flett@example.com",
        "community": "Split Lake",
        "status": "Off-Reserve",
        "activated": "ACTIVATED",
        "birthdate": "1985-08-20"
      }
    ],
    "count": 2,
    "pagination": {
      "hasMore": false,
      "nextCursor": null,
      "limit": 100
    },
    "query": {
      "search": "none",
      "community": "all",
      "activated": "all",
      "includeDeceased": "false",
      "fields": "both"
    }
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

**Pagination:**
```bash
# First request
GET /api/sync/contacts?limit=50

# Response includes nextCursor if hasMore is true
# Use cursor for next page
GET /api/sync/contacts?limit=50&cursor=clx999xyz888
```

---

### 2. Lookup Specific Member

Get contact info for a specific member by t_number, ID, or email.

**Endpoint:** `POST /api/sync/contacts`

**Request Body (Single Member):**
```json
{
  "t_number": "TCN-12345"
}
```
Or:
```json
{
  "memberId": "clx123abc456"
}
```
Or:
```json
{
  "email": "john.flett@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": "clx123abc456",
    "t_number": "TCN-12345",
    "name": "John Flett",
    "firstName": "John",
    "lastName": "Flett",
    "phone": "(204) 555-1234",
    "email": "john.flett@example.com",
    "community": "Split Lake",
    "status": "On-Reserve",
    "activated": "ACTIVATED",
    "deceased": null,
    "birthdate": "1990-05-15"
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

### 3. Batch Member Lookup

Look up multiple members in one request (max 100).

**Endpoint:** `POST /api/sync/contacts`

**Request Body (Array):**
```json
[
  { "t_number": "TCN-12345" },
  { "t_number": "TCN-67890" },
  { "email": "jane@example.com" },
  { "memberId": "clx999xyz888" }
]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "found": [
      {
        "memberId": "clx123abc456",
        "t_number": "TCN-12345",
        "name": "John Flett",
        "phone": "(204) 555-1234",
        "email": "john.flett@example.com",
        "community": "Split Lake",
        "activated": "ACTIVATED"
      },
      {
        "memberId": "clx789def012",
        "t_number": "TCN-67890",
        "name": "Jane Flett",
        "phone": "(204) 555-5678",
        "email": "jane.flett@example.com",
        "community": "Split Lake",
        "activated": "ACTIVATED"
      }
    ],
    "notFound": [
      {
        "identifier": { "email": "invalid@example.com" },
        "error": "Member not found"
      }
    ],
    "total": 3
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

## Usage in Messaging App

### Get All Phone Numbers for SMS Campaign

```typescript
async function getPhoneNumbers() {
  const response = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?activated=true&fields=phone&limit=500`,
    {
      headers: {
        'x-api-key': process.env.PORTAL_API_KEY!,
      },
    }
  );

  const result = await response.json();
  
  if (result.success) {
    const phoneNumbers = result.data.contacts
      .map(c => c.phone)
      .filter(Boolean); // Remove null/undefined
    
    return phoneNumbers;
  }
  
  return [];
}
```

### Get All Emails for Email Campaign

```typescript
async function getEmailAddresses(community?: string) {
  const params = new URLSearchParams({
    activated: 'true',
    fields: 'email',
    limit: '500',
    ...(community && { community }),
  });

  const response = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?${params}`,
    {
      headers: {
        'x-api-key': process.env.PORTAL_API_KEY!,
      },
    }
  );

  const result = await response.json();
  
  if (result.success) {
    return result.data.contacts.map(c => ({
      email: c.email,
      name: c.name,
      firstName: c.firstName,
    }));
  }
  
  return [];
}
```

### Search for Specific Member

```typescript
async function findMember(search: string) {
  const response = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?search=${encodeURIComponent(search)}`,
    {
      headers: {
        'x-api-key': process.env.PORTAL_API_KEY!,
      },
    }
  );

  const result = await response.json();
  return result.success ? result.data.contacts : [];
}
```

### Lookup Member by T-Number

```typescript
async function getMemberContact(tNumber: string) {
  const response = await fetch(
    `${process.env.PORTAL_API_URL}/contacts`,
    {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PORTAL_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ t_number: tNumber }),
    }
  );

  const result = await response.json();
  return result.success ? result.data : null;
}
```

### Get All Contacts with Pagination

```typescript
async function getAllContacts() {
  const allContacts: any[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      activated: 'true',
      limit: '100',
      ...(cursor && { cursor }),
    });

    const response = await fetch(
      `${process.env.PORTAL_API_URL}/contacts?${params}`,
      {
        headers: {
          'x-api-key': process.env.PORTAL_API_KEY!,
        },
      }
    );

    const result = await response.json();
    
    if (result.success) {
      allContacts.push(...result.data.contacts);
      hasMore = result.data.pagination.hasMore;
      cursor = result.data.pagination.nextCursor;
    } else {
      break;
    }
  }

  return allContacts;
}
```

---

## Integration Pattern for SMS/Email Campaigns

### SMS Campaign Example

```typescript
import { getPhoneNumbers, getMemberContact } from './lib/portal-contacts';

async function sendSmsToAllMembers(message: string) {
  // 1. Get all phone numbers from portal
  const contacts = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?activated=true&fields=phone`,
    {
      headers: { 'x-api-key': process.env.PORTAL_API_KEY! },
    }
  ).then(r => r.json());

  if (!contacts.success) {
    throw new Error('Failed to fetch contacts');
  }

  const phoneNumbers = contacts.data.contacts
    .map(c => c.phone)
    .filter(Boolean);

  // 2. Send SMS via your provider (Twilio, etc.)
  for (const phone of phoneNumbers) {
    await sendSms(phone, message);
  }

  // 3. Log the campaign in your SmsLog
  await prisma.smsLog.create({
    data: {
      message,
      recipients: phoneNumbers,
      status: 'sent',
      userId: session.user.id,
    },
  });
}
```

### Email Campaign Example

```typescript
async function sendEmailToAllMembers(subject: string, body: string) {
  // 1. Get all email addresses from portal
  const contacts = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?activated=true&fields=email`,
    {
      headers: { 'x-api-key': process.env.PORTAL_API_KEY! },
    }
  ).then(r => r.json());

  if (!contacts.success) {
    throw new Error('Failed to fetch contacts');
  }

  const recipients = contacts.data.contacts
    .filter(c => c.email)
    .map(c => ({
      email: c.email,
      name: c.name,
    }));

  // 2. Send emails via your provider (SendGrid, etc.)
  for (const recipient of recipients) {
    await sendEmail({
      to: recipient.email,
      subject,
      body: body.replace('{{name}}', recipient.name),
    });
  }

  // 3. Log the campaign in your EmailLog
  await prisma.emailLog.create({
    data: {
      subject,
      message: body,
      recipients: recipients.map(r => r.email),
      status: 'sent',
      userId: session.user.id,
    },
  });
}
```

### Targeted Campaign (Specific Community)

```typescript
async function sendToSplitLake(message: string, subject: string) {
  const response = await fetch(
    `${process.env.PORTAL_API_URL}/contacts?community=Split%20Lake&activated=true`,
    {
      headers: { 'x-api-key': process.env.PORTAL_API_KEY! },
    }
  );

  const result = await response.json();
  
  if (result.success) {
    const members = result.data.contacts;
    
    // Send SMS
    const phones = members.map(m => m.phone).filter(Boolean);
    await sendBulkSms(phones, message);
    
    // Send Email
    const emails = members.map(m => m.email).filter(Boolean);
    await sendBulkEmail(emails, subject, message);
  }
}
```

---

## Response Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `memberId` | string | Portal's fnmember.id (CUID) |
| `t_number` | string | Member's treaty number (e.g., "TCN-12345") |
| `name` | string | Full name: "FirstName LastName" |
| `firstName` | string | Member's first name |
| `lastName` | string | Member's last name |
| `phone` | string | Phone number (format: "(204) 555-1234") |
| `email` | string | Email address |
| `community` | string | Community name (e.g., "Split Lake") |
| `status` | string | On/Off-Reserve status |
| `activated` | string | Activation status: "NONE", "PENDING", "ACTIVATED" |
| `deceased` | string\|null | Date of death if applicable |
| `birthdate` | string | ISO date: "YYYY-MM-DD" |

---

## Activation Status Values

- `NONE` - Account not activated (no portal access)
- `PENDING` - Activation in progress
- `ACTIVATED` - Full portal access

**Best Practice:** For campaigns, filter to `activated=true` to only reach members with verified contact info.

---

## Error Handling

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API key",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid query parameters",
  "details": [
    {
      "path": ["limit"],
      "message": "Number must be less than or equal to 500"
    }
  ]
}
```

### 404 Not Found (Single Lookup)
```json
{
  "success": false,
  "error": "Member not found or has no profile",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

## Performance Considerations

1. **Pagination:** For large result sets, use pagination (`limit` + `cursor`)
2. **Field Selection:** Use `fields` parameter to only fetch what you need (faster)
3. **Caching:** Consider caching contact lists for 5-15 minutes
4. **Batch Lookup:** Use batch endpoint for multiple members (max 100 at once)
5. **Rate Limiting:** Portal limits to 100 requests/minute

---

## Privacy & Compliance

1. **Data Usage:** Contact info should only be used for official community communications
2. **Deceased Members:** Excluded by default (`includeDeceased=false`)
3. **Opt-Out:** Consider maintaining opt-out list in messaging app
4. **Logging:** All API access is logged on portal for audit trail
5. **Security:** Never expose contact lists publicly; always use API key authentication

---

## Testing

### Test with curl

```bash
# Get all activated members
curl -H "x-api-key: YOUR_KEY" \
  "https://portal.tcn.ca/api/sync/contacts?activated=true&limit=10"

# Search for member
curl -H "x-api-key: YOUR_KEY" \
  "https://portal.tcn.ca/api/sync/contacts?search=John"

# Lookup by t_number
curl -X POST https://portal.tcn.ca/api/sync/contacts \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"t_number": "TCN-12345"}'

# Batch lookup
curl -X POST https://portal.tcn.ca/api/sync/contacts \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"t_number": "TCN-12345"},
    {"t_number": "TCN-67890"}
  ]'
```

---

## Summary

- **Query Contacts:** `GET /api/sync/contacts` with filters
- **Lookup Member:** `POST /api/sync/contacts` with identifier
- **Batch Lookup:** `POST /api/sync/contacts` with array
- **Authentication:** Same API key as bulletin sync
- **Rate Limit:** 100 requests/minute
- **Max Results:** 500 per request
- **Pagination:** Use `cursor` for large datasets
