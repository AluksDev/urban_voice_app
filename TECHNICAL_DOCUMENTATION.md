# Urban Voice App - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-04-28  
**Repository:** https://github.com/AluksDev/urban_voice_app

---

## 1. Project Overview

**Urban Voice App** is a full-stack web application designed for urban community reporting and incident management. The platform enables citizens to report incidents, view real-time updates on interactive maps, and stay connected with their communities through announcements and notifications.

### Key Objectives
- Facilitate community reporting of incidents and events
- Provide real-time map visualization of reports
- Enable multi-language support for diverse communities
- Implement secure user authentication and authorization
- Deliver responsive, accessible user interfaces
- Support administrative dashboards for statistics and moderation

---

## 2. Technology Stack

### Frontend (55.5% TypeScript, 23.7% CSS, 20.4% JavaScript, 0.4% HTML)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0-rc.1 | Core UI library |
| **TypeScript** | ~5.9.3 | Type-safe JavaScript |
| **Vite** | ^7.1.7 | Build tool & dev server |
| **React Router DOM** | ^7.9.6 | Client-side routing |
| **Leaflet** | ^1.9.4 | Interactive map library |
| **React Leaflet** | ^5.0.0-rc.2 | React wrapper for Leaflet |
| **Recharts** | ^3.5.1 | Data visualization charts |
| **i18next** | ^25.7.2 | Internationalization framework |
| **React i18next** | ^16.4.1 | React i18n integration |
| **React Select** | ^5.10.2 | Customizable select component |
| **React Slot Counter** | ^3.3.2 | Animated number counter |

**Development Tools:**
- ESLint with TypeScript support
- TypeScript ESLint for type-aware linting
- React Refresh for HMR (Hot Module Replacement)

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | v16+ | Runtime environment |
| **Express.js** | ^5.1.0 | Web framework |
| **MySQL2** | ^3.15.3 | Database driver with Promises |
| **JWT (jsonwebtoken)** | ^9.0.2 | Authentication tokens |
| **bcryptjs** | ^3.0.3 | Password hashing |
| **Multer** | ^2.0.2 | File upload middleware |
| **CORS** | ^2.8.5 | Cross-origin requests handling |
| **dotenv** | ^17.2.3 | Environment variable management |
| **Validator** | ^13.15.23 | Input validation |
| **Cookie Parser** | ^1.4.7 | Cookie handling |
| **Nodemon** | ^3.1.11 | Development auto-reload |

### Database

| Component | Specification |
|-----------|---------------|
| **DBMS** | MySQL 8.0+ |
| **Connection Pool** | MySQL2 with Promise support |
| **Charset** | UTF-8 (default) |

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React/TypeScript)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages: Reports, Map, Dashboard, Announcements, Admin     │   │
│  │ Components: Reusable UI elements                          │   │
│  │ Context: Auth, Notifications                             │   │
│  │ Routing: React Router v7                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│                    API Calls (HTTP/REST)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js/Node.js)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes:                                                   │   │
│  │  - /auth (Login, Register, Logout)                       │   │
│  │  - /reports (Create, Read, Update)                       │   │
│  │  - /locations (Location data)                            │   │
│  │  - /stats (Statistics dashboard)                         │   │
│  │  - /api (General API endpoints)                          │   │
│  │  - /user (User profile management)                       │   │
│  │  - /admin (Admin operations)                             │   │
│  │  - /announcements (Community announcements)              │   │
│  │                                                           │   │
│  │ Middlewares:                                              │   │
│  │  - CORS validation                                        │   │
│  │  - Cookie Parser                                          │   │
│  │  - Authentication/Authorization                          │   │
│  │  - File Upload (Multer)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│                      MySQL Connection Pool                       │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL 8.0+)                         │
│  Tables: users, reports, locations, announcements, stats, etc.   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Project Structure

