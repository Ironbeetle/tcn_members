# Bulletin Image Not Displaying - Debug Reference

## Issue
Bulletin posts are syncing successfully to the portal, but images are returning **404 Not Found**.

## Error from Browser Console
```
GET https://tcnaux.ca/bulletinboard/cmjzk6a4u0003324eise1mh7p.jpg 404 (Not Found)
```

## How the Flow Works

### tcn_comm sends:
1. **POST `/api/sync/poster`** - Uploads the image file
   - Sends: `FormData` with `file`, `sourceId`, `filename`
   - Header: `x-api-key: <PORTAL_API_KEY>`
   - Expected response: `{ success: true, data: { poster_url: "/bulletinboard/xxx.jpg" } }`

2. **POST `/api/sync/bulletin`** - Syncs bulletin metadata
   - Sends: `{ sourceId, title, subject, poster_url, category, created }`
   - Header: `x-api-key: <PORTAL_API_KEY>`

### Portal should:
1. Receive the image at `/api/sync/poster`
2. Save it to a publicly accessible location (e.g., `/public/bulletinboard/`)
3. Return the relative path (e.g., `/bulletinboard/xxx.jpg`)
4. Nginx should serve files from `/bulletinboard/*` statically

---

## Debugging Commands (Run on VPS)

### 1. Check if the bulletinboard directory exists and has files
```bash
ls -la /var/www/tcn_portal/public/bulletinboard/
```

### 2. Find any uploaded jpg files
```bash
find /var/www/tcn_portal -name "*.jpg" -type f 2>/dev/null
```

### 3. Check file permissions
```bash
ls -la /var/www/tcn_portal/public/
```

### 4. Check PM2 logs for upload errors
```bash
pm2 logs tcn_portal --lines 100
```

### 5. Check nginx config for static file serving
```bash
cat /etc/nginx/sites-enabled/tcnaux.ca
```

---

## Likely Causes

### 1. File Not Being Saved
- The `/api/sync/poster` endpoint might not be writing the file to disk
- Check if the endpoint has proper file handling code
- Check if the target directory exists and is writable

### 2. Wrong Directory
- File might be saved to a different location than nginx serves
- Common locations: `public/`, `uploads/`, `static/`

### 3. Nginx Not Serving Static Files
- Need a location block like:
```nginx
location /bulletinboard/ {
    alias /var/www/tcn_portal/public/bulletinboard/;
    # or
    root /var/www/tcn_portal/public;
}
```

### 4. Directory Doesn't Exist
- The `/public/bulletinboard/` directory might need to be created
```bash
mkdir -p /var/www/tcn_portal/public/bulletinboard
chmod 755 /var/www/tcn_portal/public/bulletinboard
```

### 5. Next.js Not Serving from public/
- If using Next.js, files in `public/` should be served automatically
- But if running behind nginx, nginx might intercept requests first

---

## Portal API Endpoint Requirements

### POST /api/sync/poster
Should:
1. Receive multipart form data with `file` field
2. Validate API key from `x-api-key` header
3. Generate unique filename (or use sourceId)
4. Save file to `public/bulletinboard/` directory
5. Return: `{ success: true, data: { poster_url: "/bulletinboard/<filename>.jpg" } }`

Example implementation:
```typescript
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const sourceId = formData.get('sourceId') as string
  
  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'bulletinboard')
  await mkdir(uploadDir, { recursive: true })
  
  // Get file extension
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${sourceId}.${ext}`
  const filepath = path.join(uploadDir, filename)
  
  // Write file
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)
  
  return Response.json({
    success: true,
    data: { poster_url: `/bulletinboard/${filename}` }
  })
}
```

---

## Quick Fix Checklist

- [ ] Directory `/var/www/tcn_portal/public/bulletinboard/` exists
- [ ] Directory has write permissions for the app user
- [ ] Portal's `/api/sync/poster` endpoint actually saves files
- [ ] Nginx serves static files from the correct location
- [ ] File was actually uploaded (check PM2 logs)
