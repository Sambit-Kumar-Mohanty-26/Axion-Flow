# 🏭 Axion Flow

**The AI Command Center for Your Factory**

Axion Flow is an intelligent factory operations management platform that transforms operational chaos into predictable, optimized workflow. Our platform provides a live digital twin to predict disruptions, intelligently guide decisions, and maximize productivity through AI-powered task allocation, real-time worker tracking, and advanced analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Docker Deployment](#docker-deployment)
  - [Manual Setup](#manual-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Core Features Deep Dive](#core-features-deep-dive)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [AI Service Details](#ai-service-details)
- [Real-Time Communication](#real-time-communication)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Axion Flow addresses critical challenges in factory floor management by providing:

- **Digital Twin Visualization**: Real-time 3D/2D representation of your factory floor
- **AI-Powered Task Allocation**: Multi-criteria decision making (MCDM) for optimal worker-task matching
- **Live Worker Tracking**: Real-time location monitoring and status updates
- **Predictive Analytics**: Fatigue monitoring and disruption prediction
- **Safety Management**: SOS alerts, safety checks, and incident response
- **Role-Based Access Control**: Separate interfaces for admins, managers, and workers
- **Real-Time Collaboration**: WebSocket-based live updates across all connected clients

---

## ✨ Key Features

### For Factory Managers
- **Interactive Factory Layout Designer**: Drag-and-drop interface to design factory floor with obstacles
- **AI-Powered Worker Assignment**: Automatic worker recommendations based on skills, fatigue, and proximity
- **Real-Time Dashboard**: Live metrics on worker status, task progress, and factory efficiency
- **Task Management**: Create, assign, track, and prioritize tasks with skill requirements
- **Worker Performance Analytics**: Track productivity, fatigue levels, and task completion rates
- **Alert System**: Real-time notifications for critical events and SOS signals
- **Pathfinding Visualization**: A* algorithm visualization for optimal worker routing
- **Heatmap Analytics**: Worker movement patterns and utilization zones

### For Organization Admins
- **Multi-Factory Management**: Oversee multiple factories from a single dashboard
- **Team Invitation System**: Invite factory managers and workers via email
- **User Approval Workflow**: Review and approve new user registrations
- **Organization-Wide Analytics**: Cross-factory performance metrics
- **Access Control Management**: Assign and modify user roles and permissions

### For Workers
- **Mobile-First Interface**: Optimized for tablets and mobile devices on factory floor
- **Task View & Updates**: View assigned tasks with real-time status updates
- **SOS Emergency Button**: One-click emergency alert system
- **Safety Check Integration**: Computer vision-based safety gear detection
- **Location Sharing**: Real-time position tracking (privacy-controlled)
- **Break Management**: Self-service break status updates

### Advanced Features
- **Computer Vision Integration**: TensorFlow.js COCO-SSD for safety equipment detection
- **3D Visualization**: Three.js-powered immersive factory view
- **Skill-Based Routing**: Match tasks with worker competencies and proficiency levels
- **Fatigue Management**: Predictive alerts for worker exhaustion
- **Historical Data Analysis**: Time-series tracking of worker locations and productivity
- **Excel Data Import/Export**: Bulk operations with XLSX support

---

## 🏗️ Architecture

Axion Flow follows a **microservices architecture** with three primary services:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Dashboard                    │
│         (React 19 + TypeScript + Vite)                  │
│     Port: 5173 | WebSocket Client | 3D Rendering       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WS
┌────────────────────┴────────────────────────────────────┐
│                    Backend API                           │
│      (Node.js + Express + Prisma + TypeScript)         │
│    Port: 10000 | REST API | WebSocket Server           │
└────────────────────┬──────────────┬─────────────────────┘
                     │              │ HTTP
                     │              └──────────────────────┐
                     │ PostgreSQL                          │
                     │ Port: 5433                  ┌───────▼──────┐
                     │                             │  AI Service  │
         ┌───────────▼──────────┐                 │   (FastAPI)  │
         │   PostgreSQL DB      │                 │  Port: 8000  │
         │   (Prisma ORM)       │                 │    Python    │
         └──────────────────────┘                 └──────────────┘
```

### Service Communication
- **Frontend ↔ Backend**: REST API (axios) + WebSocket (Socket.IO)
- **Backend ↔ AI Service**: HTTP REST API (axios)
- **Backend ↔ Database**: Prisma ORM with type-safe queries
- **Real-Time Updates**: Socket.IO for bidirectional event-based communication

---

## 💻 Tech Stack

### Frontend Dashboard
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.1.7 | Build tool and dev server |
| React Router | 7.9.3 | Client-side routing |
| Three.js | 0.182.0 | 3D visualization |
| React Three Fiber | 9.4.2 | React renderer for Three.js |
| TensorFlow.js | 4.22.0 | Computer vision (COCO-SSD) |
| Framer Motion | 12.23.22 | Animations |
| Chart.js | 4.5.0 | Data visualization |
| Recharts | 3.6.0 | Advanced charting |
| Socket.IO Client | 4.8.1 | Real-time communication |
| Axios | 1.12.2 | HTTP client |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Lucide React | 0.544.0 | Icon library |

### Backend API
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime environment |
| Express | 5.1.0 | Web framework |
| TypeScript | 5.9.2 | Type safety |
| Prisma | 5.10.2 | Database ORM |
| Socket.IO | 4.8.1 | WebSocket server |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 3.0.2 | Password hashing |
| Pathfinding | 0.4.18 | A* algorithm |
| Nodemailer | 7.0.11 | Email service |
| SendGrid | 8.1.6 | Email delivery |

### AI Service
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.x | Runtime |
| FastAPI | 0.118.0 | API framework |
| Uvicorn | 0.37.0 | ASGI server |
| Pandas | 2.3.2 | Data manipulation |
| NumPy | 2.3.3 | Numerical computing |
| Scikit-learn | 1.7.2 | Machine learning |
| Pydantic | 2.11.9 | Data validation |

### Infrastructure
- **Database**: PostgreSQL 14
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com (configured with render.yaml)
- **Development**: Nodemon, ts-node-dev

---

## 📦 Prerequisites

### For Docker Deployment
- Docker Engine 20.10+
- Docker Compose 1.29+

### For Manual Setup
- Node.js 18+ and npm 9+
- Python 3.10+
- PostgreSQL 14+
- Git

---

## 🚀 Installation

### Docker Deployment (Recommended)

**1. Clone the repository**
```bash
git clone https://github.com/Sambit-Kumar-Mohanty-26/Axion-Flow.git
cd Axion-Flow
```

**2. Configure environment variables**

Create `.env` file in `backend-api/`:
```env
# Database
DATABASE_URL="postgresql://admin:password123@postgres-db:5432/axionflow"

# Server
PORT=10000
NODE_ENV=production

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@axionflow.com"

# AI Service
AI_SERVICE_URL="http://ai-service:8000"

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:5173"
```

**3. Build and run with Docker Compose**
```bash
docker-compose up --build
```

**4. Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:10000
- AI Service: http://localhost:8000
- PostgreSQL: localhost:5433

### Manual Setup

#### Backend API Setup

**1. Navigate to backend directory**
```bash
cd backend-api
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**
Create `.env` file (see Docker section for template)

**4. Setup database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or create new migration
npx prisma migrate dev --name init
```

**5. Build TypeScript**
```bash
npm run build
```

**6. Start the server**
```bash
# Production
npm start

# Development (with hot reload)
npm run dev
```

#### AI Service Setup

**1. Navigate to AI service directory**
```bash
cd ai-service
```

**2. Create virtual environment**
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Start the service**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

**1. Navigate to frontend directory**
```bash
cd frontend-dashboard
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure API endpoint**
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:10000
VITE_WS_URL=http://localhost:10000
```

**4. Start development server**
```bash
npm run dev
```

**5. Build for production**
```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `PORT` | Server port | 10000 | ❌ |
| `JWT_SECRET` | Secret key for JWT signing | - | ✅ |
| `SENDGRID_API_KEY` | SendGrid API key for emails | - | ✅ |
| `FROM_EMAIL` | Sender email address | - | ✅ |
| `AI_SERVICE_URL` | AI service endpoint | http://ai-service:8000 | ✅ |
| `FRONTEND_URL` | Frontend URL for email links | - | ✅ |
| `NODE_ENV` | Environment (development/production) | development | ❌ |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |
| `VITE_WS_URL` | WebSocket server URL | ✅ |

---

## 🗄️ Database Setup

### Schema Overview

The database consists of 11 core models:

1. **Organization**: Top-level entity representing companies
2. **Factory**: Individual factory/facility within an organization
3. **User**: System users (admins, managers, workers)
4. **Worker**: Factory floor workers with location and status
5. **Task**: Work items that need to be completed
6. **Skill**: Worker competencies
7. **WorkerSkill**: Many-to-many relationship with proficiency levels
8. **Invitation**: Email-based user invitations
9. **LocationLog**: Time-series worker location data
10. **Alert**: System notifications and warnings

### Key Relationships

```
Organization (1) ──→ (N) Factory
Organization (1) ──→ (N) User
Factory (1) ──→ (N) User
Factory (1) ──→ (N) Worker
Factory (1) ──→ (N) Task
Factory (1) ──→ (N) Skill
Worker (N) ←──→ (N) Skill (via WorkerSkill)
Worker (N) ←──→ (N) Task
User (1) ──→ (0..1) Worker
```

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Format schema
npx prisma format
```

### Database Migrations

The migration workflow:
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_changes`
3. Prisma generates migration SQL and updates client
4. Commit both schema and migration files

---

## 🎬 Running the Application

### Docker Compose (All Services)

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
```

### Individual Services

**Backend API**
```bash
cd backend-api
npm run dev        # Development with hot reload
npm start          # Production
npm run build      # Build TypeScript
```

**AI Service**
```bash
cd ai-service
uvicorn main:app --reload        # Development
uvicorn main:app --host 0.0.0.0 --port 8000  # Production
```

**Frontend**
```bash
cd frontend-dashboard
npm run dev        # Development server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 📁 Project Structure

```
Axion-Flow/
├── backend-api/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, validation
│   │   ├── utils/              # Helper functions
│   │   └── index.ts            # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                 # Python FastAPI service
│   ├── main.py                # AI recommendation engine
│   ├── requirements.txt
│   ├── Dockerfile
│   └── venv/
│
├── frontend-dashboard/         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── 3d/          # Three.js components
│   │   │   ├── dashboard/   # Dashboard widgets
│   │   │   ├── layout/      # Layout components
│   │   │   ├── modals/      # Modal dialogs
│   │   │   └── ui/          # UI primitives
│   │   ├── pages/            # Route pages
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── manager/     # Manager pages
│   │   │   └── worker/      # Worker pages
│   │   ├── sections/         # Landing page sections
│   │   ├── api/              # API client functions
│   │   ├── context/          # React context providers
│   │   ├── assets/           # Images, fonts
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml          # Multi-container orchestration
├── render.yaml                 # Render.com deployment config
├── package.json                # Root package file
├── LICENSE
└── README.md
```

---

## 🔍 Core Features Deep Dive

### 1. AI-Powered Worker Recommendation

**Algorithm**: Multi-Criteria Decision Making (MCDM)

The AI service evaluates workers based on three weighted criteria:

```python
# Scoring Formula
total_score = (skill_score × 0.5) + (fatigue_score × 0.3) + (distance_score × 0.2)
```

**Criteria Breakdown:**

- **Skill Match (50% weight)**: 
  - Checks if worker has required skill
  - Normalizes proficiency level (1-5 scale)
  - Workers without required skill are excluded
  
- **Fatigue Level (30% weight)**:
  - Inverted fatigue: `1.0 - current_fatigue`
  - Prevents overworking exhausted workers
  
- **Proximity (20% weight)**:
  - Euclidean distance from worker to task
  - Normalized by maximum possible distance (141 units diagonal)
  - Prioritizes nearby workers

**API Endpoint**: `POST /api/recommend_worker`

**Request Format**:
```json
{
  "task": {
    "id": "task_id",
    "description": "Assemble Widget A",
    "priority": "HIGH",
    "requiredSkillId": "skill_xyz",
    "location_x": 45.5,
    "location_y": 60.2
  },
  "available_workers": [
    {
      "id": "worker_1",
      "name": "John Doe",
      "status": "AVAILABLE",
      "fatigueLevel": 0.3,
      "location_x": 50.0,
      "location_y": 55.0,
      "skills": [
        {
          "skill": { "id": "skill_xyz", "name": "Assembly" },
          "proficiency": 4
        }
      ]
    }
  ]
}
```

**Response Format**:
```json
{
  "recommended_worker_id": "worker_1",
  "worker_name": "John Doe",
  "score": 0.823
}
```

### 2. Real-Time Location Tracking

**Technology**: Socket.IO + LocationLog database model

**Features**:
- Sub-second position updates via WebSocket
- Historical breadcrumb trail visualization
- Heatmap generation for worker utilization analysis
- Automatic timestamping for audit trails

**Worker Location Update Flow**:
1. Worker device sends location update via WebSocket
2. Backend validates authentication and factory membership
3. Updates Worker model `location_x` and `location_y`
4. Creates LocationLog entry for historical tracking
5. Broadcasts update to all connected managers
6. Frontend updates 3D/2D visualizations in real-time

**Socket Events**:
```typescript
// Client → Server
socket.emit('worker:location:update', {
  workerId: 'worker_123',
  x: 45.5,
  y: 60.2
});

// Server → Clients (broadcast)
socket.emit('worker:location:changed', {
  workerId: 'worker_123',
  x: 45.5,
  y: 60.2,
  status: 'ON_TASK',
  timestamp: '2026-01-14T10:20:00Z'
});
```

### 3. Interactive Factory Layout Designer

**Technology**: React DnD + Canvas API

**Capabilities**:
- Drag-and-drop obstacle placement
- Grid-based positioning system (100×100 units)
- Configurable obstacle sizes
- JSON-serialized layout storage in database
- Undo/redo functionality
- Zoom and pan controls

**Layout Data Structure**:
```json
{
  "obstacles": [
    {
      "id": "obs_1",
      "x": 20,
      "y": 30,
      "width": 15,
      "height": 10,
      "type": "machine",
      "label": "CNC Machine"
    }
  ],
  "workers": [],
  "tasks": []
}
```

**Saved in**: `Factory.layout` (JSON column in PostgreSQL)

### 4. Pathfinding with A* Algorithm

**Library**: `pathfinding` npm package

**Use Case**: Calculate optimal routes for workers to tasks while avoiding obstacles

**Implementation**:
```typescript
import PF from 'pathfinding';

const grid = new PF.Grid(100, 100); // Factory dimensions

// Mark obstacles as unwalkable
obstacles.forEach(obs => {
  for (let x = obs.x; x < obs.x + obs.width; x++) {
    for (let y = obs.y; y < obs.y + obs.height; y++) {
      grid.setWalkableAt(x, y, false);
    }
  }
});

const finder = new PF.AStarFinder();
const path = finder.findPath(
  startX, startY,
  goalX, goalY,
  grid
);
```

**Visualization**: Animated path overlay on factory layout

### 5. Computer Vision Safety Detection

**Model**: COCO-SSD (TensorFlow.js)

**Detection Capabilities**:
- Hard hat detection
- Safety vest identification
- Person detection for headcount
- Real-time camera feed analysis

**Implementation**:
```typescript
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

// Load model
const model = await cocoSsd.load();

// Analyze webcam frame
const predictions = await model.detect(videoElement);

// Filter safety gear
const safetyGear = predictions.filter(pred => 
  ['person', 'hardhat', 'vest'].includes(pred.class)
);

// Update worker safety status
if (safetyGear.length > 0) {
  updateWorkerSafetyStatus(workerId, 'COMPLIANT');
}
```

**Triggers**: Automated safety checks every 30 seconds for active workers

### 6. Task Priority System

**Priority Levels**:
- `CRITICAL`: Urgent, production-blocking issues
- `HIGH`: Important, time-sensitive tasks
- `MEDIUM`: Standard operational tasks
- `LOW`: Non-urgent maintenance or optimization

**Prioritization Logic**:
1. CRITICAL tasks always shown first in lists
2. Within same priority, sorted by creation time
3. Manager can manually adjust priorities
4. System suggests priority based on keywords (future enhancement)

### 7. Multi-Role Authentication

**Roles**:
- `ORG_ADMIN`: Full system access, multi-factory oversight
- `FACTORY_MANAGER`: Single factory management, worker oversight
- `WORKER`: Task execution, limited read-only access

**JWT Structure**:
```json
{
  "userId": "user_123",
  "email": "manager@example.com",
  "role": "FACTORY_MANAGER",
  "factoryId": "factory_456",
  "organizationId": "org_789",
  "iat": 1705226400,
  "exp": 1705312800
}
```

**Protected Routes** (Frontend):
```typescript
<Route path="/manager/*" element={
  <ProtectedRoute allowedRoles={['FACTORY_MANAGER', 'ORG_ADMIN']} />
}>
  <Route path="dashboard" element={<ManagerDashboard />} />
</Route>
```

**Middleware** (Backend):
```typescript
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### 8. Email Invitation System

**Flow**:
1. Admin/Manager enters email and role
2. Backend generates unique invitation token
3. Sends invitation email via SendGrid with activation link
4. Recipient clicks link → routed to password setup page
5. User creates password → account activated
6. Admin approves user (if approval workflow enabled)

**Invitation Expiry**: 7 days from creation

**Email Template** (conceptual):
```html
Hi there!

You've been invited to join [Factory Name] on Axion Flow as a [ROLE].

Click here to set up your account:
https://axionflow.com/accept-invite?token=UNIQUE_TOKEN

This invitation expires in 7 days.
```

### 9. Real-Time Alert System

**Alert Types**:
- `INFO`: Routine notifications (task completed, worker checked in)
- `WARNING`: Elevated concerns (high fatigue detected, task overdue)
- `CRITICAL`: Emergency situations (SOS activated, safety violation)

**Database Schema**:
```prisma
model Alert {
  id        String   @id @default(cuid())
  type      String   // 'INFO', 'WARNING', 'CRITICAL'
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  factoryId String
  factory   Factory  @relation(...)
}
```

**Notification Delivery**:
- In-app notification bell (real-time count)
- WebSocket push to connected managers
- Email notifications for CRITICAL alerts (configurable)
- Badge indicators on dashboard

**Socket Event**:
```typescript
socket.emit('alert:new', {
  id: 'alert_123',
  type: 'CRITICAL',
  message: 'Worker John Doe activated SOS at Station 5',
  factoryId: 'factory_456',
  createdAt: new Date().toISOString()
});
```

### 10. SOS Emergency System

**Components**:
- Worker interface: Large red SOS button
- Backend: Instant alert creation and broadcast
- Manager interface: Audio alarm + visual indicator
- Location capture: Automatic snapshot of worker position

**Activation Flow**:
1. Worker presses SOS button
2. Frontend sends `POST /api/workers/:id/sos`
3. Backend:
   - Sets `worker.isSOS = true`
   - Creates CRITICAL alert
   - Captures current location
   - Broadcasts to all managers via WebSocket
4. Manager dashboard:
   - Displays emergency modal
   - Plays audio alert
   - Shows worker location on map
   - Provides quick response actions

**Deactivation**:
- Manager acknowledges and resolves SOS
- Worker status returns to previous state
- Incident logged for compliance

---

## 📡 API Documentation

### Base URL
```
http://localhost:10000/api
```

### Authentication Endpoints

#### Register Organization
```http
POST /auth/register
Content-Type: application/json

{
  "organizationName": "Acme Manufacturing",
  "factoryName": "Plant #1",
  "email": "admin@acme.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "admin@acme.com",
    "role": "ORG_ADMIN",
    "factoryId": "factory_456"
  }
}
```

### Worker Endpoints

#### Get All Workers
```http
GET /workers?factoryId=factory_456
Authorization: Bearer <token>
```

#### Create Worker
```http
POST /workers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "employeeId": "EMP-001",
  "factoryId": "factory_456",
  "skills": [
    { "skillId": "skill_xyz", "proficiency": 4 }
  ]
}
```

#### Update Worker Location
```http
PATCH /workers/:workerId/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "x": 45.5,
  "y": 60.2
}
```

#### Update Worker Status
```http
PATCH /workers/:workerId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ON_BREAK"
}
```

#### Trigger SOS
```http
POST /workers/:workerId/sos
Authorization: Bearer <token>
```

### Task Endpoints

#### Get All Tasks
```http
GET /tasks?factoryId=factory_456&status=PENDING
Authorization: Bearer <token>
```

#### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Assemble Widget A",
  "priority": "HIGH",
  "requiredSkillId": "skill_xyz",
  "location_x": 45.0,
  "location_y": 60.0,
  "factoryId": "factory_456"
}
```

