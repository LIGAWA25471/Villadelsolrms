# 🏝 Villa del Sol RMS  
**Enterprise Multi-Branch Restaurant Management System**  
TypeScript • NestJS • Next.js • Prisma • PostgreSQL • Redis • Docker

Production URL:  
👉 **https://rms.aghq.co.ke**

---

## ⚠️ Important: Lock File Issue

If you see an error like `ERR_PNPM_OUTDATED_LOCKFILE`, please run:
```bash
pnpm install --no-frozen-lockfile
```

See [LOCKFILE_FIX.md](./LOCKFILE_FIX.md) for complete instructions.

---

## 📌 Overview

Villa del Sol RMS is a scalable, real-time, multi-branch Restaurant Management System designed to support:

- Dine-in
- Takeaway
- Delivery
- QR Self-Ordering
- Kitchen Display System (KDS)
- Inventory & Recipe Management
- Multi-branch Operations
- Role-based Access Control
- Real-time Order Updates
- Unified Payment Processing via **Xprizo (M-Pesa + Card)**

This system is architected for:

- Growth from single branch to multi-branch
- SaaS multi-tenant expansion
- Horizontal scaling with Docker
- Clean API-first architecture

---

## 🌐 Production Environment

### Base URL
https://rms.aghq.co.ke/

### Production Services

| Service | URL |
|---|---|
| API | https://rms.aghq.co.ke |
| Swagger Docs | https://rms.aghq.co.ke/docs |
| WebSocket | wss://rms.aghq.co.ke/events |
| POS | https://rms.aghq.co.ke/pos |
| KDS | https://rms.aghq.co.ke/kds |
| QR Ordering | https://rms.aghq.co.ke/qr |

---

## 🏗 System Architecture

### High-Level Architecture
Internet
↓
Nginx (SSL)
↓
Docker Network
├── API (NestJS)
├── POS (Next.js)
├── KDS (Next.js)
├── QR (Next.js)
├── PostgreSQL
└── Redis

---

## 📦 Monorepo Structure

Villadelsolrms/
│
├── apps/
│ ├── api/ # Backend (NestJS)
│ ├── pos-web/ # POS Interface
│ ├── kds-web/ # Kitchen Display
│ └── qr-web/ # Customer QR Ordering
│
├── packages/
│ ├── db/ # Prisma schema + migrations
│ └── shared/ # Shared types & validation
│
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml

---

## 🧠 Core Modules

### 1) Multi-Branch Engine

Supports:

- Multiple branches per organization
- Branch-level:
  - Menu
  - Tables
  - Inventory
  - Orders
  - Staff

Future-ready for SaaS multi-tenant expansion.

---

### 2) Authentication & Roles

#### User Roles
- OWNER
- MANAGER
- CASHIER
- WAITER
- KITCHEN
- DELIVERY

#### Features
- JWT authentication
- Role-based access control
- Organization isolation
- Branch-level filtering

---

## 🍽 Menu Management

### Features
- Categories per branch
- Menu items
- Active/inactive toggle
- Price stored in minor units (KES cents)
- Branch-specific menu configuration

### Planned Enhancements
- Modifiers (size, add-ons)
- Combo meals
- Time-based menus
- Dynamic pricing

---

## 🧾 Order Management

### Order Types
- DINE_IN
- TAKEAWAY
- DELIVERY

### Order Lifecycle

PLACED → IN_PROGRESS → READY → COMPLETED
↘
CANCELLED

### Core Features
- Multi-item orders
- Item notes
- Real-time updates via WebSocket
- Table linking
- QR-created orders
- Branch isolation

---

## 🧑‍🍳 Kitchen Display System (KDS)

### Features
- Real-time order feed
- Status updates
- Auto-refreshing live board
- Branch filtering
- Visual priority handling

### Real-Time Events
- `order.created`
- `order.updated`
- `payment.paid`
- `payment.updated`

---

## 📦 Inventory & Recipes

### Ingredient Management
- Ingredients per branch
- Units (g, ml, pcs, kg)
- Low stock thresholds

### Recipes
Each menu item can define:
- Ingredient list
- Quantity per serving

### Stock Movement Types
- IN
- OUT
- ADJUST
- WASTE
- TRANSFER_IN
- TRANSFER_OUT

### Planned Automation
- Automatic stock deduction on successful payment
- Low stock alerts
- Waste analytics
- Supplier management

---

## 💳 Unified Payments via Xprizo

Villa del Sol RMS uses **Xprizo** as the unified payment gateway for:

- M-Pesa (STK Push)
- Card Payments (Visa/Mastercard)
- Future expansion (other channels supported by Xprizo)

---

## 🔗 Xprizo Integration Architecture

### Payment Flow Overview

Order Created

Payment Record Created (PENDING)

RMS calls Xprizo to initiate payment

Customer completes payment (M-Pesa or Card)

Xprizo sends webhook callback to RMS

RMS verifies signature + transaction reference + amount

Payment marked PAID / FAILED

Real-time event emitted to POS/KDS

Order progresses

Inventory deduction (if enabled)

---

### 📲 M-Pesa via Xprizo

#### Flow
1. RMS sends payment request to Xprizo
2. Xprizo triggers M-Pesa STK Push
3. Customer enters PIN
4. Xprizo sends webhook to:

https://rms.aghq.co.ke/payments/xprizo/webhook

5. RMS verifies:
   - Signature
   - Transaction reference
   - Amount
6. Payment marked PAID
7. Order status updated

---

### 💳 Card Payments via Xprizo

#### Flow
1. POS or QR initiates card payment
2. Xprizo returns payment link or embedded checkout
3. Customer completes card payment
4. Xprizo sends webhook
5. RMS verifies and marks payment PAID

---

## 🔐 Webhook Security (Xprizo)

Webhook endpoint:
POST /payments/xprizo/webhook

Security measures:
- HMAC signature verification
- Transaction ID validation
- Amount verification
- Idempotency checks
- Replay protection

---

## 📱 QR Self-Ordering

### Flow
1. Customer scans QR
2. QR contains secure table token
3. Menu loads
4. Customer selects items
5. Order created
6. Payment via Xprizo
7. Order sent to kitchen

### Security
- Unique table tokens
- No guessable table IDs
- Branch isolation enforced

---

## 🖥 POS System

### Planned Pages
- Login
- Dashboard
- Table Overview
- Order Creation
- Payment Processing
- Order History
- Daily Summary

### Device Compatibility
- Desktop
- Android tablets
- iPads
- Phones (PWA)

---

## 📊 Reporting (Planned)
- Daily sales
- Branch comparison
- Payment breakdown
- Best sellers
- Inventory usage
- Waste reports
- Staff performance

---

## 🔌 API Overview

Base URL:
https://rms.aghq.co.ke

### Documentation
/docs

### Key Endpoints

#### Auth
POST /auth/login

#### Menu
GET /menu?branchId=

#### Orders
POST /orders
GET /orders/active?branchId=
PATCH /orders/:id/status

#### Payments (Xprizo)
POST /payments
POST /payments/xprizo/initiate
POST /payments/xprizo/webhook
