# Villa del Sol RMS - Architecture & Quick Reference

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────┬──────────────────┬──────────────┬──────────────┤
│   POS Web       │   KDS Web        │  QR Ordering │  Admin       │
│  (Port 3000)    │ (Port 3002)      │ (Port 3003)  │  Dashboard   │
│                 │                  │              │              │
│  Staff Orders   │ Kitchen Display  │ Self-Service │ (Future)     │
│  Management     │ System           │ Ordering     │              │
└────────┬────────┴────────┬─────────┴──────┬───────┴──────────────┘
         │                 │                │
         │    REST API     │   WebSocket    │
         │   (JWT Auth)    │   (Real-time)  │
         └────────┬────────┴────────┬───────┘
                  │                 │
         ┌────────▼─────────────────▼───────┐
         │    NestJS Backend API            │
         │    (Port 3001)                   │
         ├──────────────────────────────────┤
         │  Auth Module                     │
         │  Orders Module                   │
         │  Menu Module                     │
         │  Kitchen Module                  │
         │  Payment Module                  │
         │  Realtime Gateway                │
         └────────┬──────────────────┬──────┘
                  │                  │
         ┌────────▼──────────────────▼────────┐
         │   Supabase PostgreSQL              │
         │   (Row-Level Security)             │
         ├────────────────────────────────────┤
         │  Branches                          │
         │  Users                             │
         │  Menu (Categories & Items)         │
         │  Orders & Order Items              │
         │  Kitchen Queue                     │
         │  Payments                          │
         │  Inventory                         │
         └────────────────────────────────────┘
```

## Data Flow - Order Lifecycle

```
1. CREATE ORDER (POS)
   ↓
   POST /orders
   ↓
2. ORDER CREATED
   ├─ Order record created
   ├─ Kitchen Queue entry created
   ├─ WebSocket event: 'order-created' broadcast
   ↓
3. POS & KDS receive real-time update
   ├─ POS: Shows order in dashboard
   ├─ KDS: Shows order in appropriate queue column
   ↓
4. KITCHEN ACCEPTS (KDS)
   ↓
   PATCH /kitchen/queue/:id/status → ACCEPTED
   ↓
5. STATUS PROPAGATES
   ├─ Order status updated to CONFIRMED
   ├─ WebSocket: 'queue-updated' event
   ├─ POS refreshes order status
   ↓
6. KITCHEN PREPARING (KDS)
   ↓
   PATCH /kitchen/queue/:id/status → PREPARING
   ↓
7. PREPARATION IN PROGRESS
   ├─ Kitchen Queue shows as PREPARING
   ├─ POS displays as IN_PROGRESS
   ├─ Real-time events keep all clients synced
   ↓
8. READY FOR PICKUP (KDS)
   ↓
   PATCH /kitchen/queue/:id/status → READY_FOR_PICKUP
   ↓
9. ORDER READY
   ├─ Order status updated to READY
   ├─ WebSocket: 'order-status-updated' event
   ├─ POS highlights ready order
   ├─ Kitchen queue moves to READY_FOR_PICKUP column
   ↓
10. PAYMENT PROCESSING (POS/Cashier)
    ↓
    POST /payments
    ↓
11. PAYMENT COMPLETE
    ├─ Payment status: COMPLETED
    ├─ Order marked as PAID
    ├─ WebSocket: 'payment-updated' event
    ↓
12. ORDER SERVED & COMPLETED
    ├─ Staff marks as served
    ├─ Order status: COMPLETED
    ├─ Kitchen queue: COMPLETED
```

## Authentication Flow

```
1. USER LOGIN (POS/KDS)
   ↓
   POST /auth/login
   { email, password }
   ↓
2. SERVER VALIDATES
   ├─ Email lookup
   ├─ Password verification (bcrypt)
   ├─ User active check
   ↓
3. JWT TOKEN GENERATED
   ├─ Payload includes:
   │  - sub: user ID
   │  - email: user email
   │  - role: user role
   │  - branch_id: user's branch
   ├─ Signed with JWT_SECRET
   ↓
4. TOKEN RETURNED
   ├─ Client stores in localStorage
   ├─ JWT included in Authorization header for all requests
   ↓