#### Assign Task to Worker
```http
POST /tasks/:taskId/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "workerId": "worker_123"
}
```

#### Update Task Status
```http
PATCH /tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "progress": 50
}
```

#### Get AI Worker Recommendation
```http
POST /tasks/:taskId/recommend-worker
Authorization: Bearer <token>

Response:
{
  "recommendedWorkerId": "worker_123",
  "workerName": "John Doe",
  "score": 0.823,
  "reasoning": {
    "skillMatch": 0.8,
    "fatigueScore": 0.7,
    "proximityScore": 0.95
  }
}
```

### Factory Endpoints

#### Update Factory Layout
```http
PUT /factories/:factoryId/layout
Authorization: Bearer <token>
Content-Type: application/json

{
  "obstacles": [
    {
      "id": "obs_1",
      "x": 20,
      "y": 30,
      "width": 15,
      "height": 10,
      "type": "machine"
    }
  ]
}
```

### Analytics Endpoints

#### Get Worker Location History
```http
GET /analytics/location-history?workerId=worker_123&startDate=2026-01-01&endDate=2026-01-14
Authorization: Bearer <token>
```

#### Get Factory Heatmap Data
```http
GET /analytics/heatmap?factoryId=factory_456&date=2026-01-14
Authorization: Bearer <token>
```

