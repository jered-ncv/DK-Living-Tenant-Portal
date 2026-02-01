# Design System Update

**Date:** February 1, 2026  
**Status:** ✅ Design guide integrated, shadcn/ui installed

---

## 🎨 Design Direction

### Brand Reference
**Nomad Hospitality** (https://www.nomadhospitality.co/)
- Modern, clean, hospitality-focused
- Mobile-first approach
- Photo-driven with spacious layouts
- Think: Airbnb meets boutique hotel

### Design Principles
1. **Mobile-First, Always** - Design for iPhone SE first
2. **Clarity Over Creativity** - Users want to pay rent and submit requests, make it obvious
3. **Trust & Security Signals** - Show lock icons, confirm actions, display receipts
4. **Status Transparency** - Color-coded badges (green/yellow/red/gray)
5. **Empty States Matter** - Friendly messages when no data

---

## 🛠️ Tech Stack Update

### Added Components
- ✅ **shadcn/ui** - Copy-paste React components built on Radix UI
- ✅ **Lucide React** - Modern SVG icons
- ✅ **class-variance-authority** - Component variants
- ✅ **clsx + tailwind-merge** - Utility for merging Tailwind classes

### Component Library Installed
- ✅ `Button` - Primary/secondary/ghost variants
- ✅ `Card` - Container component for sections
- ✅ `Badge` - Status indicators

### To Install (as needed)
- `Form` / `Input` / `Textarea` - Form components with validation
- `Dialog` - Modal dialogs
- `Toast` - Success/error notifications
- `Tabs` - Tabbed navigation

---

## 🎨 Color Palette (Nomad Hospitality Inspired)

### Primary Colors
```css
/* Dark navy/black for headers and text */
--primary: #0A1628;
--primary-foreground: #FFFFFF;

/* Ocean blue accents for CTAs */
--accent: #0E7490; /* cyan-700 */
--accent-foreground: #FFFFFF;
```

### Semantic Colors
```css
/* Success (completed, paid) */
--success: #10B981; /* green-500 */

/* Warning (in progress, pending) */
--warning: #F59E0B; /* amber-500 */

/* Error (overdue, failed) */
--error: #EF4444; /* red-500 */

/* Info (submitted) */
--info: #3B82F6; /* blue-500 */
```

### Neutral Colors
```css
/* Backgrounds */
--background: #FFFFFF;
--card: #FAFAFA; /* neutral-50 */

/* Borders */
--border: #E5E5E5; /* neutral-200 */

/* Text */
--foreground: #171717; /* neutral-900 */
--muted-foreground: #737373; /* neutral-500 */
```

---

## 📱 Responsive Breakpoints

Following Tailwind defaults:
- **sm:** 640px (large phones)
- **md:** 768px (tablets)
- **lg:** 1024px (small desktops)
- **xl:** 1280px (desktops)
- **2xl:** 1536px (large desktops)

**Design for mobile first, enhance for larger screens.**

---

## 🧩 Component Patterns

### Status Badges
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="secondary">Submitted</Badge>
```

### Action Buttons
```tsx
<Button>Pay Rent</Button>                      // Primary action
<Button variant="secondary">View History</Button>  // Secondary
<Button variant="ghost">Cancel</Button>           // Tertiary
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Current Balance</CardTitle>
    <CardDescription>Due: February 1, 2026</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">$1,200.00</p>
  </CardContent>
  <CardFooter>
    <Button>Pay Now</Button>
  </CardFooter>
</Card>
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
- ✅ Color contrast ≥4.5:1 for normal text
- ✅ Color contrast ≥3:1 for large text (18px+)
- ✅ Touch targets ≥44px × 44px
- ✅ Keyboard navigation support
- ✅ Screen reader friendly (ARIA labels)
- ✅ Focus indicators visible

### Testing Tools
- WAVE browser extension
- Axe DevTools Chrome extension
- Lighthouse accessibility audit

---

## 🚀 Next Steps

### Phase 1 (Current)
- [x] Install shadcn/ui and component library
- [x] Define color palette
- [ ] Update login/signup pages with new design
- [ ] Redesign dashboard with Cards and Badges
- [ ] Add Lucide icons throughout

### Phase 2 (Week 1)
- [ ] Build payment page with modern UI
- [ ] Add Form components for payment flow
- [ ] Create success/error states with Toast
- [ ] Add loading states with Spinner

### Phase 3 (Week 2)
- [ ] Build maintenance request form
- [ ] Add photo upload UI
- [ ] Create request detail view
- [ ] Implement messaging UI

---

## 📚 Design Resources

### Reference
- Design guide: `/home/ubuntu/clawd/brain/concepts/tenant-portal-design-guide.md`
- Brand reference: https://www.nomadhospitality.co/
- shadcn/ui docs: https://ui.shadcn.com/

### Inspiration
- Airbnb guest dashboard (clean, card-based)
- Stripe customer portal (status transparency)
- Notion (spacious layouts, clear hierarchy)
- Linear (status badges, modern forms)

---

## 🎯 Design Goals

**User Experience:**
- Tenant can complete any task in ≤3 taps/clicks
- Forms are easy to fill on mobile
- Status is always visible and clear
- Trust signals throughout (lock icons, confirmations)

**Visual Design:**
- Clean, modern, professional
- Generous white space (not cluttered)
- Mobile-first responsive
- Accessible to all users

**Performance:**
- Lighthouse score ≥90 (mobile)
- Fast page loads (<2s LCP)
- Smooth animations (60fps)

---

**Design system is ready. Time to build!** 🎨