5. SUBSEQUENT REQUESTS
   ├─ Header: Authorization: Bearer {token}
   ├─ Server validates token signature
   ├─ JWT payload provides branch context for RLS
   ├─ RLS policies enforce branch isolation
```

## WebSocket Connection Flow

```
1. CLIENT CONNECTS
   ↓
   io(WS_URL, { auth: { token } })
   ↓
2. SERVER ACCEPTS
   ├─ Verifies JWT token
   ├─ Extracts branch_id from token
   ↓
3. CLIENT SUBSCRIBES
   ↓
   socket.emit('subscribe-branch', { branchId, userId })
   OR
   socket.emit('subscribe-kitchen', { branchId })
   ↓
4. SERVER ROUTES CLIENT
   ├─ Joins Socket.io room: 'branch-{branchId}'
   ├─ OR joins room: 'kitchen-{branchId}'
   ↓
5. EVENTS BROADCAST
   ├─ Any order update broadcasts to all sockets in that room
   ├─ Real-time sync across all clients
   ├─ POS, KDS, Admin all receive same update simultaneously
```

## Database Query Examples

### Get Active Orders for Branch
```javascript
// Automatically filtered by RLS based on JWT branch_id
const orders = await prisma.order.findMany({
  where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
  include: { items: { include: { menuItem: true } } },
});
```

### Create Order with Items
```javascript
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-20260213-0001',
    tableNumber: 5,
    branchId: req.user.branchId, // Enforced by RLS
    staffId: req.user.id,
    status: 'PENDING',
    items: {
      create: [
        { menuItemId: 'item-1', quantity: 2, unitPrice: 15.00, totalPrice: 30.00 },
        { menuItemId: 'item-2', quantity: 1, unitPrice: 12.00, totalPrice: 12.00 },
      ],
    },
  },
});
```

### Update Order Status
```javascript
const updated = await prisma.order.update({
  where: { id: orderId },
  data: { status: 'READY' },
});

// Broadcast to all clients
io.to(`branch-${branchId}`).emit('order-status-updated', {
  orderId: order.id,
  status: 'READY',
});
```

## Troubleshooting Quick Reference

| Issue | Cause | Solution |
|-------|-------|----------|
| Cannot login | Wrong credentials | Verify email/password with seed data |
| Cannot connect to API | API not running | Run `pnpm dev` from root |
| WebSocket fails | Wrong WS URL | Check NEXT_PUBLIC_WS_URL env var |
| Real-time updates not working | Connection closed | Verify JWT token is valid |
| RLS policy errors | User not assigned to branch | Check `branchId` in user record |
| Menu items not showing | Items inactive or wrong branch | Verify `isActive: true` and `branchId` match |
| Order creation fails | Invalid menu items | Ensure menu items exist for branch |

## Environment Variables Checklist

### Root Level (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

### API (`.env.local`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3001
```

### POS (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### KDS (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### QR (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## File Modification Reference

If you need to customize:

| Requirement | File |
|-------------|------|
| Add new API endpoint | `/apps/api/src/modules/[module]/[module].controller.ts` |
| Change database schema | `/packages/database/prisma/schema.prisma` then migrate |
| Add menu category | Automatic via API or seed script |
| Modify UI colors | Update Tailwind classes in page components |
| Change API port | Update `PORT` env var and references |
| Add WebSocket event | Update `/apps/api/src/gateways/realtime.gateway.ts` |
| Add user role | Update `UserRole` enum in schema and update RLS policies |

## Performance Optimization Tips

1. **Database Indexes** - Already configured on branchId and commonly filtered fields
2. **WebSocket Rooms** - Clients automatically only receive events for their branch
3. **Pagination** - Consider adding for large order lists (not yet implemented)
4. **Caching** - Menu can be cached client-side as it changes infrequently
5. **Query Optimization** - Use `include` strategically to avoid N+1 queries

## Security Checklist

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens signed with secret key
- ✅ Row-Level Security enforces branch isolation
- ✅ No sensitive data in JWT payload
- ✅ CORS configured for frontend URLs
- ✅ Branch context from JWT, not user input
- ⚠️ Rate limiting (not yet implemented)
- ⚠️ Input validation (basic, can be enhanced)
- ⚠️ SQL injection protection (via Prisma)

---

**Version**: 1.0.0 MVP
**Last Updated**: February 13, 2026