### Alert Endpoints

#### Get Alerts
```http
GET /alerts?factoryId=factory_456&isRead=false
Authorization: Bearer <token>
```

#### Mark Alert as Read
```http
PATCH /alerts/:alertId/read
Authorization: Bearer <token>
```

---

## 🔐 Security

### Authentication
- **JWT (JSON Web Tokens)** for stateless authentication
- Token expiration: 24 hours
- Refresh token mechanism (future enhancement)
- Secure HTTP-only cookies option (future enhancement)

### Password Security
- **bcryptjs** for password hashing (10 rounds)
- Minimum password requirements enforced:
  - 8+ characters
  - Uppercase + lowercase
  - Numbers
  - Special characters

### Authorization
- Role-based access control (RBAC)
- Middleware guards on all protected routes
- Factory-level data isolation
- Organization-level data separation

### Data Protection
- SQL injection protection via Prisma ORM
- XSS protection with React's built-in escaping
- CORS configuration for approved origins
- Environment variable secrets
- Sensitive data encryption at rest (future)

### API Security
- Rate limiting (future enhancement)
- Request validation with Pydantic (AI service)
- Input sanitization
- Error message sanitization (no stack traces in production)

---

## 🚢 Deployment

### Render.com (Configured)

The project includes a `render.yaml` blueprint for one-click deployment:

