# Taptab POS - Multi-tenant SaaS Restaurant POS System

A modern, cloud-based Point of Sale system designed for small to medium restaurants, cafes, and food trucks.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + tRPC + PostgreSQL
- **Authentication**: JWT + Redis sessions + OTP email verification
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Cache**: Redis for sessions, rate limiting, and queues
- **Mobile**: Capacitor Android app + PWA support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis server
- Resend account for email (OTP, password reset)

### Environment Setup

1. Copy the environment variables:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taptab"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   ```bash
   cp env.example .env
   ```

3. Set up your external restaurant API backend

4. Start development server:
```bash
npm run dev
```

## 📱 Features

### ✅ Implemented
- Multi-tenant authentication with OTP
- JWT token management with refresh tokens
- Role-based access control
- Basic dashboard with navigation
- Modern UI with Tailwind CSS
- tRPC API with type safety

### 🚧 In Progress
- Menu management system
- Order processing and state management
- Payment integration
- Bluetooth printer support
- QR code ordering
- Real-time order updates

### 📋 Planned
- Delivery platform integration
- Advanced reporting and analytics
- Mobile app with Capacitor
- Offline support
- Multi-location management

## 🏛️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── pos/              # POS terminal
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and configurations
│   ├── trpc/             # tRPC setup
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── redis.ts          # Redis connection
│   └── email.ts          # Email utilities
└── server/               # Server-side code
    └── api/              # tRPC routers
```

## 🔐 Authentication Flow

1. **OTP Login**: User enters email → receives 6-digit code → verifies code
2. **Session Management**: JWT tokens with Redis blacklisting
3. **Role-based Access**: SUPER_ADMIN, TENANT_ADMIN, MANAGER, CASHIER, WAITER, KITCHEN, READONLY
4. **Multi-tenant Isolation**: Row-level security with tenant_id

## 🎨 Design System

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: Minimalist, modern, mobile-first

## 🗄️ Database Schema

Key tables with tenant isolation:
- `tenants` - Multi-tenant configuration
- `users` - Staff accounts with roles
- `categories` - Menu categories
- `menu_items` - Food/drink items
- `orders` - Order management
- `order_items` - Order line items
- `payments` - Payment tracking
- `printers` - Bluetooth printer config
- `audit_logs` - Security audit trail

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Please refer to `truth.md` for the complete system specification and development guidelines.
