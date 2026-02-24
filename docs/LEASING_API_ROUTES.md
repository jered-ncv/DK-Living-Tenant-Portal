# Leasing Automation API Routes
**Purpose:** Migrate Make.com scenarios to Next.js API routes  
**Status:** Planning phase (ready for implementation)  
**Database:** Migration 002 (002_leasing_automation.sql)

---

## 📋 Overview

### Current: Make.com Flow
```
Google Calendar → Make Scenario 1 → igloohome API → Twilio SMS → Airtable
                   Make Scenario 2 → Airtable check → Twilio SMS
                   Make Scenario 3 (cron) → Airtable → Twilio SMS
```

### Target: Portal Flow
```
Portal Scheduler UI → Next.js API → Supabase → igloohome/Twilio APIs
Vercel Cron → Next.js API → Supabase → Twilio
```

**Key Benefits:**
- Single source of truth (Supabase instead of Airtable)
- Native TypeScript integration
- Better error handling & logging
- No Make.com dependency
- Unified authentication
- Cost reduction ($39/mo Make.com → $0 Vercel cron)

---

## 🛠️ API Routes to Build

### 1. Lead Management

#### `POST /api/leasing/leads`
**Purpose:** Create new lead from inquiry (Zillow, email, walk-in)  
**Replaces:** Make.com Zillow email parser → Airtable  
**Auth:** Public (webhook) or API key

**Request:**
```json
{
  "source": "zillow",
  "prospect_name": "John Doe",
  "prospect_email": "john@example.com",
  "prospect_phone": "+19045551234",
  "property_address": "2061 Forbes St",
  "desired_move_in": "2026-03-15",
  "prospect_notes": "Looking for 2BR, has a cat"
}
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "stage": "new_inquiry",
  "auto_response_sent": true,
  "created_at": "2026-02-24T05:00:00Z"
}
```

**Logic:**
1. Validate input
2. Insert into `leasing_leads` table
3. Log activity to `leasing_activity_log`
4. Send auto-response SMS if phone provided
5. Return lead ID

---

#### `GET /api/leasing/leads`
**Purpose:** List all leads with filters  
**Auth:** Authenticated (PM/Admin/Owner)

**Query Params:**
- `stage`: Filter by stage (e.g., `?stage=showing_scheduled`)
- `property`: Filter by property address
- `dateFrom`, `dateTo`: Date range filter
- `search`: Full-text search (name, email, phone)

**Response:**
```json
{
  "leads": [
    {
      "id": "uuid",
      "prospect_name": "John Doe",
      "property_address": "2061 Forbes St",
      "stage": "showing_scheduled",
      "inquiry_date": "2026-02-20T10:00:00Z",
      "next_follow_up_at": "2026-02-25T09:00:00Z",
      "follow_up_count": 2
    }
  ],
  "total": 42,
  "page": 1
}
```

---

#### `PATCH /api/leasing/leads/[id]`
**Purpose:** Update lead details or stage  
**Auth:** Authenticated (PM/Admin/Owner)

**Request:**
```json
{
  "stage": "application_received",
  "prospect_notes": "Application looks good, moving to approval",
  "next_follow_up_at": "2026-02-26T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "lead": { /* updated lead */ },
  "activity_logged": true
}
```

---

### 2. Showing Management

#### `POST /api/leasing/showings`
**Purpose:** Schedule a showing + generate smart lock PIN  
**Replaces:** Google Calendar → Make Scenario 1 → igloohome → Twilio  
**Auth:** Authenticated or public webhook

**Request:**
```json
{
  "lead_id": "uuid",
  "property_address": "2061 Forbes St",
  "showing_date": "2026-02-25",
  "showing_time": "14:00:00",
  "duration_minutes": 60
}
```

**Response:**
```json
{
  "success": true,
  "showing_id": "uuid",
  "access_pin": "123456",
  "pin_valid_from": "2026-02-25T14:00:00Z",
  "pin_valid_until": "2026-02-25T16:00:00Z",
  "confirmation_sent": true,
  "sms_sid": "SMxxxxxxxx"
}
```

