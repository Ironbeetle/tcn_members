# TCN Sign-Up Forms API Documentation

This document describes the API integration between **TCN_COMM** (Staff App) and **TCN Portal** (Community App) for the Sign-Up Forms feature.

---

## Architecture Overview

```
┌─────────────────────────────┐                    ┌─────────────────────────────┐
│        TCN_COMM             │                    │        TCN PORTAL           │
│      (Staff App)            │                    │     (Community App)         │
├─────────────────────────────┤                    ├─────────────────────────────┤
│                             │                    │                             │
│  1. Staff creates form      │                    │                             │
│          │                  │                    │                             │
│          ▼                  │                    │                             │
│  POST to local DB           │                    │                             │
│          │                  │                    │                             │
│          ▼                  │                    │                             │
│  Sync to Portal ────────────┼──── PUSH ────────► │  Store form definition      │
│                             │                    │          │                  │
│                             │                    │          ▼                  │
│                             │                    │  Display form to members    │
│                             │                    │          │                  │
│                             │                    │          ▼                  │
│                             │                    │  Member fills & submits     │
│                             │                    │          │                  │
│  Store submission ◄─────────┼──── WEBHOOK ──────┼──────────┘                  │
│          │                  │                    │                             │
│          ▼                  │                    │                             │
│  Staff views responses      │                    │                             │
│                             │                    │                             │
└─────────────────────────────┘                    └─────────────────────────────┘
```

---

## Environment Variables

### TCN_COMM (.env.local)
```env
# Portal connection
TCN_PORTAL_URL=http://66.102.140.117
TCN_PORTAL_API_KEY=your-shared-secret-key
```

### TCN Portal (.env)
```env
# TCN_COMM webhook endpoint
TCN_COMM_WEBHOOK_URL=https://your-tcn-comm-domain.com/api/forms/submissions/webhook
TCN_COMM_API_KEY=your-shared-secret-key
```

---

## TCN_COMM API Endpoints (This App)

### Forms CRUD

#### List All Forms
```
GET /api/forms
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `includeInactive` | boolean | Include deactivated forms (default: false) |

**Response:**
```json
{
  "success": true,
  "forms": [
    {
      "id": "clx1abc123...",
      "title": "Christmas Dinner Registration",
      "description": "Sign up for the annual community dinner",
      "deadline": "2025-12-20T23:59:59.000Z",
      "maxEntries": 100,
      "isActive": true,
      "createdAt": "2025-12-05T10:00:00.000Z",
      "updatedAt": "2025-12-05T10:00:00.000Z",
      "createdBy": "user_id_123",
      "submissionCount": 45,
      "fields": [
        {
          "id": "field_1",
          "label": "Full Name",
          "fieldType": "TEXT",
          "required": true,
          "order": 0
        }
      ]
    }
  ]
}
```

---

#### Get Single Form
```
GET /api/forms/:id
```

**Response:**
```json
{
  "success": true,
  "form": {
    "id": "clx1abc123...",
    "title": "Christmas Dinner Registration",
    "description": "...",
    "deadline": "2025-12-20T23:59:59.000Z",
    "maxEntries": 100,
    "isActive": true,
    "submissionCount": 45,
    "fields": [...]
  }
}
```

---

#### Create Form
```
POST /api/forms
```

**Request Body:**
```json
{
  "title": "Christmas Dinner Registration",
  "description": "Sign up for the annual community dinner",
  "category": "PROGRAM_EVENTS",
  "deadline": "2025-12-20T23:59:59Z",
  "maxEntries": 100,
  "fields": [
    {
      "label": "Full Name",
      "fieldType": "TEXT",
      "required": true,
      "placeholder": "Enter your full name",
      "order": 0
    },
    {
      "label": "Email",
      "fieldType": "EMAIL",
      "required": true,
      "order": 1
    },
    {
      "label": "Number of Guests",
      "fieldType": "NUMBER",
      "required": true,
      "order": 2
    },
    {
      "label": "Dietary Restrictions",
      "fieldType": "SELECT",
      "required": false,
      "options": ["None", "Vegetarian", "Gluten-Free", "Other"],
      "order": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "form": { ... },
  "portalSynced": true,
  "portalError": null
}
```

---

#### Update Form
```
PATCH /api/forms/:id
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "deadline": "2025-12-25T23:59:59Z",
  "maxEntries": 150,
  "isActive": false,
  "category": "ANNOUNCEMENTS",
  "fields": [...]
}
```

---

#### Delete Form
```
DELETE /api/forms/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Form deleted successfully",
  "portalSynced": true
}
```

---

### Submissions

#### Get Form Submissions
```
GET /api/forms/:id/submissions
```

**Response:**
```json
{
  "success": true,
  "form": {
    "id": "clx1abc123...",
    "title": "Christmas Dinner Registration",
    "fields": [...]
  },
  "submissions": [
    {
      "id": "sub_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "memberId": 12345,
      "responses": {
        "field_1": "John Doe",
        "field_2": "john@example.com",
        "field_3": "4",
        "field_4": "Vegetarian"
      },
      "submittedAt": "2025-12-05T14:30:00.000Z"
    }
  ],
  "totalCount": 45
}
```

---

#### Delete Submission
```
DELETE /api/forms/:id/submissions?submissionId=sub_123
```

---

### Webhook (Receives from Portal)

#### Receive Submission
```
POST /api/forms/submissions/webhook
```

**Headers:**
```
X-API-Key: your-shared-secret-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "formId": "clx1abc123...",
  "submittedAt": "2025-12-05T14:30:00Z",
  "submitter": {
    "memberId": 12345,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "responses": {
    "field_1": "John Doe",
    "field_2": "john@example.com",
    "field_3": "4",
    "field_4": "Vegetarian"
  }
}
```

**Response:**
```json
{
  "success": true,
  "submissionId": "sub_123",
  "message": "Submission received successfully"
}
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 401 | Invalid API key |
| 400 | Form is inactive or deadline passed or max entries reached |
| 404 | Form not found |

