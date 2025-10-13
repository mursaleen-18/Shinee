# Shine

A full-stack e-commerce web application with user authentication, profile management, order tracking, and admin features. Built with React (Vite), Node.js (Express), and MongoDB.

## Features

### User
- Register, login, and secure JWT-based authentication
- Profile page with:
  - Edit profile (name, phone, DOB, gender, preferences)
  - Multi-address management (add, remove, set default)
  - Avatar upload/crop/remove
  - Change password
  - Email verification (with resend)
  - Logout from all devices (token invalidation)
- Guest browsing (add to cart as guest, login required for checkout/profile/orders)
- Orders page with order history, order details, and tracking
- Optimistic UI and skeleton loaders for smooth experience

### Admin
- Admin login
- Manage products, orders, and users (extendable)

### Security & UX
- JWT tokens include server instance ID and token version for secure logout and forced re-login on server restart
- Profile and cart data cached in React context
- Axios interceptors auto-logout on token/server errors
- Inline validation and toasts for all actions

## Project Structure

```
Shine/
  backend/         # Express API, MongoDB models, controllers, routes
  frontend/        # React app (Vite), components, pages, context
  admin/           # (Optional) Admin dashboard
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### Backend Setup
```powershell
cd backend
npm install
# Set up .env with MONGODB_URL, JWT_SECRET, CLOUDINARY keys, etc.
npm run server
```

### Frontend Setup
```powershell
cd frontend
npm install
# Set VITE_BACKEND_URL in .env (e.g. http://localhost:4000)
npm run dev
```

### Admin (if used)
```powershell
cd admin
npm install
npm run dev
```

## Usage
- Visit `http://localhost:5173` (or as shown in terminal)
- Register or login as a user
- Browse products, add to cart (as guest or logged in)
- Edit your profile, manage addresses, view orders
- Admins can log in with admin credentials (see `.env`)

## Environment Variables
- `backend/.env`:
  - `MONGODB_URL` - MongoDB connection string
  - `JWT_SECRET` - JWT signing key
  - `CLOUDINARY_*` - Cloudinary API keys for image upload
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin login
- `frontend/.env`:
  - `VITE_BACKEND_URL` - Backend API base URL

## Extending & Contributing
- Add more product/order/admin features as needed
- To add payment gateways, extend `orderRoute.js` and frontend checkout
- PRs and issues welcome!

## License
MIT

---

**Project by mursaleen-18 and contributors.**
