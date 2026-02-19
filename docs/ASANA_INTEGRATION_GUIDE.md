# Asana Integration Guide
**DK Living Tenant Portal**

---

## Overview

This guide walks you through integrating Asana for maintenance request tracking.

## Prerequisites

- ✅ Asana account created
- ✅ Asana workspace/project set up for maintenance
- ✅ Vercel deployment configured

---

## Step 1: Get Asana Personal Access Token

1. Go to https://app.asana.com
2. Click your profile photo → **My Settings**
3. Click **Apps** tab
4. Scroll to **Personal access tokens**
5. Click **Create new token**
6. Name it: "DK Living Portal"
7. Click **Create token**
8. **Copy the token immediately** (you won't see it again!)

---

## Step 2: Get Your Asana Project ID

### Method 1: From URL
1. Go to your Maintenance project in Asana
2. Look at the URL: `https://app.asana.com/0/PROJECT_ID/...`
3. Copy the PROJECT_ID (long number)

### Method 2: Via API
```bash
curl https://app.asana.com/api/1.0/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Look for your project name and copy its `gid`.

---

## Step 3: Add Environment Variables

### In Vercel:
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```bash
ASANA_ACCESS_TOKEN=your_personal_access_token
ASANA_PROJECT_ID=1234567890123456
ASANA_WORKSPACE_ID=1234567890123456  # (optional, if needed)
```

### Locally (`.env.local`):
```bash
ASANA_ACCESS_TOKEN=your_personal_access_token
ASANA_PROJECT_ID=1234567890123456
ASANA_WORKSPACE_ID=1234567890123456
```

---

## Step 4: Test Asana Integration

The maintenance request flow is already built.

### Files Involved:
- `app/api/maintenance/route.ts` - Creates maintenance request
- `lib/asana.ts` - Asana API helper functions
- `components/tenant/MaintenanceRequestForm.tsx` - Submit form

### Test the Flow:
1. Log in as a tenant
2. Go to **Maintenance**
3. Click **Submit Request**
4. Fill out form:
   - Category (e.g., "Plumbing")
   - Urgency (e.g., "Normal")
   - Description
   - Photos (optional)
5. Submit
6. **Check Asana** - New task should appear in your project

---

## Step 5: Configure Task Templates

### Set Up Custom Fields (Optional):
1. In Asana project → Click **Customize**
2. Add custom fields:
   - **Property** (dropdown: 830 Lasalle, 2061 Forbes, 2735 Riverside)
   - **Unit** (text field)
   - **Tenant** (text field)
   - **Urgency** (dropdown: Emergency, High, Normal, Low)
   - **Category** (dropdown: Plumbing, Electrical, HVAC, Appliance, Other)

The portal will automatically populate these fields when creating tasks.

---

## Step 6: Set Up Status Sync (Advanced)

To sync Asana task status back to the portal:

### Option A: Webhooks (Recommended)
1. Set up Asana webhook to notify your portal when tasks change
2. API endpoint: `/api/maintenance/asana-webhook`
3. Webhook events: `task` → `changed`

### Option B: Polling (Simple)
- Portal checks Asana every 15 minutes for task updates
- Updates maintenance request status in database

---

## Workflow

```
1. Tenant submits maintenance request in portal
   ↓
2. Portal creates task in Asana automatically
   - Task name: "[Property - Unit] Category - Description"
   - Description: Full details from form
   - Attachments: Photos from tenant
   - Custom fields: Property, Unit, Tenant, Urgency
   ↓
3. PM sees task in Asana
   - Assigns to contractor
   - Updates status
   ↓
4. Status syncs back to portal (via webhook or polling)
   ↓
5. Tenant sees status in portal
```

---

## Asana Task Format

**Task Name:**
```
[830 Lasalle - Unit 5] Plumbing - Leaky faucet in kitchen
```

**Description:**
```
Property: 830 Lasalle Street
Unit: 5
Tenant: John Smith
Category: Plumbing
Urgency: Normal

Description:
Kitchen faucet has been leaking for 2 days. Water pools under sink.

Submitted: February 19, 2026 at 9:30 AM
Request ID: abc123

Photos: 2 attached
```

---

## API Endpoints

### Create Task
```typescript
POST https://app.asana.com/api/1.0/tasks

{
  "data": {
    "projects": ["PROJECT_ID"],
    "name": "[Property - Unit] Category - Description",
    "notes": "Full description...",
    "custom_fields": {
      "property_id": "830 Lasalle",
      "unit_id": "5",
      "tenant_id": "John Smith",
      "urgency_id": "Normal"
    }
  }
}
```

### Update Task Status
```typescript
PUT https://app.asana.com/api/1.0/tasks/TASK_ID

{
  "data": {
    "completed": false,
    "custom_fields": {
      "status_id": "In Progress"
    }
  }
}
```

### Get Task Status
```typescript
GET https://app.asana.com/api/1.0/tasks/TASK_ID
```

---

## Troubleshooting

### Task Not Creating in Asana
- ✅ Check `ASANA_ACCESS_TOKEN` is set correctly
- ✅ Verify `ASANA_PROJECT_ID` is correct
- ✅ Ensure token has write permissions
- ✅ Check API rate limits (150 requests/minute)

### Photos Not Uploading
- ✅ Check file size limits (Asana max: 100MB)
- ✅ Verify attachment API call is working
- ✅ Check temporary file upload to Supabase Storage first

### Status Not Syncing Back
- ✅ Verify webhook is configured
- ✅ Check webhook secret matches
- ✅ Test polling endpoint manually

---

## Testing Checklist

- [ ] Can submit maintenance request
- [ ] Task appears in Asana
- [ ] Task has correct name format
- [ ] Custom fields populated
- [ ] Photos attach correctly
- [ ] Can update task status in Asana
- [ ] Status syncs back to portal
- [ ] Tenant can view status in portal

---

## Production Checklist

- [ ] Personal access token secured
- [ ] Webhook configured (if using)
- [ ] Test full workflow end-to-end
- [ ] Document process for PM team
- [ ] Set up notifications (Asana → PM)
- [ ] Create task templates in Asana
- [ ] Train team on workflow

---

## Best Practices

### Task Naming Convention
- Keep it consistent: `[Property - Unit] Category - Brief description`
- Include urgency in task priority
- Use tags for filtering (e.g., #plumbing, #urgent)

### Custom Fields
- Map to portal categories exactly
- Use dropdowns for consistency
- Add "Portal Sync" field to track auto-created tasks

### Notifications
- Set up rules in Asana for urgent requests
- Email/SMS alerts for emergency maintenance
- Daily digest for PM

---

## Support

- **Asana API Docs:** https://developers.asana.com
- **Asana Support:** https://asana.com/support
- **Rate Limits:** https://developers.asana.com/docs/rate-limits

---

**Last Updated:** February 19, 2026