---

## Portal API Endpoints (Required)

The TCN Portal needs to implement these endpoints:

### Receive Form from TCN_COMM

```
POST /api/signup-forms
```

**Headers:**
```
X-API-Key: your-shared-secret-key
X-Source: tcn-comm
Content-Type: application/json
```

**Request Body:**
```json
{
  "formId": "clx1abc123...",
  "title": "Christmas Dinner Registration",
  "description": "Sign up for the annual community dinner",
  "deadline": "2025-12-20T23:59:59Z",
  "maxEntries": 100,
  "isActive": true,
  "category": "PROGRAM_EVENTS",
  "createdBy": "Band Office",
  "fields": [
    {
      "fieldId": "field_1",
      "label": "Full Name",
      "fieldType": "TEXT",
      "required": true,
      "order": 0,
      "placeholder": "Enter your full name",
      "options": null
    },
    {
      "fieldId": "field_2",
      "label": "Dietary Restrictions",
      "fieldType": "SELECT",
      "required": false,
      "order": 1,
      "placeholder": null,
      "options": ["None", "Vegetarian", "Gluten-Free", "Other"]
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Form synced successfully",
  "portalFormId": "portal_internal_id"
}
```

---

### Update Form

```
PATCH /api/signup-forms/:formId
```

**Request Body:** (partial updates)
```json
{
  "isActive": false
}
```
or full form object for complete updates.

---

### Delete Form

```
DELETE /api/signup-forms/:formId
```

---

## Field Types

| Type | Description | Options Required |
|------|-------------|------------------|
| `TEXT` | Single line text input | No |
| `TEXTAREA` | Multi-line text input | No |
| `EMAIL` | Email input with validation | No |
| `PHONE` | Phone number input | No |
| `NUMBER` | Numeric input | No |
| `DATE` | Date picker | No |
| `SELECT` | Dropdown single select | Yes |
| `MULTISELECT` | Dropdown multi select | Yes |
| `CHECKBOX` | Boolean checkbox | No |

---

## Categories

Forms use the same categories as bulletins:

| Value | Display Name |
|-------|--------------|
| `CHIEFNCOUNCIL` | Chief & Council |
| `HEALTH` | Health |
| `EDUCATION` | Education |
| `RECREATION` | Recreation |
| `EMPLOYMENT` | Employment |
| `PROGRAM_EVENTS` | Programs & Events |
| `ANNOUNCEMENTS` | Announcements |

---

## Portal Database Schema (Suggested)

```sql
-- Store synced forms from TCN_COMM
CREATE TABLE signup_forms (
  id SERIAL PRIMARY KEY,
  tcn_form_id VARCHAR(255) UNIQUE NOT NULL,  -- ID from TCN_COMM
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  max_entries INTEGER,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50),
  created_by VARCHAR(100),                    -- Department name
  fields JSONB NOT NULL,                      -- Store field definitions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_signup_forms_tcn_id ON signup_forms(tcn_form_id);
CREATE INDEX idx_signup_forms_active ON signup_forms(is_active);
CREATE INDEX idx_signup_forms_category ON signup_forms(category);

-- Optional: Local submission storage before webhook
CREATE TABLE form_submissions_queue (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES signup_forms(id),
  member_id INTEGER REFERENCES members(id),
  responses JSONB NOT NULL,
  synced_to_tcn BOOLEAN DEFAULT false,
  sync_attempts INTEGER DEFAULT 0,
  last_sync_error TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security

### API Key Authentication

All requests between TCN_COMM and Portal must include:
```
X-API-Key: your-shared-secret-key
```

Generate a secure key:
```bash
openssl rand -hex 32
```

### Webhook Signature (Optional Enhancement)

For additional security, Portal can sign webhook payloads:
```
X-Webhook-Signature: sha256=<hmac_signature>
```

TCN_COMM can verify:
```typescript
const crypto = require('crypto')
const expectedSig = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex')
const isValid = signature === `sha256=${expectedSig}`
```

---

## Error Handling

### Portal → TCN_COMM Webhook Failures

If the webhook to TCN_COMM fails:
1. Store submission locally in `form_submissions_queue`
2. Retry with exponential backoff (1min, 5min, 15min, 1hr)
3. After 5 failures, mark as failed and alert admin

### TCN_COMM → Portal Sync Failures

If sync to Portal fails:
1. Form is still saved locally in TCN_COMM
2. Warning shown to user: "Form saved but portal sync failed"
3. Manual re-sync can be triggered later

---

## Testing

### Test Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/forms/submissions/webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "formId": "test_form_id",
    "submittedAt": "2025-12-05T14:30:00Z",
    "submitter": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "responses": {
      "field_1": "Test Value"
    }
  }'
```

### Health Check

```bash
curl http://localhost:3000/api/forms/submissions/webhook
# Returns: { "status": "ok", "endpoint": "...", "timestamp": "..." }
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-05 | 1.0.0 | Initial API specification |
