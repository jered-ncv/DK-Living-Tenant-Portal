# DK Living - Automation Roadmap
**Full Leasing-to-Move-In Workflow**

---

## 🎯 Current State vs. Future State

### What's Automated NOW ✅
- ✅ Booking confirmation → Smart lock PIN → SMS
- ✅ Post-showing follow-up (Day 0)
- ✅ Daily follow-up sequence (Day 1, Day 2)
- ✅ Renewal alerts (in portal)
- ✅ Lease action logging (in portal)

### What's Manual TODAY ⚠️
- ⚠️ Zillow inquiry → Email → Manual entry to Airtable
- ⚠️ Manual sending of Google Calendar booking link
- ⚠️ VA manually updates showed/no-show status
- ⚠️ Application sending is manual
- ⚠️ Screening is manual (Buildium)
- ⚠️ Lease generation is manual (Buildium)
- ⚠️ Move-in coordination is manual

---

## 🚀 NEW AUTOMATION: Zillow Email → Auto-Booking

### Scenario 4 - Lead Capture & Auto-Response
**Status:** 🎨 Design Ready, Not Built

**Trigger:** Gmail/Email watches inbox for Zillow inquiry emails

**Flow:**
1. **Email Parser (Make.com)**
   - Watches `leasing@dkliving.co` for Zillow inquiry emails
   - Extracts: Name, Phone, Email, Property, Message
   - Pattern recognition: "Zillow" in subject/body

2. **Create Lead in Airtable**
   - Auto-creates lead record
   - Status: "New Lead"
   - Source: "Zillow"
   - Zillow Inquiry Date: Today

3. **AI Message Classification (OpenAI)**
   - Analyzes prospect message for urgency/intent
   - Scores lead quality (Hot/Warm/Cold)
   - Extracts move-in timeline if mentioned

4. **Router: Hot vs. Warm**
   - **If HOT** (urgent, ready to see today/tomorrow):
     - Send immediate SMS via Twilio
     - Include booking link in SMS
   - **If WARM** (interested but not urgent):
     - Send email via Gmail API
     - Professional response with booking link