```
urban_voice_app/
├── client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MapComponent.tsx
│   │   │   ├── ReportForm.tsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── Home.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Map.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Admin.tsx
│   │   │   └── ...
│   │   │
│   │   ├── context/                 # React Context (State Management)
│   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   ├── NotificationContext.tsx  # Notifications
│   │   │   └── ...
│   │   │
│   │   ├── api.ts                   # API client (HTTP calls)
│   │   ├── i18n.js                  # Internationalization config
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   │
│   ├── public/
│   │   ├── locales/                 # Translation files
│   │   │   ├── en/
│   │   │   │   └── translation.json
│   │   │   ├── es/
│   │   │   │   └── translation.json
│   │   │   └── it/
│   │   │       └── translation.json
│   │   └── ...
│   │
│   ├── package.json                 # Client dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── vite.config.ts               # Vite configuration
│   └── eslint.config.js             # ESLint configuration
│
├── server/                          # Express.js Backend
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   └── ...
│   │
│   ├── routes/                      # API routes
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── reports.js               # Report management
│   │   ├── locations.js             # Location data
│   │   ├── stats.js                 # Statistics
│   │   ├── api.js                   # General API routes
│   │   ├── user.js                  # User management
│   │   ├── admin.js                 # Admin endpoints
│   │   └── announcements.js         # Announcements
│   │
│   ├── middlewares/                 # Custom Express middlewares
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── validationMiddleware.js  # Input validation
│   │   └── ...
│   │
│   ├── seeds/                       # Database initialization scripts
│   │   ├── seedUsers.js
│   │   ├── seedReports.js
│   │   ├── seedLocations.js
│   │   └── ...
│   │
│   ├── uploads/                     # Uploaded files directory
│   │
│   ├── server.js                    # Main server entry point
│   ├── package.json                 # Server dependencies
│   └── .env                         # Environment configuration (not in repo)
│
└── package.json                     # Root workspace config
```

---

## 4. Detailed Architecture

### 4.1 Server Architecture (Express.js)

#### Core Setup (`server.js`)

```javascript
// Environment configuration
require('dotenv').config();

// Middleware stack
- CORS: Dynamic allowed origins
- express.json(): Parse JSON payloads
- cookieParser: Handle cookies
- Static file serving: /uploads endpoint

// Connection pool
- MySQL2 with promise support
- Connection pooling for performance
- Database pooling middleware injection

// Route mounting
- /auth: Authentication (login, register)
- /reports: Incident/report management
- /locations: Location data
- /stats: Analytics and statistics
- /api: General API endpoints
- /user: User profile and settings
- /admin: Administrative functions
- /announcements: Community announcements

// Server configuration
- Dynamic CORS origins for dev/staging
- Credentials enabled for cookie handling
- File upload support via uploads directory
```

#### CORS Configuration

The application implements domain-based CORS validation:

```javascript
Allowed Origins (Configurable):
- http://localhost:5173 (Local development)
- http://192.168.56.1:5173 (VM/Network dev)
- http://172.22.111.62:5173 (Docker/Container dev)
- http://192.168.1.33:5173 (Local network)
```

### 4.2 Authentication & Security

#### JWT-Based Authentication
- **Token Generation:** On login, server generates JWT tokens
- **Token Verification:** Middleware validates tokens on protected routes
- **Password Security:** bcryptjs for secure password hashing
- **Token Storage:** Client-side (likely localStorage or sessionStorage)

#### Protected Routes Pattern
```
1. Client sends credentials to /auth/login
2. Server validates and returns JWT token
3. Client includes token in Authorization header
4. Middleware verifies token before processing request
5. Unauthorized requests return 401/403
```

### 4.3 Database Layer

#### Connection Management
- **Connection Pool:** MySQL2 with pooling
- **Promise Support:** Async/await patterns
- **Request Injection:** Pool injected via middleware

#### Database Initialization
```bash
# Create database
CREATE DATABASE urban_voice_app;

# Seed initial data
node seeds/seedUsers.js
node seeds/seedReports.js
node seeds/seedLocations.js
```

---

## 5. Frontend Architecture

### 5.1 React Component Structure

#### Page Components
- **Home:** Landing page
- **Reports:** List and filter reports
- **Map:** Interactive map visualization
- **Dashboard:** User dashboard with statistics
- **Admin:** Admin control panel
- **Announcements:** Community announcements view

#### Shared Components
- **Header/Navigation:** Top navigation bar
- **MapComponent:** Reusable Leaflet map integration
- **ReportForm:** Form for creating/editing reports
- **Footer:** Site footer

### 5.2 State Management

#### Context API Usage
- **AuthContext:** User authentication state
  - Current user
  - Authentication status
  - Login/logout actions
  - Token management

- **NotificationContext:** Real-time notifications
  - Notification list
  - Toast messages
  - Notification permissions

### 5.3 Routing Strategy

