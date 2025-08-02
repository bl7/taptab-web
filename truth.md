# Taptab POS - Unified System Specification (Cursor Source of Truth)

**Project**: Taptab POS  
**Type**: Multi-tenant SaaS Restaurant POS System  
**Stack**: Next.js 14+ (App Router), PostgreSQL + Redis, Android (Capacitor), PWA  
**Target Market**: Small to medium restaurants, cafes, food trucks

---

## 🏗️ Architecture Overview

### Multi-Tenant Structure
- **Tenant Isolation**: Row-level security with `tenant_id` on all tables
- **Shared Infrastructure**: Single database, Redis cache, tenant-aware queries
- **Scalability**: Horizontal scaling via PgBouncer, optional read replicas
- **Branding**: White-labeled per tenant with custom logo/color

### Tech Stack
```
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind
Backend: Next.js API Routes + tRPC + PostgreSQL + Prisma (for schema only)
Database Access: Direct PG SQL queries for CRUD
Cache: Redis (sessions, queue)
Mobile: Capacitor Android app + PWA
Real-time: SSE + WebSocket fallback
Printer Comm: Bluetooth via Capacitor plugin
```

---
### DB rule
```
use prisma only to make the tables, use pg for CRUD 
```

## 🔐 Authentication & Roles

### Roles & Permissions
```ts
enum Role {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  READONLY = 'readonly'
}
```

- Admins can create usernames/passwords for staff
- Password + email-based login, OTP email verification
- Password reset flow with one-time secure link
- Multi-admin per tenant supported
- Session management with refresh tokens & Redis blacklist
- PIN-based switching for staff
- Audit log for critical operations

---

## 📱 Platform Strategy

### Devices
| Type | Use | Auto Print | Notes |
|------|-----|------------|-------|
| Admin Tablet | Full control | ✅ | Main POS with kitchen printer via Bluetooth |
| Waiter Tablet | Order + POS | ❌ | Manual print only |
| Phone | Waiter/Staff | ❌ | PWA/manual only |
| Kitchen Display | Orders | ✗ | Browser/PWA |
| Customer Device | Ordering | ✗ | QR menu only |

### Offline Strategy
- App will not function offline for now
- Queue printing & local retry logic for failed print jobs
- Orders persist locally if connection fails (sync on restore)

---

## 💡 UI/UX Development Rules
- **Framework**: Tailwind CSS
- **Design System**: Minimalist, modern UI
- **Layout**: Grid-based, mobile/tablet first
- **Aesthetics**: Soft shadows, rounded corners, bold typography
- **Performance**: Lazy load routes, image compression, CDN assets
- **Components**: Use `shadcn/ui`, `lucide-react`, `framer-motion`
- **Print Status**: Always visible retry/error indicator

---

## 🔌 Printer Integration

### Plugin
- `cordova-plugin-bluetooth-serial` + `@awesome-cordova-plugins/bluetooth-serial`

### Behavior
- **Admin device** auto-connects printer on boot
- **Only one printer** connected at a time (per branch)
- **Auto printing** for new QR/delivery/POS orders
- **Manual print** allowed on waiter device
- **Print retry queue** (local with retries & fail state)
- **Print templates** vary by receipt type & tenant
- **Two receipts per order**: kitchen + customer

---

## 🍽️ Menu Management
- Live updates from dashboard, real-time reflect in all apps
- Supports: modifiers, variants, combos, tags
- Time-based availability
- Translations, nutritional info, WebP images

---

## 🛒 Order System
- QR code ordering from customer with no waiter intervention
- Waiter can mark as served/completed
- Guest can order multiple times per session/table
- Cancel order allowed (logged with reason)
- Order state machine:
```text
DRAFT → PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED
                              ↓
                          CANCELLED
```
- Waiter can modify order before serving

---

## 💳 Payments

### Supported Methods
```ts
enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  DIGITAL_WALLET = 'digital_wallet',
  SPLIT = 'split',
  VOUCHER = 'voucher',
  ACCOUNT = 'account'
}
```
- Customers can optionally pay during QR order (payment optional)
- Waiter confirms final payment manually
- Supports partial and split payments
- Refund and tip tracking
- No Stripe, use native Android payment APIs if needed

---

## 🔄 Delivery Platform Integration
- Free method only (no paid APIs)
- Connect via webhook or polling
- Auto print delivery orders as they come
- Separate receipt template per platform
- Retry failed fetches and print

```ts
interface DeliveryIntegration {
  platform: 'ubereats' | 'doordash' | 'deliveroo';
  method: 'webhook' | 'manual_entry';
  features: { orderSync: true; basicPrinting: true }
}
```

---

## 📊 Reporting & Dashboard
- Order status, daily revenue, active orders
- Staff performance, payment breakdown
- Live dashboard for POS view + print status

---

## 🔄 Sync & Storage
- All orders synced to central server
- Local SQLite for temporary storage & retry
- Image & asset CDN caching

---

## 🏪 Multi-location + Multi-tenant
- Fully multi-tenant
- White-labeled per restaurant
- Separate menus, branding, printers, dashboards per tenant
- Shared DB with tenant-aware Prisma schema
- `tenant_id` in all tables; enforce with RLS

---

## 🧪 Dev Rules
- Prisma: only for schema definition
- CRUD: all logic via direct PostgreSQL queries
- Backend: Next.js API + tRPC (for internal calls)
- Auth: implemented using tRPC + JWT + Redis sessions
- Email: OTP login, password reset, email verification via Resend
- Redis: rate limiting, sessions, print queue

---

## 🧱 Project Kickoff Steps
1. Implement multi-tenant auth system (email, OTP, password reset)
2. Setup RLS in PostgreSQL
3. Build admin dashboard to manage staff, menu, printers
4. Add Bluetooth printer logic in Capacitor app
5. Add QR ordering + real-time order flow
6. Design clean mobile-first POS UI

---

## 🧩 Sample Schema Snippets
```sql
CREATE POLICY tenant_isolation ON orders 
FOR ALL TO authenticated_users 
USING (tenant_id = current_tenant_id());

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(50),
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Source of Truth
This document is the authoritative source for the Taptab POS system. Cursor and all collaborators should refer to this for architecture, behavior, and implementation rules.

Update this document as requirements evolve.
