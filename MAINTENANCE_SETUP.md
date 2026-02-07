# Maintenance Request Feature - Setup Guide

## Overview

The maintenance request feature allows tenants to:
- Submit maintenance requests with photos
- Track request status (submitted → assigned → in_progress → completed → closed)
- Filter requests by status (all / open / closed)
- View photo attachments
- See Asana task links (if integration is enabled)

Requests automatically create tasks in Asana with full context (property, unit, tenant details).

---

## Required Setup

### 1. Supabase Storage Bucket

Create a storage bucket for maintenance photos:

1. Go to your Supabase project → **Storage**
2. Click **"New bucket"**
3. Name: `maintenance-photos`
4. **Public bucket:** Yes (photos need public URLs)
5. Click **"Create bucket"**

**Configure bucket policies:**

Go to the bucket → Policies → Add these:

**SELECT (read) policy:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'maintenance-photos');
```

**INSERT (upload) policy:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'maintenance-photos' 
  AND auth.role() = 'authenticated'
);
```

**DELETE policy (for cleanup):**
```sql
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'maintenance-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Asana Integration (Required)

The feature is designed to work with Asana. You'll need:

#### A. Personal Access Token (PAT)

1. Go to [Asana Developer Console](https://app.asana.com/0/my-apps)
2. Click **"+ Create new token"**
3. Give it a name (e.g., "DK Living Tenant Portal")
4. Copy the token (you won't see it again!)
5. Add to `.env.local`:
   ```
   ASANA_ACCESS_TOKEN=your_token_here
   ```

#### B. Workspace ID

**Option 1: Via API**
```bash
curl https://app.asana.com/api/1.0/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 2: Via URL**
- Go to any Asana project in your workspace
- Look at the URL: `https://app.asana.com/0/WORKSPACE_ID/PROJECT_ID`
- Copy the first long number (workspace ID)

Add to `.env.local`:
```
ASANA_WORKSPACE_ID=your_workspace_id
```

#### C. Project ID

1. Create a project in Asana (e.g., "Maintenance Requests")
2. **Get the project ID:**
   - Go to the project
   - Look at the URL: `https://app.asana.com/0/WORKSPACE_ID/PROJECT_ID`
   - Copy the second long number (project ID)

Add to `.env.local`:
```
ASANA_PROJECT_ID=your_project_id
```

### 3. Environment Variables

Your `.env.local` should include:

```bash
# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Asana Integration (new)
ASANA_ACCESS_TOKEN=your_personal_access_token
ASANA_WORKSPACE_ID=your_workspace_id
ASANA_PROJECT_ID=your_maintenance_project_id
```

---

## How It Works

### Tenant Workflow

1. **Submit Request** (`/maintenance/new`)
   - Select category (HVAC, plumbing, electrical, etc.)
   - Enter title and description
   - Choose urgency level (low/medium/high/emergency)
   - Optionally upload up to 5 photos
   - Click "Submit Request"

2. **View Requests** (`/maintenance`)
   - See all submitted requests
   - Filter by status (all/open/closed)
   - View photos inline
   - Click "View in Asana" to see task (if Asana is linked)

### Backend Process

When a request is submitted:

1. **Database record created** (`maintenance_requests` table)
   - Includes all form data
   - Status set to "submitted"
   
2. **Photos uploaded** (if any)
   - Stored in Supabase Storage (`maintenance-photos` bucket)
   - Records created in `maintenance_photos` table with public URLs

3. **Asana task created** (if configured)
   - Task name: `[URGENCY] Title`
   - Task description includes:
     - Property name & address
     - Unit number
     - Tenant name, email, phone
     - Category & urgency
     - Full issue description
     - Portal request ID (for reference)
   - Task added to configured project
   - Task URL saved back to database

---

## Asana Task Format

Example task created:

**Name:**
```
[HIGH] Kitchen sink leaking under cabinet
```