**React Router v7** handles client-side routing:
```
/                    → Home page
/reports             → Reports list
/map                 → Map view
/dashboard           → User dashboard
/admin               → Admin panel
/announcements       → Announcements
/auth                → Login/Register
```

### 5.4 Internationalization (i18n)

**Supported Languages:** English, Spanish, Italian

**i18next Configuration:**
- HTTP backend loading translations from `/public/locales`
- React i18next integration for component translations
- Language detection and switching

**Translation Files Location:**
```
client/public/locales/
├── en/translation.json
├── es/translation.json
└── it/translation.json
```

---

## 6. Key Features & Implementation

### 6.1 Incident Reporting System

**Workflow:**
1. User fills report form with:
   - Title and description
   - Location (coordinates or map selection)
   - Category (incident type)
   - Optional file attachments

2. Form validation with `validator.js`

3. POST to `/reports` endpoint

4. Server stores in database and returns report ID

5. Client receives confirmation

### 6.2 Interactive Map

**Technologies:**
- **Leaflet:** Core mapping library
- **React Leaflet:** React component wrappers
- **Features:**
  - Incident markers with popups
  - Location clustering
  - Custom map tiles
  - Real-time marker updates

### 6.3 Statistics & Analytics

**Dashboard Features:**
- Report count trends
- Category distribution (Recharts)
- Geographic hotspots
- Admin statistics endpoint `/stats`

### 6.4 File Upload Management

**Multer Configuration:**
- Upload destination: `server/uploads/`
- Static serving: `/uploads` endpoint
- File validation and size limits
- Integration with report system

### 6.5 Multi-Language Support

**Implementation:**
- i18next for key-value translation
- Language selector in UI
- Persistent language preference (localStorage)
- Dynamic component text translation

---

## 7. API Endpoints

### Authentication Routes (`/auth`)
```
POST   /auth/register        Register new user
POST   /auth/login           Authenticate user
POST   /auth/logout          Logout user
GET    /auth/verify          Verify JWT token
POST   /auth/refresh         Refresh JWT token
```

### Report Routes (`/reports`)
```
GET    /reports              List all reports
POST   /reports              Create new report
GET    /reports/:id          Get report details
PUT    /reports/:id          Update report
DELETE /reports/:id          Delete report
GET    /reports/filter       Filter reports by criteria
```

### Location Routes (`/locations`)
```
GET    /locations            Get all locations
GET    /locations/:id        Get location details
POST   /locations            Create location
```

### Statistics Routes (`/stats`)
```
GET    /stats/dashboard      Dashboard statistics
GET    /stats/reports        Report statistics
GET    /stats/geographic     Geographic data
```

### User Routes (`/user`)
```
GET    /user/profile         Get user profile
PUT    /user/profile         Update user profile
GET    /user/reports         User's own reports
```

### Admin Routes (`/admin`)
```
GET    /admin/users          List all users
GET    /admin/reports        All reports (moderation)
PUT    /admin/reports/:id    Moderate report
DELETE /admin/users/:id      Delete user
```

### Announcement Routes (`/announcements`)
```
GET    /announcements        List announcements
POST   /announcements        Create announcement
PUT    /announcements/:id    Update announcement
DELETE /announcements/:id    Delete announcement
```

---

## 8. Development Workflow

### 8.1 Environment Setup

**Requirements:**
- Node.js v16 or higher
- npm (included with Node.js)
- MySQL 8.0 or higher
- Git

**Environment Configuration (`server/.env`):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=urban_voice_app
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

### 8.2 Installation

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

### 8.3 Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE urban_voice_app;
USE urban_voice_app;

# Seed data
cd server
node seeds/seedUsers.js
node seeds/seedReports.js
node seeds/seedLocations.js
```

### 8.4 Running Development Server

**Terminal 1 - Backend:**
```bash
cd server
npm nodemon server.js
# or
npm start
```
Runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Runs on: `http://localhost:5173`

### 8.5 Building for Production

```bash
# Build frontend
cd client
npm run build

# Output in client/dist/

# Server configuration
# Update CORS origins in server.js for production domains
```

---

## 9. Performance & Optimization

### Frontend Optimization
- **Code Splitting:** Vite automatic chunking
- **Lazy Loading:** Route-based component splitting
- **Tree Shaking:** Unused code elimination
- **Asset Optimization:** Image and file minification

### Backend Optimization
- **Connection Pooling:** MySQL2 pooling for concurrent requests
- **Caching:** Potential Redis integration (not currently implemented)
- **Pagination:** For large result sets
- **Indexing:** Database indices on frequently queried columns

