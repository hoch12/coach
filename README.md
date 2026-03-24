# Coach-E

A highly personalized, aesthetic fitness and nutrition coaching platform for gyms and personal trainers.

## Architecture
The application is a full stack web application utilizing:
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Node.js, Express, `better-sqlite3`, JSON Web Tokens (JWT)
- **Deployment**: GitHub Pages (Frontend), Render.com (Backend)

## Production URLs
- **Frontend**: [https://hoch12.github.io/coach/](https://hoch12.github.io/coach/)
- **Backend**: `https://coach-3iwd.onrender.com`

## Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed.

### Installation

1. Install all dependencies for both frontend and backend:
```sh
npm install
```

2. Start the development server (runs both Vite and Express concurrently):
```sh
npm run dev
```

The app will be available at `http://localhost:8080`, and the backend API is proxied automatically.

### Features
- **Authentication**: Secure login, registration, and protected routing.
- **Multi-Role System**: Admin, Trainer, and Client roles with dedicated dashboards.
- **Admin Dashboard**: `/admin` area to create trainer accounts, assign clients to trainers, and manage users.
- **Trainer Dashboard**: `/trainer` area to manage clients, view their plans, handle bookings and messages.
- **Profile**: Edit your answers and base statistics.
- **Personalized Onboarding**: Form with multi-select components for granular data gathering.
- **Dynamic Plan Generation**: Plans adjust based on exact answers including dietary extremes, specific injuries, and exact allergies.
- **Session Booking**: Clients can book training sessions; trainers approve or decline them.
- **Messaging**: Direct Client-Trainer messaging system.

## Deployment Details
The application uses a dynamic API routing utility (`getApiUrl`) which automatically switches between the local Vite proxy (development) and the production Render backend based on the environment. This ensures cross-origin compatibility when hosted on GitHub Pages.

For detailed deployment steps, see:
- [GitHub Pages Guide](https://hoch12.github.io/coach/github_pages_guide.md) (or local file)
- [Database Hosting Guide](https://hoch12.github.io/coach/database_hosting_guide.md) (or local file)
