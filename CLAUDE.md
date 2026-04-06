# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Express + Prisma)
```bash
cd backend
npm run dev          # start with nodemon (port 5000)
npm run seed         # seed the database with sample data
npx prisma migrate dev --name <name>   # create and apply a migration
npx prisma studio    # open Prisma GUI to inspect the DB
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev          # start dev server (port 5173)
npm run lint         # run ESLint
npm run build        # production build
```

## Architecture

This is a full-stack ecommerce MVP with a decoupled backend and frontend.

### Backend (`backend/`)
- **Express** REST API on port 5000
- **Prisma ORM** with PostgreSQL (`ecommerce_db` database, `DATABASE_URL` in `backend/.env`)
- Schema lives in `backend/prisma/schema.prisma` — models: `User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`
- All routes are under `/api/*` and mounted in `src/app.js`
- **Auth**: JWT-based, token signed with `JWT_SECRET`, expires in 7 days. The decoded payload `{ id, email, role }` is attached to `req.user` by the `auth` middleware
- **Role system**: `user` (default) and `admin` — enforced by `src/middleware/admin.js` which stacks on top of `auth`
- Price is snapshotted onto `OrderItem.price` at order creation time (not read from Product later)
- `loyaltyPoints` on User are updated after each order

### Frontend (`frontend/`)
- **React 19** + **React Router v7** SPA on port 5173
- All API calls go through `src/api/axios.js` — a single axios instance that auto-attaches the JWT from `localStorage`
- **AuthContext** (`src/context/AuthContext.jsx`): holds `user` state, persisted to `localStorage`. Exposes `login`, `logout`, `updateLoyaltyPoints`
- **CartContext** (`src/context/CartContext.jsx`): cart state synced with the backend
- Route guards: `ProtectedRoute` (requires login) and `AdminRoute` (requires `role === "admin"`) in `src/components/ProtectedRoute.jsx`

### Auth flow
1. Login/signup → backend returns `{ token, user }`
2. Frontend stores both in `localStorage` via `AuthContext.login()`
3. Every subsequent API call includes `Authorization: Bearer <token>` via the axios interceptor

## Environment Variables

### `backend/.env`
```
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
SHIPPING_COST=5
LOYALTY_POINTS_PER_ORDER=10
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:5000
```

## Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@shop.com | admin123 | Admin |
| user@shop.com | user123 | User |
