# Urban Voice App

A full-stack web application for urban community reporting and announcements. Report incidents, view maps, and stay connected with your community in real-time.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Leaflet Maps, Recharts
- **Backend**: Node.js, Express.js, MySQL2
- **Features**: Authentication (JWT), Internationalization (i18n), File uploads, Real-time notifications

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **MySQL** (v8 or higher)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

# Create a MySQL database for the project:
```bash
cd server
cd db_dump

mysql -u root -p < dump.sql
```

Run the seed scripts to populate initial data:

```bash
cd ..
cd seeds
node seed.js
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory with your database configuration:

```bash
# server/.env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=urban_voice_app
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## Startup Instructions

### Development Mode

Start both client and server in development mode:

**Terminal 1 - Start the backend:**
```bash
cd server
npm start
# or use nodemon for auto-reload
npx nodemon server.js
```

The server will run on `http://localhost:5000`

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173` (or the port shown in your terminal)

### Production Build

```bash
# Build the client
cd client
npm run build
cd ..

# Start the server (make sure it's configured to serve static files from client/dist)
cd server
npm start
```

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Server
- `npx nodemon server.js` - Start with auto-reload (development)
- `node server.js` - Start server (production)

## Project Structure

```
urban_voice_app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth, Notifications)
│   │   ├── api.ts         # API calls
│   │   └── i18n.js        # i18n configuration
│   └── public/
│       └── locales/       # Translation files (en, es, it)
├── server/                # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── seeds/             # Database seed scripts
│   └── server.js          # Main server file
└── package.json
```

## Features

- 🗺️ Interactive map with incident markers
- 👤 User authentication and authorization
- 📢 Announcements and reports
- 📊 Statistics dashboard (Admin)
- 🌍 Multi-language support (English, Spanish, Italian)
- 📱 Responsive design
- 🔔 Real-time notifications

## Troubleshooting

### Port already in use
If port 5000 or 5173 is already in use, you can specify a different port:
```bash
# For server
PORT=5001 npm start

# For client (Vite)
npm run dev -- --port 5174
```

### Database connection error
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database is created: `CREATE DATABASE urban_voice_app;`

### Dependencies not installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## License

ISC