**Logic:**
1. Validate showing time availability
2. Map property address to igloohome device ID:
   ```typescript
   const DEVICE_MAP = {
     'Forbes': 'IGK345396796',
     'Lasalle': 'IGK345f18e62',
     'Riverside': 'IGK345802874'
   };
   ```
3. Call igloohome API to generate PIN:
   ```typescript
   POST https://api.igloodeveloper.co/igloohome/devices/{deviceId}/algopin/onetime
   {
     "startDate": "2026-02-25T14:00:00Z",
     "variance": 2,  // hours active
     "accessName": "Showing - John Doe"
   }
   ```
4. Insert showing into `leasing_showings` table
5. Send confirmation SMS via Twilio:
   ```typescript
   await twilioClient.messages.create({
     body: `Hi ${name}, your showing at ${property} is scheduled for ${date} at ${time}. Access code: ${pin}. Valid for 2 hours.`,
     from: '+19042040347',
     to: prospect_phone
   });
   ```
6. Update lead stage to `showing_scheduled`
7. Log activity
8. Schedule follow-up (Day 0) for after showing

---

#### `GET /api/leasing/showings`
**Purpose:** List showings with filters  
**Auth:** Authenticated

**Query Params:**
- `date`: Filter by date (default: today)
- `status`: Filter by status
- `property`: Filter by property

**Response:**
```json
{
  "showings": [
    {
      "id": "uuid",
      "prospect_name": "John Doe",
      "property_address": "2061 Forbes St",
      "showing_date": "2026-02-25",
      "showing_time": "14:00:00",
      "status": "scheduled",
      "access_pin": "123456",
      "confirmation_sent": true
    }
  ]
}
```

---

#### `PATCH /api/leasing/showings/[id]/status`
**Purpose:** Update showing status (showed/no-show)  
**Replaces:** Make Scenario 2 (manual VA update in Airtable)  
**Auth:** Authenticated

**Request:**
```json
{
  "status": "showed",  // or "no_show"
  "notes": "Prospect loved the unit, very interested"
}
```

**Response:**
```json
{
  "success": true,
  "showing": { /* updated */ },
  "followup_scheduled": true,
  "followup_type": "day_0"
}
```

**Logic:**
1. Update showing status
2. Update lead stage based on showing outcome:
   - `showed` → lead stage = `showed`
   - `no_show` → lead stage = `no_show`
3. Schedule appropriate follow-up:
   - `showed` → Day 0 follow-up (immediately)
   - `no_show` → No-show follow-up
4. Log activity

---

### 3. Follow-up Automation

#### `POST /api/cron/leasing-followups`
**Purpose:** Send scheduled follow-up messages  
**Replaces:** Make Scenario 2 (every 15 min) + Scenario 3 (daily 9am)  
**Auth:** Cron secret or API key  
**Vercel Cron:** `0 9 * * *` (9 AM daily) + `*/15 * * * *` (every 15 min)

**Logic:**
```typescript
1. Query `pending_followups_view` for leads needing follow-up
2. For each lead:
   a. Determine followup type (day_0, day_1, day_2, no_show)
   b. Get message template
   c. Personalize message with lead data
   d. Send SMS via Twilio
   e. Insert into `leasing_followups` table
   f. Update `leasing_leads.last_contact_at` and `next_follow_up_at`
   g. Log activity
3. Return summary
```