```yaml
services:
  - type: web
    name: axion-flow-backend
    env: node
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run migrate-and-start
    
  - type: web
    name: axion-flow-ai
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    
  - type: web
    name: axion-flow-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist

databases:
  - name: axion-flow-db
    databaseName: axionflow
    user: admin
```

**Deployment Steps**:
1. Fork/clone repository
2. Create account on Render.com
3. Click "New Blueprint Instance"
4. Select repository
5. Configure environment variables
6. Deploy

### Vercel (Frontend Only)

Frontend is configured for Vercel deployment:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Deploy Command**:
```bash
vercel --prod
```

### Docker Production Deployment

**1. Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

**2. Push to container registry**
```bash
docker tag axion-flow-backend:latest your-registry/axion-flow-backend:latest
docker push your-registry/axion-flow-backend:latest
```

**3. Deploy to cloud provider**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

### Environment-Specific Configuration

**Production Checklist**:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domains
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Enable rate limiting
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Configure log aggregation

---

## 🛠️ Troubleshooting

### Database Connection Issues

**Problem**: `Error: Can't reach database server`
```
Solution:
1. Check PostgreSQL is running: docker ps
2. Verify DATABASE_URL format
3. Check network connectivity
4. Ensure database exists: docker exec -it axion_flow_db psql -U admin -d axionflow
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::10000`
```bash
# Find process using port
lsof -i :10000  # macOS/Linux
netstat -ano | findstr :10000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Prisma Migration Errors

**Problem**: `Migration failed to apply cleanly`
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Force migration
npx prisma migrate deploy --force
```