**Description:**
```
**Property:** Riverside Apartments
**Address:** 123 Main St, Jacksonville, FL 32202
**Unit:** 204B
**Tenant:** John Smith
**Email:** john.smith@email.com
**Phone:** (904) 555-1234

**Category:** plumbing
**Urgency:** HIGH

**Issue Description:**
Water is dripping from the pipe connection under the kitchen sink. 
The leak started yesterday and is getting worse. I've placed a 
bucket underneath but it fills up every few hours.

**Portal Request ID:** abc123-def456-ghi789
```

---

## Status Flow

Requests move through these statuses:

1. **submitted** - Initial state when tenant creates request
2. **assigned** - Task assigned to a maintenance person (manual in Asana)
3. **in_progress** - Work has started (manual in Asana)
4. **completed** - Work finished (manual in Asana)
5. **closed** - Request fully closed (manual in Asana)

**Note:** Status updates currently happen manually in Asana. Future enhancement will add webhook sync to automatically update portal when Asana task status changes.

---

## Webhook Integration (Future)

To enable automatic status sync from Asana → Portal:

1. **Create webhook endpoint** (already exists at `/api/maintenance/asana-webhook`)
2. **Register webhook in Asana:**
   ```bash
   curl -X POST https://app.asana.com/api/1.0/webhooks \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "resource": "PROJECT_ID",
       "target": "https://your-domain.com/api/maintenance/asana-webhook"
     }'
   ```
3. **Handle webhook events** in the API route (parse status changes and update database)

---

## Testing

### Test Maintenance Request Submission

1. **Log in as a tenant** with an active unit
2. **Navigate to** `/maintenance/new`
3. **Fill out form:**
   - Category: Plumbing
   - Title: "Test kitchen faucet leak"
   - Description: "Water dripping slowly from base of faucet"
   - Urgency: Medium
   - Upload 1-2 test photos
4. **Submit**
5. **Verify:**
   - ✅ Redirected to `/maintenance` with success message
   - ✅ Request appears in list with correct details
   - ✅ Photos display and link to full size
   - ✅ Status shows "submitted"
   - ✅ Asana task created in your project
   - ✅ Asana link clickable and goes to task

### Test Filters

1. Go to `/maintenance`
2. Click **"Open"** - should show requests with status: submitted/assigned/in_progress
3. Click **"Closed"** - should show requests with status: completed/closed
4. Click **"All"** - should show everything

---

## Troubleshooting

### Photos not uploading

**Check:**
1. Storage bucket exists and is named `maintenance-photos`
2. Bucket is public
3. Bucket policies allow authenticated uploads
4. File size < 10MB
5. File type is JPEG or PNG

**Debug:**
- Check browser console for errors
- Check Supabase Storage logs

### Asana tasks not creating

**Check:**
1. `ASANA_ACCESS_TOKEN` is set correctly
2. `ASANA_WORKSPACE_ID` is correct
3. `ASANA_PROJECT_ID` is correct
4. Token has write permissions to the project

**Debug:**
- Check server logs (Vercel logs or local terminal)
- Test token manually:
  ```bash
  curl https://app.asana.com/api/1.0/users/me \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

### Request creates but no photos

**Likely cause:** Storage bucket policy issue or upload failed silently

**Fix:**
1. Check browser Network tab for failed uploads
2. Verify storage policies
3. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

---

## File Reference

### New Pages
- `app/maintenance/page.tsx` - List all requests with filters
- `app/maintenance/new/page.tsx` - Submit new request form

### New Components
- `components/maintenance/MaintenanceRequestForm.tsx` - Client-side form with photo upload

### New API Routes
- `app/api/maintenance/create/route.ts` - Create request + Asana task
- `app/api/maintenance/upload-photo/route.ts` - Upload photos to Supabase Storage

### Database Tables (already exist)
- `maintenance_requests` - Request records
- `maintenance_photos` - Photo records with URLs

---

## Next Steps

After basic setup:

1. **Configure Asana sections** for routing by category
2. **Set up webhook sync** for status updates
3. **Add email notifications** for tenant updates
4. **Create PM portal views** to manage requests
5. **Add maintenance history** to unit details
6. **Track response time metrics**

---

## Support

For questions or issues:
- Check Supabase logs (Database → Logs)
- Check Vercel deployment logs
- Test Asana API calls manually
- Review browser console for client-side errors