**Message Templates:**
```typescript
const TEMPLATES = {
  day_0: `Hi {{name}}, thanks for viewing {{property}} today! Do you have any questions? Reply YES to schedule an application call, or NO if you'd like to keep exploring. - DK Living`,
  
  day_1: `Hi {{name}}, just following up on your showing at {{property}} yesterday. Still interested? We'd love to help you move forward! Reply with any questions. - DK Living`,
  
  day_2: `Hi {{name}}, last check-in about {{property}}. We have other prospects interested, so if you'd like to apply, now's the time! Let us know. - DK Living`,
  
  no_show: `Hi {{name}}, we noticed you missed your showing at {{property}}. No problem! Want to reschedule? Just reply with a preferred day/time. - DK Living`
};
```

**Response:**
```json
{
  "success": true,
  "followups_sent": 5,
  "failures": 0,
  "details": [
    {
      "lead_id": "uuid",
      "prospect_name": "John Doe",
      "followup_type": "day_1",
      "sms_sid": "SMxxxxxxxx",
      "status": "sent"
    }
  ]
}
```

---

#### `GET /api/leasing/followups`
**Purpose:** View follow-up history for a lead  
**Auth:** Authenticated

**Query Params:**
- `lead_id`: Required

**Response:**
```json
{
  "followups": [
    {
      "id": "uuid",
      "followup_type": "day_0",
      "message_content": "Hi John, thanks for viewing...",
      "sent_at": "2026-02-25T16:00:00Z",
      "sms_status": "delivered",
      "prospect_replied": false
    }
  ]
}
```

---

### 4. Pipeline Dashboard

#### `GET /api/leasing/pipeline`
**Purpose:** Dashboard metrics and stage counts  
**Auth:** Authenticated

**Response:**
```json
{
  "pipeline": [
    {
      "stage": "new_inquiry",
      "lead_count": 12,
      "new_this_week": 5,
      "new_this_month": 12,
      "avg_days_in_stage": 1.5,
      "conversions": 0
    },
    {
      "stage": "showing_scheduled",
      "lead_count": 8,
      "new_this_week": 3,
      "new_this_month": 8,
      "avg_days_in_stage": 2.1,
      "conversions": 0
    }
  ],
  "total_leads": 42,
  "conversion_rate": 15.2,
  "avg_time_to_conversion_days": 14
}
```

---

### 5. Integration Webhooks

#### `POST /api/webhooks/zillow-inquiry`
**Purpose:** Receive Zillow inquiry emails (via Zapier/n8n)  
**Auth:** Webhook secret

**Request (from email parser):**
```json
{
  "from": "john@example.com",
  "subject": "Inquiry about 2061 Forbes St",
  "body": "Hi, I'm interested in viewing the property...",
  "parsed": {
    "name": "John Doe",
    "phone": "+19045551234",
    "property": "2061 Forbes St"
  }
}
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "auto_response_sent": true
}
```

---

#### `POST /api/webhooks/twilio-sms`
**Purpose:** Handle incoming SMS replies  
**Auth:** Twilio signature verification

**Request (from Twilio):**
```json
{
  "From": "+19045551234",
  "To": "+19042040347",
  "Body": "YES, I'd like to apply"
}
```

**Response (TwiML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Great! I'll have our team reach out shortly to send the application link. - DK Living</Message>
</Response>
```

**Logic:**
1. Find lead by phone number
2. Parse reply for intent (YES/NO/question)
3. Update lead stage if applicable
4. Log activity
5. Send appropriate response
6. Optionally notify PM via Slack

---

## 🔌 External API Integration

### igloohome API

**Authentication:**
```typescript
const getIglooAccessToken = async () => {
  const response = await fetch('https://auth.igloohome.co/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.IGLOOHOME_CLIENT_ID,
      client_secret: process.env.IGLOOHOME_CLIENT_SECRET
    })
  });
  const data = await response.json();
  return data.access_token;
};
```

**Generate PIN:**
```typescript
const generatePIN = async (deviceId: string, startDate: string) => {
  const token = await getIglooAccessToken();
  const response = await fetch(
    `https://api.igloodeveloper.co/igloohome/devices/${deviceId}/algopin/onetime`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,  // "2026-02-25T14:00:00+00:00"
        variance: 2,  // Hours active
        accessName: 'Showing Access'
      })
    }
  );
  const data = await response.json();
  return {
    pin: data.pin,
    pinId: data.id,
    validFrom: data.startDate,
    validUntil: data.endDate
  };
};
```

---

### Twilio API

**Send SMS:**
```typescript
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to: string, body: string) => {
  const message = await twilioClient.messages.create({
    body,
    from: '+19042040347',  // DK Living number
    to
  });
  return {
    sid: message.sid,
    status: message.status,
    error: message.errorMessage
  };
};
```

---

## 🔒 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # For cron jobs

# igloohome
IGLOOHOME_CLIENT_ID=ikhgwc5hswz0pfwywqybfkla54
IGLOOHOME_CLIENT_SECRET=xxxxx  # REGENERATE DAILY

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+19042040347

# API Keys
LEASING_WEBHOOK_SECRET=xxxxx  # For Zillow webhook
CRON_SECRET=xxxxx  # For Vercel cron auth

# Optional
SLACK_WEBHOOK_URL=xxxxx  # For PM notifications
```