### AI Service Not Responding

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:8000`
```
Solutions:
1. Check AI service logs: docker logs axion-flow-ai
2. Verify AI_SERVICE_URL in backend .env
3. Restart AI service: docker-compose restart ai-service
4. Check Python dependencies: pip install -r requirements.txt
```

### Frontend Build Errors

**Problem**: `Module not found: Error: Can't resolve...`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

### WebSocket Connection Failed

**Problem**: `WebSocket connection to 'ws://localhost:10000' failed`
```
Solutions:
1. Check CORS configuration in backend
2. Verify WebSocket URL in frontend
3. Check firewall/proxy settings
4. Test with Socket.IO tester: https://amritb.github.io/socketio-client-tool/
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

**1. Fork and clone**
```bash
git clone https://github.com/YOUR_USERNAME/Axion-Flow.git
cd Axion-Flow
```

**2. Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

**3. Make changes and test**
```bash
# Run tests (when available)
npm test

# Run linter
npm run lint
```

**4. Commit with conventional commits**
```bash
git commit -m "feat: add worker performance analytics"
git commit -m "fix: resolve WebSocket reconnection issue"
git commit -m "docs: update API documentation"
```

**5. Push and create PR**
```bash
git push origin feature/your-feature-name
```

### Code Style

- **TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 style guide
- **React**: Use functional components with hooks
- **Naming**: camelCase for variables/functions, PascalCase for components

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Sambit-Kumar-Mohanty-26/Axion-Flow/issues)
- **Email**: contact.axion.flow@gmail.com

---

## 🙏 Acknowledgments

- TensorFlow.js team for COCO-SSD model
- Three.js community for 3D visualization tools
- Prisma team for excellent ORM
- FastAPI and Socket.IO communities

---

## 🗺️ Roadmap

**Phase 1 (Current)**:
- ✅ Core worker tracking
- ✅ AI-powered task assignment
- ✅ Real-time dashboards
- ✅ Multi-role authentication

**Phase 2 (Q2 2026)**:
- [ ] Mobile native apps (React Native)
- [ ] Advanced ML models for predictive maintenance
- [ ] Integration with IoT sensors
- [ ] Automated shift scheduling

**Phase 3 (Q3 2026)**:
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics with BigQuery
- [ ] AR/VR factory walkthroughs
- [ ] Blockchain audit trails

**Phase 4 (Q4 2026)**:
- [ ] Marketplace for factory optimization tools
- [ ] API for third-party integrations
- [ ] White-label solutions

---

**Built with ❤️ by the Axion Flow Team**

⭐ Star this repo if you find it helpful!