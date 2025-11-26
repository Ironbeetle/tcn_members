# Setup and Testing Guide

## 1. Environment Setup

Your `.env` file is already configured with:
- ✅ Database URL (PostgreSQL)
- ✅ NextAuth URL and Secret
- ✅ Resend API for emails

## 2. Database Setup

### Generate Prisma Client
```bash
npx prisma generate
```

### Run Migrations
```bash
npx prisma migrate dev --name init
```

### Import Test Data from CSV

You can import your CSV test data using Prisma's seed functionality or a custom script.

**Option 1: Using Prisma Seed**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parser'

const prisma = new PrismaClient()

async function main() {
  const members: any[] = []
  
  fs.createReadStream('path/to/your/members.csv')
    .pipe(csv())
    .on('data', (row) => {
      members.push({
        first_name: row.first_name,
        last_name: row.last_name,
        t_number: row.t_number,
        birthdate: new Date(row.birthdate),
        activated: 'NONE',
      })
    })
    .on('end', async () => {
      for (const member of members) {
        await prisma.fnmember.create({ data: member })
      }
      console.log(`Imported ${members.length} members`)
    })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

Then run:
```bash
npm install csv-parser
npx tsx prisma/seed.ts
```

**Option 2: Using pgAdmin or psql**

If your CSV is ready, you can directly import:
```sql
COPY fnmemberlist.fnmember(first_name, last_name, t_number, birthdate, activated)
FROM '/path/to/members.csv'
DELIMITER ','
CSV HEADER;
```

## 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 4. Testing the Authentication Flow

### Step 1: Member Registration (Account Activation)
1. Go to `/TCN_Enter`
2. Click "Activate Account" tab
3. Enter:
   - **Treaty Number**: Must exist in `fnmember` table (e.g., T12345)
   - **Username**: 3-20 chars, alphanumeric + underscore
   - **Email**: Valid email format
   - **Password**: 8+ chars with uppercase, lowercase, and number
4. Click "Activate Account"
5. On success, automatically logs in and redirects to `/TCN_Home`

### Step 2: Member Login
1. Go to `/TCN_Enter`
2. Click "Login" tab
3. Enter username and password
4. Click "Login"
5. Redirects to `/TCN_Home`

### Step 3: Protected Routes
- `/TCN_Home` - Member dashboard (should be protected)
- `/TCN_BulletinBoard` - Community bulletin board (should be protected)

## 5. Database Structure

Your database schema includes:

- **fnmember**: Core member data (already populated from CSV)
- **fnauth**: Authentication credentials (created during registration)
- **profile**: Extended member information
- **barcode**: Member barcode/card system
- **family**: Spouse and dependent information

## 6. Authentication Flow Diagram

```
User Visits Site
    ↓
Goes to /TCN_Enter
    ↓
Checks if Treaty Number exists in fnmember table
    ↓
Creates fnauth record (username, email, hashed password)
    ↓
Auto-login with new credentials
    ↓
Redirects to /TCN_Home (Protected Route)
    ↓
Can access member portal features
```

## 7. Testing Checklist

- [ ] Import member data from CSV
- [ ] Test registration with valid treaty number
- [ ] Test registration with invalid treaty number (should fail)
- [ ] Test login with correct credentials
- [ ] Test login with wrong password (locks after 5 attempts)
- [ ] Test accessing protected routes without login
- [ ] Test logout functionality
- [ ] Verify session persists on page refresh

## 8. Common Issues

### Database Connection Error
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify database name and schema exist

### Treaty Number Not Found
- Make sure your CSV data is imported
- Check the t_number format (should be like "T12345")
- Verify the schema name is "fnmemberlist"

### Session Not Persisting
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check browser console for errors

## 9. Next Steps

After basic authentication is working:

1. **Implement Protected Routes Middleware**
   - Add middleware.ts to protect routes
   - Redirect unauthenticated users to login

2. **Complete Profile Editing**
   - Allow members to update profile data
   - Add family information
   - Upload profile pictures

3. **Add Password Reset Flow**
   - Email reset links (Resend API already configured)
   - Token-based password reset

4. **Member Dashboard Features**
   - View announcements
   - Access department information
   - Download documents

## 10. API Endpoints Available

- `POST /api/register` - Create account
- `POST /api/auth/[...nextauth]` - Login/logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/member` - Get logged-in member data

## 11. Useful Commands

```bash
# View Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name your_migration_name

# Check database connection
npx prisma db pull
```

## Support

If you encounter issues:
1. Check terminal for error messages
2. Check browser console for frontend errors
3. Check database logs
4. Verify environment variables are set correctly