---

## 📦 Implementation Checklist

### Phase 1: Core Infrastructure (1-2 hours)
- [ ] Run migration `002_leasing_automation.sql` in Supabase
- [ ] Set up environment variables in Vercel
- [ ] Create API route structure (`app/api/leasing/`)
- [ ] Build Supabase client utilities

### Phase 2: Lead Management (2-3 hours)
- [ ] `POST /api/leasing/leads` (create lead)
- [ ] `GET /api/leasing/leads` (list leads)
- [ ] `PATCH /api/leasing/leads/[id]` (update lead)
- [ ] Test with Postman/curl

### Phase 3: Showing Management (3-4 hours)
- [ ] `POST /api/leasing/showings` (schedule + PIN + SMS)
- [ ] `GET /api/leasing/showings` (list showings)
- [ ] `PATCH /api/leasing/showings/[id]/status` (update status)
- [ ] Integrate igloohome API
- [ ] Integrate Twilio SMS
- [ ] Test end-to-end booking flow

### Phase 4: Follow-up Automation (2-3 hours)
- [ ] `POST /api/cron/leasing-followups` (cron job)
- [ ] Configure Vercel cron (9 AM daily + every 15 min)
- [ ] Build message templates
- [ ] Test follow-up logic
- [ ] Monitor logs for 24 hours

### Phase 5: Dashboard & UI (3-4 hours)
- [ ] `GET /api/leasing/pipeline` (metrics)
- [ ] Build Leasing Dashboard component
- [ ] Build Showing Scheduler UI
- [ ] Build Lead Detail page
- [ ] Mobile responsive testing

### Phase 6: Migration from Make.com (1-2 hours)
- [ ] Pause Make.com Scenarios 1, 2, 3
- [ ] Point calendar booking to portal scheduler
- [ ] Verify all flows working in portal
- [ ] Monitor for 48 hours
- [ ] Delete Make.com scenarios (or keep as backup)

---

## 🧪 Testing Plan

### Unit Tests
- Lead creation & validation
- PIN generation logic
- Message template rendering
- Date/time calculations

### Integration Tests
- Full booking flow (schedule → PIN → SMS)
- Follow-up cron job execution
- Webhook handling

### End-to-End Tests
1. New inquiry via webhook → auto-response sent
2. Schedule showing → PIN generated → SMS confirmation
3. Update showing status → follow-up scheduled
4. Cron runs → follow-up SMS sent
5. Lead converts → lease created

---

## 📊 Success Metrics

**Technical:**
- 100% uptime for API routes
- <2s response time for showing creation
- <5min latency for follow-up cron
- 0 SMS delivery failures

**Business:**
- Showing → Application conversion rate >25%
- Avg response time to inquiry <1 hour
- Lead-to-lease time <14 days

---

## 🚀 Deployment

### Vercel Configuration

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/leasing-followups",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Database Setup
1. Run migration in Supabase SQL Editor
2. Verify tables created
3. Test views with sample data
4. Confirm RLS policies active

---

## 📚 Related Documentation

- `002_leasing_automation.sql` - Database schema
- `DAILY_STANDUP_FEB24.md` - Current Make.com setup
- `AUTOMATION_ROADMAP.md` - Future automation opportunities
- `/docs/EDGE_FUNCTION_DEPLOYMENT.md` - Cron setup guide

---

**Status:** Ready for implementation  
**Estimated Build Time:** 12-16 hours (with testing)  
**Dependencies:** Supabase, Twilio, igloohome APIs  
**Owner:** Jered / Claude

---

*Let's migrate from Make.com! 🚀*
