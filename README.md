# ShopKart

ShopKart is a MERN storefront with buyer accounts, seller-owned product management, a persistent cart, COD checkout, order history, and customer reviews.

## Features

- Responsive storefront with featured products, category navigation, search, price filters, sorting, and pagination.
- Product details with seller, stock, delivery, return information, related products, and real customer reviews.
- JWT authentication, buyer carts, stock-checked quantity updates, and order placement using current server-side prices.
- Seller dashboard for managing the seller's own products and orders.
- Cash on Delivery is the only implemented payment method. No card payment or online payment is simulated.
- Product images are managed using image URLs; local file uploads are not configured.

## Requirements

- Node.js 18 or later and npm.
- A MongoDB instance (local MongoDB or MongoDB Atlas).

## Configure the backend

From the repository root in PowerShell:

```powershell
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
```

Set these values in `backend\.env` (do not commit the file):

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000`. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | A long, private random secret used to sign authentication tokens. |
| `JWT_EXPIRES_IN` | Optional token lifetime; defaults to `7d`. |
| `CLIENT_URL` | Frontend origin allowed by CORS; defaults to `http://localhost:5173`. |
| `DEMO_SELLER_EMAIL` | Optional email of the seller account that should own demo catalog entries. |

Install backend dependencies and start the API:

```powershell
Set-Location backend
npm install
npm run dev
```

## Add the demo catalog

Register or log in to an existing **seller** account first. The seed script uses that account as the owner of the demo products; set `DEMO_SELLER_EMAIL` to select a specific seller. Then, from the `backend` directory:

```powershell
npm run seed:products
```

The script inserts 24 products using stable `SK-DEMO-*` SKUs and actual product-model fields. It uses `$setOnInsert`, so repeated runs leave seeded records unchanged and do not overwrite existing products or user data. It does not clear or reset the database. Products have no pre-filled ratings or customer reviews.

To verify the public API after starting the backend:

```powershell
Invoke-RestMethod http://localhost:5000/api/products
Invoke-RestMethod "http://localhost:5000/api/products?page=1&limit=12&sort=newest"
```

## Configure and run the frontend

In a second PowerShell terminal, from the repository root:

```powershell
if (-not (Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env }
Set-Location frontend
npm install
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:5000/api`. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Useful commands

```powershell
# Backend, from backend\
npm start
npm run seed:products

# Frontend, from frontend\
npm run dev
npm run build
npm run preview
```

## API notes

- `GET /api/products` supports `keyword`, `category`, `minPrice`, `maxPrice`, `sort`, and `featured`.
- Add `page` and/or `limit` for a paginated response containing `products`, `total`, `page`, and `pages`. Requests without pagination retain the original array response.
- `GET /api/products/categories` returns categories currently represented in the catalog.
- Product create, update, delete, and seller order routes remain protected by seller authentication and ownership checks.
- Cart and order APIs validate inventory. The order total and item prices are calculated from database products on the server.

## Current limitations

- COD only; no payment provider is integrated.
- Images are external URLs; image upload and image hosting are not implemented.
- The seller dashboard is seller-scoped rather than a separate global administrator console.
- Seeded demo products are assigned to an existing seller account; the seed command exits with guidance if none exists.
