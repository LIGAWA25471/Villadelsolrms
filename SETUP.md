# Villa del Sol RMS - Complete Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL (via Supabase)
- Docker (optional)

### Environment Setup

1. **Clone and Install**
```bash
git clone <repository>
cd villadelsolrms
pnpm install
```

2. **Set Environment Variables**
```bash
# Root level
cp .env.example .env

# Database package
cd packages/database
cp .env.example .env

# API
cd apps/api
cp .env.example .env.local

# POS
cd apps/pos
cp .env.example .env.local

# KDS
cd apps/kds
cp .env.example .env.local

# QR
cd apps/qr
cp .env.example .env.local
```

3. **Database Setup**
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

4. **Start Services**
```bash
# Development mode - starts all services
pnpm dev

# Services run on:
# - API: http://localhost:3001
# - POS: http://localhost:3000
# - KDS: http://localhost:3002
# - QR: http://localhost:3003
```

## System Architecture

### Backend API (NestJS)
- Port: 3001
- Handles: Orders, Menu, Kitchen Queue, Payments, Auth
- WebSocket: Real-time updates
- Database: Supabase PostgreSQL with RLS

### Frontend Applications

#### POS (Point of Sale) - Port 3000
- Staff interface for creating/managing orders
- Real-time order status
- Payment processing
- Order history

#### KDS (Kitchen Display System) - Port 3002
- Real-time order queue
- Status management (NEW → ACCEPTED → PREPARING → READY)
- Visual organization by station
- Dark theme for kitchen environment

#### QR Ordering - Port 3003
- Customer self-service ordering
- Table-based ordering
- Menu browsing
- Cart management
- Direct order submission

## Key Features

### Multi-Branch Support
- Automatic branch isolation via RLS
- Branch-specific menus and orders
- Role-based access control

### Real-Time Updates
- WebSocket connections for live data
- Order status broadcasts
- Kitchen queue synchronization
- Payment status notifications

### Authentication
- JWT-based auth
- Role-based access (ADMIN, MANAGER, WAITER, CHEF, CASHIER)
- Secure password hashing with bcrypt

### Database Schema
- Comprehensive Prisma schema
- RLS policies for multi-branch isolation
- Proper relationships and constraints
- Indexes for performance

## API Endpoints

### Authentication
```
POST /auth/register - Register new user
POST /auth/login - Login and get JWT token
GET /auth/me - Get current user (protected)
```

### Orders
```
POST /orders - Create new order
GET /orders - Get branch orders
GET /orders/:id - Get order details
PATCH /orders/:id/status - Update order status
DELETE /orders/:id - Cancel order
```

### Menu
```
GET /menu/categories - Get all categories
GET /menu/items - Get menu items
POST /menu/items - Create menu item
PATCH /menu/items/:id - Update menu item
DELETE /menu/items/:id - Soft delete menu item
```

### Kitchen
```
GET /kitchen/queue - Get kitchen queue
GET /kitchen/queue/:id - Get queue item
PATCH /kitchen/queue/:id/status - Update queue status
PATCH /kitchen/queue/:id/priority - Set priority
```

### Payments
```
POST /payments - Create payment record
GET /payments - Get payments
PATCH /payments/:id - Process payment
GET /payments/methods/list - Get payment methods
```

## WebSocket Events

### Subscribe to Real-Time Updates
```javascript
const socket = io('http://localhost:3001');
socket.emit('subscribe-branch', { branchId, userId });
socket.emit('subscribe-kitchen', { branchId });
```

### Received Events
```
order-created - New order
order-status-updated - Order status changed
queue-updated - Kitchen queue item changed
queue-status - Queue status for POS
payment-updated - Payment processed
```

## Demo Credentials

### Waiter Account
```
Email: waiter@example.com
Password: password123
Role: WAITER
```

### Chef Account
```
Email: chef@example.com
Password: password123
Role: CHEF
```

### Manager Account
```
Email: manager@example.com
Password: password123
Role: MANAGER
```

## Database Seeding

Run the seed script to populate demo data:
```bash
pnpm db:seed
```

This creates:
- Demo branch
- User accounts (waiter, chef, manager)
- Menu categories and items
- Payment methods

## Production Deployment

### Docker Build
```bash
docker-compose build
docker-compose up -d
```

### Environment for Production
- Set JWT_SECRET to a strong value
- Configure CORS_ORIGIN for your domain
- Use HTTPS for all external communications
- Enable rate limiting
- Set up monitoring and logging

## Troubleshooting

### Cannot connect to database
- Verify DATABASE_URL in .env
- Check Supabase credentials
- Ensure VPN if required

### WebSocket connection fails
- Check CORS origins in API
- Verify WebSocket URL matches API server
- Check firewall rules

### RLS policy errors
- Verify JWT includes branch_id claim
- Check user's branch assignment in database
- Review RLS policy definitions

## Development

### File Structure
```
apps/
  api/
    src/
      modules/      # Feature modules
      gateways/     # WebSocket gateway
      prisma/       # Database service
  pos/
    pages/          # Next.js pages
    components/     # Reusable components
  kds/
  qr/
packages/
  database/
    prisma/schema  # Data model
```

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

## Next Steps

1. Customize branding and colors
2. Add payment processing (Xprizo integration)
3. Implement inventory management
4. Add staff shift management
5. Create reporting dashboard
6. Set up email notifications
7. Add SMS capabilities
8. Implement receipt printing

## Support

For issues and feature requests, please create an issue in the repository.