### Map Performance
- **Marker Clustering:** Leaflet clustering for many pins
- **Lazy Rendering:** Only render visible map tiles
- **Debouncing:** Map interaction throttling

---

## 10. Security Considerations

### Authentication & Authorization
✓ JWT token-based authentication
✓ Password hashing with bcryptjs
✓ CORS protection
✓ HTTP-only cookie support

### Input Validation
✓ Server-side validation with `validator.js`
✓ Data type checking
✓ SQL injection prevention via parameterized queries (MySQL2)

### File Upload Security
- File size limits (via Multer)
- File type validation needed
- Secure file storage outside web root recommended

### HTTPS/TLS
⚠ Not implemented in development
✓ Required for production deployment

---

## 11. Testing & Quality Assurance

### Code Quality Tools
- **ESLint:** JavaScript/TypeScript linting
- **TypeScript:** Static type checking

### Testing Strategy
⚠ **Note:** Current implementation lacks automated tests
- **Recommended:** Jest for unit tests
- **Recommended:** React Testing Library for component tests
- **Recommended:** Supertest for API endpoint tests

---

## 12. Deployment & DevOps

### Prerequisites for Deployment
1. Node.js v16+ on production server
2. MySQL 8.0+ database instance
3. Reverse proxy (Nginx/Apache) for production
4. SSL/TLS certificates
5. Process manager (PM2 recommended)

### Production Setup Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update database credentials in `.env`
- [ ] Update CORS allowed origins
- [ ] Generate strong JWT secret
- [ ] Set up SSL/TLS
- [ ] Configure file upload directory with proper permissions
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Implement rate limiting
- [ ] Set up health checks

### Process Management (PM2)
```bash
npm install -g pm2

# Start application
pm2 start server.js --name "urban-voice"

# Save configuration
pm2 save

# Enable startup on reboot
pm2 startup
```

---

## 13. Known Limitations & Future Enhancements

### Current Limitations
1. **No automated tests:** Add Jest & React Testing Library
2. **No caching layer:** Consider Redis implementation
3. **Limited error handling:** Standardize error responses
4. **No rate limiting:** Prevent API abuse
5. **No logging system:** Implement structured logging (Winston/Pino)
6. **No email notifications:** Would require email service integration

### Recommended Enhancements
1. **Real-time features:** WebSocket integration (Socket.io)
2. **Image optimization:** Implement image compression
3. **Search functionality:** Full-text search on reports
4. **Advanced filtering:** Complex query building
5. **Data export:** CSV/PDF export capabilities
6. **Mobile app:** React Native version
7. **Analytics:** Detailed user behavior tracking
8. **API documentation:** Swagger/OpenAPI spec

---

## 14. Troubleshooting Guide

### Port Already in Use
```bash
# Backend port 5000
PORT=5001 npm start

# Frontend port 5173
npm run dev -- --port 5174
```

### Database Connection Error
1. Verify MySQL is running: `mysql -u root -p`
2. Check `.env` credentials
3. Ensure database exists: `CREATE DATABASE urban_voice_app;`
4. Verify user permissions

### Dependencies Not Installing
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
1. Check allowed origins in `server.js`
2. Verify client URL matches allowed list
3. Check browser console for specific error

### Build Errors
1. Run TypeScript check: `tsc --noEmit`
2. Run ESLint: `npm run lint`
3. Clear Vite cache: `rm -rf .vite`

---

## 15. Contributing Guidelines

### Code Style
- Follow ESLint configuration
- Use TypeScript for type safety
- Follow existing naming conventions
- Add comments for complex logic

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks
```

### Pull Request Process
1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to remote: `git push origin feature/name`
4. Create Pull Request with description
5. Address review feedback
6. Merge when approved

---

## 16. Support & Resources

### Documentation
- Repository README: See `/README.md`
- React Documentation: https://react.dev
- Express.js Docs: https://expressjs.com
- MySQL Documentation: https://dev.mysql.com/doc
- Leaflet Documentation: https://leafletjs.com

### Getting Help
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Community discussions
- Code Search: Search repository code

---

## 17. License & Attribution

**License:** ISC  
**Repository:** https://github.com/AluksDev/urban_voice_app  
**Owner:** AluksDev

---

**Document Version:** 1.0.0  
**Last Generated:** 2026-04-28  
**Status:** Complete