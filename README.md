# Coach-E

A highly personalized, aesthetic fitness and nutrition coaching platform for gyms and personal trainers.

## Architecture
The application is a full stack web application utilizing:
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Node.js, Express, `better-sqlite3`, JSON Web Tokens (JWT)

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
