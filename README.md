# EasyCart Backend (E-Commerce API)

EasyCart Backend is a RESTful API for an E-Commerce platform built using Node.js, Express, TypeScript, and PostgreSQL. This project features caching with Redis, image storage via Cloudinary, and robust data validation using Zod.

## 🚀 Technologies Used

- **Backend Framework:** Node.js, Express.js (v5)
- **Programming Language:** TypeScript
- **Database:** PostgreSQL (using `pg-promise` & `@neondatabase/serverless`)
- **Caching:** Redis
- **File Storage:** Cloudinary & Multer
- **Authentication & Security:** JSON Web Token (JWT) & bcryptjs
- **Data Validation:** Zod
- **Development Tools:** tsx, ts-node

## 📦 Key Features

- **Authentication & Authorization:** Registration, Login, and JWT token management.
- **User Management (Users):** Manage user profiles.
- **Category Management (Categories):** CRUD operations for product categories.
- **Product Management (Products):** CRUD operations for products including image uploads to Cloudinary.
- **Shopping Cart (Cart):** Add, reduce, or remove items in the cart.
- **Order Management (Orders):** Checkout process and order status tracking.
- **Reviews (Reviews):** Submit and view product reviews and ratings.
- **High Performance:** Uses Redis for caching frequently accessed data (e.g., user profiles).

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- [PostgreSQL](https://www.postgresql.org/) (or a Cloud Database service like Supabase/Neon)
- [Redis](https://redis.io/) (or a Cloud Redis service like Upstash)
- A [Cloudinary](https://cloudinary.com/) account for image storage

## ⚙️ Environment Variables (.env)

Create a `.env` file in the root directory of the project and customize the following values according to your configuration:

```env
# Server
PORT=3000

# Database (PostgreSQL)
DB_URL=postgres://username:password@host:port/database_name

# Redis
REDIS_URL=redis://localhost:6379 # Or your Cloud Redis URL

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=super_secure_jwt_secret
```

## 🚀 Installation & Running the Project

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd easycart-be
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server in development mode:**
   ```bash
   npm run start
   ```
   *The server will run at `http://localhost:3000` and will automatically attempt to connect to the Database and Redis.*

## 📂 Project Structure

```
easycart-be/
├── api/            # Application entry point (app.ts)
├── cache/          # Caching logic using Redis
├── config/         # Database, Redis, and Cloudinary configurations
├── controllers/    # Business logic for each endpoint
├── middleware/     # Express Middleware (Auth, Multer, Validation with Zod)
├── routes/         # API routing definitions
├── services/       # Database interaction layer (Queries)
└── types/          # TypeScript type definitions
```

## 🔗 Main API Endpoints

Base URL: `http://localhost:3000/api/ecommerce`

| Endpoint | Description |
| --- | --- |
| `/auth` | Endpoints for registration and login |
| `/users` | User data management |
| `/products` | Manage product data and images |
| `/category` | Manage product categories |
| `/cart` | Manage user shopping cart |
| `/orders` | Checkout process and orders |
| `/review` | Submit and view product reviews |

## 📜 License

ISC License