5. **Update Airtable**
   - Status: "Showing Scheduled" (if they book)
   - OR "Awaiting Response" (if they don't book within 2 hours)

**Booking Link Format:**
```
"Hi {Name}! Thanks for your interest in {Property}. 
Book your showing here: https://calendar.google.com/...
Available times: Next 7 days, 10am-5pm daily.
-DK Living Team"
```

**Benefits:**
- ⚡ Response time: < 2 minutes (vs. hours)
- 🎯 Zero manual data entry
- 📊 Lead quality scoring
- 🔄 Seamless handoff to existing automation

---

## 📋 FULL LEASING FUNNEL AUTOMATION

### Phase 1: Lead Capture (NEW)
```
Zillow Inquiry Email
  ↓
Make Scenario 4: Email Parser
  ↓
Airtable: Create Lead
  ↓
AI: Classify & Score
  ↓
Twilio/Email: Send Booking Link
  ↓
[Wait for booking...]
```

### Phase 2: Showing (LIVE ✅)
```
Google Calendar: Booking Confirmed
  ↓
Make Scenario 1: Generate PIN
  ↓
Twilio: Send SMS with Access Code
  ↓
[Showing happens...]
  ↓
Make Scenario 2: Post-Showing Follow-Up
```

### Phase 3: Application (CAN AUTOMATE)
```
Prospect: "I want to apply!"
  ↓
Make Scenario 5: Application Sender
  ↓
Email: Send application link
  ↓
Airtable: Status = "Application Sent"
  ↓
[Wait for submission...]
  ↓
Webhook: Application Received
  ↓
Airtable: Status = "Application Received"
  ↓
Trigger: Screening Workflow
```

### Phase 4: Screening (CAN AUTOMATE)
```
Application Received
  ↓
API: Submit to TransUnion SmartMove
  ↓
[Credit + Background check runs...]
  ↓
Webhook: Results Ready
  ↓
AI: Analyze screening results
  ↓
Router: Green/Yellow/Red
  ↓
  • Green → Auto-approve (if criteria met)
  • Yellow → Manual review + notify PM
  • Red → Auto-decline + notify PM
  ↓
Airtable: Update Screening Result
  ↓
Email: Notify prospect of decision
```

### Phase 5: Lease Signing (CAN AUTOMATE)
```
Approved Application
  ↓
Portal: Generate Lease Document
  ↓
DocuSign API: Send for signature
  ↓
[Tenant signs...]
  ↓
Webhook: Lease Fully Executed
  ↓
Airtable: Status = "Lease Signed"
  ↓
Create Lease in Portal Supabase
  ↓
Trigger: Move-In Workflow
```

### Phase 6: Move-In Coordination (CAN AUTOMATE)
```
Lease Signed (Move-in date = 7 days out)
  ↓
Email Sequence (Automated):
  • Day -7: Welcome + Move-in checklist
  • Day -3: Utility setup reminders
  • Day -1: Final instructions + contact info
  ↓
Day 0: Move-In Day
  ↓
igloohome API: Generate permanent access code
  ↓
SMS: Send permanent code + instructions
  ↓
Portal: Tenant account activated
  ↓
Email: Portal login credentials
```

---

## 🎨 Detailed Design: Scenario 4 - Zillow Lead Capture

### Make.com Modules

**Module 1 - Gmail Watch**
```
Service: Gmail
Trigger: Watch emails
Folder: Inbox
Filter: from:@zillow.com OR subject contains "Zillow"
```

**Module 2 - Parse Email**
```
Tool: Text Parser
Patterns:
  Name: /I'm interested.*?Name:\s*([^\n]+)/
  Phone: /(\d{3}[-.\s]??\d{3}[-.\s]??\d{4})/
  Email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  Property: /Property:\s*([^\n]+)/
  Message: Extract full body text
```

**Module 3 - OpenAI Analysis**
```
Service: OpenAI (GPT-4)
Prompt: 
"Analyze this rental inquiry and return JSON:
{
  'urgency': 'hot' | 'warm' | 'cold',
  'move_in_timeline': 'immediate' | '1-2 weeks' | '1 month' | 'flexible',
  'lead_quality_score': 1-10,
  'key_concerns': [array of concerns mentioned],
  'response_tone': 'urgent' | 'professional' | 'casual'
}

Inquiry:
{{2.message}}"
```

**Module 4 - Airtable Create**
```
Base: DK Living Leasing Pipeline
Table: Leads
Fields:
  Lead Name: {{2.name}}
  Phone: {{2.phone}}
  Email: {{2.email}}
  Property: {{2.property}}
  Source: Zillow
  Status: New Lead
  Zillow Inquiry Date: {{now}}
  Lead Quality Score: {{3.lead_quality_score}}
  Move-In Timeline: {{3.move_in_timeline}}
  Notes: {{3.key_concerns}}
```

**Module 5 - Router**
```
Routes:
  Route 1: {{3.urgency}} = "hot"
  Route 2: {{3.urgency}} = "warm"
  Route 3: {{3.urgency}} = "cold"
```

**Module 6A - Twilio SMS (Hot Leads)**
```
To: {{2.phone}}
From: 904-204-0347
Message:
"Hi {{2.name}}! 👋 Thanks for your interest in {{2.property}}!

We have showings available TODAY. Book your time here:
{{calendar_link_for_property}}

Quick response = first choice of move-in dates!
-DK Living Team"
```

**Module 6B - Gmail Send (Warm Leads)**
```
To: {{2.email}}
Subject: Re: {{1.subject}}
Body:
"Hi {{2.name}},

Thank you for your interest in {{2.property}}! We'd love to show you the property.

📅 Schedule Your Showing:
{{calendar_link_for_property}}

Available times: Next 7 days, 10am-5pm daily.

Questions? Reply to this email or text us at (904) 204-0347.

Best regards,
DK Living Team"
```

**Module 7 - Set Follow-Up Reminder**
```
Tool: Delay
Wait: 2 hours
Then:
  Check if lead booked showing (via Airtable)
  If NO booking:
    Send follow-up SMS: "Hi {name}, just checking if you saw our booking link for {property}? Let us know if you have questions!"
```

---

## 🔥 Other High-Value Automations

### 1. Vacancy Alert → Auto-Post to Zillow
**Trigger:** Unit marked as vacant in portal  
**Action:** Auto-create/update Zillow listing via API  
**Benefit:** Zero posting delay, instant marketing

### 2. Rent Payment Reminders
**Trigger:** 3 days before due date  
**Action:** SMS reminder via Twilio  
**Sequence:**
- Day -3: Friendly reminder
- Day 0: Payment due today
- Day +1: Late notice
- Day +3: Late fee applied (auto-calculated)

### 3. Late Payment Escalation
**Trigger:** Rent unpaid after grace period  
**Action:**
- Auto-calculate late fee
- Post to QBO
- Email formal notice
- SMS notification
- Update portal balance
- Create follow-up task for PM

### 4. Maintenance Request Routing
**Already designed in portal, can enhance with:**
- Auto-categorization (AI analyzes description)
- Urgency scoring
- Auto-assign to contractor (based on category + property)
- SMS updates to tenant (status changes)
- Photo analysis (AI detects issue type from images)

### 5. Renewal Offer Automation
**Trigger:** 90 days before lease end  
**Action (already partially built):**
- Generate renewal offer letter (PDF)
- Email + SMS notification
- Track response
- Auto-escalate if no response at 60 days

### 6. Move-Out Coordination
**Trigger:** 30 days before lease end (if not renewing)  
**Action:**
- Email move-out checklist
- Schedule move-out inspection
- Generate final account statement
- Security deposit processing timeline
- Key return instructions

### 7. Tenant Onboarding Sequence
**Trigger:** Lease signed  
**Day -7:** Welcome email + move-in guide  
**Day -5:** Utility setup reminders  
**Day -3:** Move-in day logistics  
**Day -1:** Final instructions + PM contact  
**Day 0:** Access codes + portal login  
**Day +1:** "How was your move-in?" check-in  
**Day +7:** Request for feedback/review

### 8. Application Pre-Qualification
**Before showing:**
- Simple web form: Income? Credit score range? Move-in date?
- AI scores qualification
- Only qualified leads get showing link
- Reduces wasted showings

### 9. Bulk Communication by Property
**Use Case:** "Need to notify all Lasalle tenants about water shut-off"  
**Action:**
- PM selects property in portal
- Writes message once
- Sends via SMS + Email + Portal notification
- Tracks delivery/read status

### 10. Seasonal Maintenance Reminders
**Trigger:** Seasonal (quarterly)  
**Action:**
- HVAC filter change reminders
- Yard maintenance (if applicable)
- Winterization tips (if cold climate)
- Links to request maintenance if needed

---

## 💰 Cost Analysis

### Current Manual Process
- **Time per Zillow lead:** 10-15 minutes
  - Read email
  - Copy info to Airtable
  - Send response email
  - Copy/paste booking link
- **Average leads per week:** ~10-15
- **Weekly time cost:** 2-3 hours
- **Annual time cost:** 100-150 hours
- **Value at $50/hr:** $5,000-$7,500/year

### With Automation
- **Time per lead:** ~30 seconds (review only)
- **Weekly time cost:** 5 minutes
- **Annual time cost:** ~4 hours
- **Time saved:** 146 hours/year
- **ROI:** ~$7,000/year in time savings

### Automation Build Cost
- **Scenario 4 (Zillow capture):** 2-3 hours to build
- **OpenAI API costs:** ~$5-10/month
- **Make.com operations:** Included in current plan
- **Break-even:** Immediate (saves hours weekly)

---

## 🛠️ Implementation Priority

### This Week (High ROI, Low Effort)
1. ✅ **Scenario 4: Zillow Lead Capture** - 2-3 hours
   - Biggest manual pain point
   - Immediate response improves conversion
   - Estimated time saved: 2 hours/week

### Next Week (Medium Effort, High Impact)
2. ✅ **Rent Payment Reminders** - 2 hours
   - Reduces late payments
   - Improves cash flow
   - Low build complexity

3. ✅ **Application Auto-Sender** - 1 hour
   - Simple trigger: "I want to apply" → send link
   - Already have application form URL
   - Easy win

### This Month (Higher Effort, High Value)
4. ⏳ **Vacancy → Auto-Post Zillow** - 4-6 hours
   - Requires Zillow API integration
   - High value (zero marketing delay)
   - Research Zillow API first

5. ⏳ **Screening Integration** - 6-8 hours
   - TransUnion SmartMove API
   - Replaces Buildium dependency
   - Enables full automation

### Future (Portal-Dependent)
6. ⏳ **Move-In/Move-Out Workflows** - Built in portal
7. ⏳ **Tenant Communication Center** - Built in portal
8. ⏳ **Maintenance Auto-Routing** - Built in portal

---

## 🚀 Scenario 4 Build Plan

### Ready to Build TODAY
I can build Scenario 4 (Zillow Lead Capture) right now if you want:

**Prerequisites:**
- ✅ Make.com account (you have it)
- ✅ Gmail API access (via Make)
- ✅ Twilio configured (done)
- ✅ Airtable configured (done)
- ⚠️ OpenAI API key (need to add)

**Build Time:** 2-3 hours  
**Testing Time:** 1 hour  
**Go-Live:** Today

**What I need from you:**
1. OpenAI API key (or I can set up free trial)
2. Confirm which email to watch (`leasing@dkliving.co`?)
3. Google Calendar booking links for each property
4. Approval to send test emails/SMS

### Alternative: Simpler Version (No AI)
If you want to start without OpenAI:
- Skip AI classification
- Send same response to all leads
- Still auto-creates Airtable record
- Still auto-sends booking link
- **Build time: 30 minutes**

---

## 📊 Metrics to Track

Once automated, we can measure:
- **Lead response time** (target: < 5 minutes)
- **Inquiry-to-showing conversion rate** (target: 60%+)
- **Showing-to-application conversion** (target: 40%+)
- **Application-to-lease conversion** (target: 80%+)
- **Overall inquiry-to-lease** (target: 20%+)
- **Time saved per week** (measure manual interventions)

---

## 🎯 Recommendation

**START WITH:** Scenario 4 (Zillow Lead Capture)

**Why:**
1. Biggest manual pain point right now
2. Immediate ROI (save 2+ hours/week)
3. Improves conversion (faster response = more showings)
4. Simple to build (2-3 hours)
5. Integrates perfectly with existing automation

**Then:** Add rent reminders, application sender, and other low-hanging fruit.

**End Goal:** Full hands-off leasing pipeline from inquiry to move-in.

---

Want me to start building Scenario 4 now? I can have it ready for testing in a few hours! 🚀
