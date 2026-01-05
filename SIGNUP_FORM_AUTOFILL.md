# Sign-Up Form Auto-Fill Feature

## Overview

The TCN Members portal now automatically pre-fills contact information from the logged-in user's profile when they open a sign-up form. This improves the user experience by reducing manual data entry for common fields.

## How It Works

When a member opens a sign-up form modal, the system:

1. Fetches the member's profile data (name, email, phone, address, community)
2. Analyzes each form field's `fieldType`, `fieldId`, and `label`
3. Automatically populates matching fields with the user's data
4. Leaves non-matching fields empty for manual entry

## Auto-Fill Matching Rules

### By Field Type (Highest Priority)

| Field Type | Auto-Filled With |
|------------|------------------|
| `EMAIL` | User's email address |
| `PHONE` | User's phone number |

### By Field ID or Label (Case-Insensitive)

| Keywords in fieldId/label | Auto-Filled With |
|---------------------------|------------------|
| `email` | User's email address |
| `phone` | User's phone number |
| `address` | User's address |
| `community` | User's community |
| `fullname`, `full_name`, `full name`, or exactly `name` | Full name (first + last) |
| `firstname`, `first_name`, `first name` | First name only |
| `lastname`, `last_name`, `last name` | Last name only |

## Recommendations for Form Creators

To ensure optimal auto-fill behavior when creating sign-up forms:

### Use Appropriate Field Types

```json
{
  "fieldId": "contact_email",
  "fieldType": "EMAIL",      // ← Will auto-fill with user's email
  "label": "Contact Email"
}
```

```json
{
  "fieldId": "phone_number",
  "fieldType": "PHONE",      // ← Will auto-fill with user's phone
  "label": "Phone Number"
}
```

### Use Recognizable Field IDs

For TEXT fields, use descriptive fieldIds that include keywords:

| Desired Auto-Fill | Recommended fieldId Examples |
|-------------------|------------------------------|
| Email | `email`, `contact_email`, `member_email` |
| Phone | `phone`, `phone_number`, `contact_phone` |
| Address | `address`, `mailing_address`, `home_address` |
| Community | `community`, `member_community` |
| Full Name | `fullname`, `full_name`, `name` |
| First Name | `firstname`, `first_name` |
| Last Name | `lastname`, `last_name` |

### Example Form Field Configuration

```json
{
  "fields": [
    {
      "fieldId": "full_name",
      "fieldType": "TEXT",
      "label": "Full Name",
      "required": true,
      "order": 1
    },
    {
      "fieldId": "email",
      "fieldType": "EMAIL",
      "label": "Email Address",
      "required": true,
      "order": 2
    },
    {
      "fieldId": "phone",
      "fieldType": "PHONE",
      "label": "Phone Number",
      "required": true,
      "order": 3
    },
    {
      "fieldId": "community",
      "fieldType": "TEXT",
      "label": "Community",
      "required": false,
      "order": 4
    },
    {
      "fieldId": "dietary_restrictions",
      "fieldType": "TEXT",
      "label": "Dietary Restrictions",
      "required": false,
      "order": 5
    }
  ]
}
```

In this example:
- `full_name`, `email`, `phone`, and `community` will be auto-filled
- `dietary_restrictions` will remain empty (no matching keywords)

## Fields That Will NOT Auto-Fill

Any field that doesn't match the criteria above will remain empty. This includes:
- Custom/program-specific fields (e.g., "T-shirt Size", "Dietary Restrictions")
- Date fields (except if specifically matched)
- Select/checkbox fields
- Fields with non-standard naming

## User Experience

- Pre-filled fields are **editable** - users can modify them if needed
- Auto-fill happens **when the modal opens**, not on page load
- If the user doesn't have profile data, fields remain empty
- Form validation still applies to all fields (required fields must be filled)

## Technical Details

The auto-fill logic is implemented in `/src/app/TCN_Forms/page.tsx`:

- Member data is fetched using `getFnmemberById()` 
- Contact info is extracted from the member's `profile` array
- The `getAutoFillValue()` function handles field matching
- `setValue()` from react-hook-form populates the fields

## Questions?

Contact the TCN Members portal development team for any questions about form field configuration or auto-fill behavior.
