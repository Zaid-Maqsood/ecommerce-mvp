# ShopMVP — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL running locally

---

## 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ecommerce_db;
```

---

## 2. Backend Setup

```bash
cd backend

# Update .env with your PostgreSQL credentials
# Edit: DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ecommerce_db"

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with sample data
node prisma/seed.js

# Start the backend server (runs on port 5000)
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend

# Start the frontend (runs on port 5173)
npm run dev
```

Open: http://localhost:5173

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@shop.com | admin123 | Admin |
| user@shop.com  | user123  | User  |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | None | Register |
| POST | /api/auth/login | None | Login → JWT |
| GET | /api/products | None | List products |
| GET | /api/products/:id | None | Product detail |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| GET | /api/cart | User | Get cart |
| POST | /api/cart | User | Add to cart |
| PUT | /api/cart/:itemId | User | Update qty |
| DELETE | /api/cart/:itemId | User | Remove item |
| POST | /api/orders | User | Place order |
| GET | /api/orders | User | My orders |
| GET | /api/admin/dashboard | Admin | Stats |
| GET | /api/admin/orders | Admin | All orders |
| PUT | /api/admin/orders/:id | Admin | Update status |

---

## Environment Variables

### backend/.env
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
SHIPPING_COST=5
LOYALTY_POINTS_PER_ORDER=10
```

### frontend/.env
```
VITE_API_URL=http://localhost:5000
```
