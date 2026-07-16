# ShopKart — Full Stack E-Commerce Web App

A Flipkart/Amazon style e-commerce website built with the **MERN stack** (MongoDB, Express, React, Node.js).
It supports two kinds of users — **buyers** and **sellers** — and currently supports **Cash on Delivery (COD)** as the only payment method.

## Features

**Buyers can:**
- Register / login
- Browse and search products by keyword and category
- View product details — price, return policy, estimated delivery date, seller info
- Add products to cart, update quantity, remove items
- Checkout with a shipping address (COD only)
- View their past orders and order status
- Leave a rating and review on any product

**Sellers can:**
- Register / login as a seller
- Add, edit and delete their own products (price, stock, return policy, delivery time, category, image)
- View a dashboard with total orders, total revenue, and items sold
- See all orders that contain their products, along with buyer and shipping details
- Update order status (placed → shipped → delivered / cancelled)

## Tech Stack

| Layer      | Tech                                   |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router, Axios, Vite     |
| Backend    | Node.js, Express                        |
| Database   | MongoDB with Mongoose                   |
| Auth       | JWT (JSON Web Tokens) + bcrypt          |

## Folder Structure

```
ecommerce-project/
├── backend/         # Express + MongoDB REST API
│   ├── config/       # DB connection
│   ├── controllers/   # route handler logic
│   ├── middleware/    # auth middleware
│   ├── models/        # mongoose schemas
│   ├── routes/         # express routers
│   └── server.js
│
└── frontend/         # React + Vite client
    └── src/
        ├── api/         # axios instance
        ├── components/   # reusable UI pieces
        ├── context/       # auth + cart state
        ├── pages/          # route-level pages
        └── styles/          # css
```

## Getting Started

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET if needed
npm run dev              # starts the API on http://localhost:5000
```

Make sure MongoDB is running locally (or point `MONGO_URI` in `.env` to a MongoDB Atlas cluster).

### 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # only needed if your API isn't on localhost:5000
npm run dev              # starts the app on http://localhost:5173
```

Visit `http://localhost:5173` in your browser. Register once as a **seller** to add products, and once as a **buyer** (use a different email, or a private/incognito window) to shop and place orders.

## API Overview

| Method | Endpoint                       | Description                          | Access        |
|--------|----------------------------------|---------------------------------------|----------------|
| POST   | /api/auth/register                | Create a new account                   | Public         |
| POST   | /api/auth/login                   | Login                                  | Public         |
| GET    | /api/products                      | List products (search/category filter)| Public         |
| GET    | /api/products/:id                  | Product details + reviews              | Public         |
| POST   | /api/products                      | Create product                         | Seller         |
| PUT    | /api/products/:id                   | Update product                         | Seller (owner) |
| DELETE | /api/products/:id                   | Delete product                         | Seller (owner) |
| POST   | /api/products/:id/reviews            | Add a review                           | Logged in user |
| GET    | /api/cart                          | Get current cart                       | Logged in user |
| POST   | /api/cart                          | Add item to cart                       | Logged in user |
| PUT    | /api/cart/:productId                | Update item quantity                   | Logged in user |
| DELETE | /api/cart/:productId                | Remove item from cart                  | Logged in user |
| POST   | /api/orders                        | Place an order (COD)                    | Buyer          |
| GET    | /api/orders/mine                    | Buyer's own orders                      | Buyer          |
| GET    | /api/orders/seller                  | Orders containing seller's products      | Seller         |
| PUT    | /api/orders/:id/status               | Update order status                     | Seller         |

## Notes

- Only **Cash on Delivery** is implemented as a payment method right now — this can be extended later with a payment gateway like Razorpay or Stripe.
- Product images are referenced by URL rather than file upload, to keep the project simple to run locally.
- This project is meant as a learning / portfolio project — before using in production you'd want to add things like input validation libraries, rate limiting, pagination, and image upload support.
