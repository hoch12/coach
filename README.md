# Coach-E

A highly personalized, aesthetic fitness and nutrition coaching platform for gyms and personal trainers.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon.tech / Render)
- **State Management:** React Query
- **Authentication:** JWT, bcryptjs

## Local Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   SECRET_KEY=your_secret_key
   DATABASE_URL=your_postgresql_connection_string
   ```
4. **Run the application:**
   ```bash
   npm run dev
   ```

## Production Deployment (Render)

1. Connect your GitHub repository to Render.
2. Create a **Web Service** for the backend.
3. Add the following **Environment Variables** in Render Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon.tech or Render DB).
   - `SECRET_KEY`: A strong secret for JWT.
4. The backend will automatically initialize the database schema on startup.

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
- **Modernized Admin Dashboard**: Specialized "Manage Clients" and "Manage Trainers" sections with responsive communication hub.
- **Trainer Intelligence**: Dashboard for trainers to monitor assigned clients' workout logs, nutrition history, and tracking metrics.
- **Advanced Localization**: Industry-standard Czech/English support across the entire platform, including all management interfaces.
- **Session Booking**: Clients can book training sessions; trainers approve or decline them via integrated calendar.
- **Messaging**: Professional dual-pane chat system for direct communication between all roles.
- **Extreme Personalization Engine**: A professional-grade, data-driven system that transforms onboarding inputs into ultra-tailored training, nutrition, and lifestyle journeys. It utilizes a 250+ item database of exercises and meals, adapting strictly to health limitations, exact equipment availability (Gym/Home/Outdoor), and precise training frequencies (1-7 days).

## Deployment Details
The application uses a dynamic API routing utility (`getApiUrl`) which automatically switches between the local Vite proxy (development) and the production Render backend based on the environment. This ensures cross-origin compatibility when hosted on GitHub Pages.

For detailed deployment steps, see:
- [GitHub Pages Guide](https://hoch12.github.io/coach/github_pages_guide.md) (or local file)
- [Database Hosting Guide](https://hoch12.github.io/coach/database_hosting_guide.md) (or local file)
