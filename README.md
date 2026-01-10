# Echohorn - Fleet Management Platform

AI-powered platform bridging light commercial vehicle drivers and fleet owners.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** (local or cloud instance)
- **Yarn** (package manager)

### Installation

#### 1. Clone and Install Frontend Dependencies

```bash
cd /app
yarn install
```

#### 2. Install Backend Dependencies

```bash
cd /app/backend
pip install -r requirements.txt
```

#### 3. Environment Setup

**Frontend** (`/app/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Backend** (`/app/backend/.env`):
```env
MONGO_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key-change-in-production
```

### Running the Application

#### Start Backend (FastAPI)
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Start Frontend (Next.js)
```bash
cd /app
yarn dev
```

Or for production:
```bash
yarn build
yarn start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## 📁 Project Structure

```
/app
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── book-trip/         # Trip booking page
│   ├── dashboard/         # Legacy dashboard (use portal instead)
│   ├── portal/
│   │   ├── customer/      # Customer portal with auth
│   │   └── driver/        # Driver portal with auth
│   ├── driver-register/   # Driver/fleet registration
│   ├── about/             # About page
│   ├── product/           # Product page
│   ├── vision/            # Vision page
│   ├── features/          # Features page
│   └── reservation/       # Fleet trial booking
├── components/            # React components
│   ├── header/           # Navigation header with Services dropdown
│   ├── Home/             # Homepage hero
│   ├── book-trip/        # Trip booking form
│   ├── dashboard/        # Dashboard component
│   ├── portal/           # Customer & Driver portals
│   └── driver-register/  # Driver registration form
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utilities
│   └── api.ts            # API service layer
├── backend/              # FastAPI backend
│   ├── server.py         # Main API server
│   └── requirements.txt  # Python dependencies
└── public/               # Static assets
```

---

## 🔐 Authentication

### User Types
- **Customer**: Can book trips, view dashboard, track vehicles
- **Driver**: Can view assigned trips, manage vehicles, track earnings

### Test Accounts
```
Customer: customer@test.com / password123
Driver: driver@test.com / password123
```

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get JWT token |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/verify` | GET | Verify token validity |

---

## 🚗 Core Features

### For Customers
- **Book a Trip**: Select pickup/drop cities, date, time, vehicle type
- **Customer Dashboard**: Track trips, view truck details, manage billing
- **Live Tracking**: See real-time vehicle location during trips

### For Drivers
- **Driver Portal**: View assigned trips, manage vehicles
- **Earnings Dashboard**: Track completed trips and earnings
- **Vehicle Management**: Register and manage fleet vehicles

### Vehicle Types
| Vehicle | Capacity | Luggage | Price/km |
|---------|----------|---------|----------|
| Sedan (4+1) | 4+1 | 30 Kgs | ₹14.00 |
| MUV-Innova (7+1) | 7+1 | 60 Kgs | ₹19.00 |
| MUV-Xylo (7+1) | 7+1 | 70 Kgs | ₹18.00 |
| Tempo Traveller (12+1) | 12+1 | 40 Kgs | ₹30.00 |

---

## 🛠 API Reference

### Trip Endpoints
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip

### Vehicle Endpoints
- `GET /api/vehicles` - List vehicle types
- `GET /api/cities` - List available cities

### Driver/Truck Endpoints
- `POST /api/drivers` - Register driver
- `GET /api/drivers` - List drivers
- `POST /api/trucks` - Register truck
- `GET /api/trucks` - List trucks
- `PUT /api/trucks/{id}/location` - Update truck location

### Billing Endpoints
- `GET /api/billing/{trip_id}` - Get trip billing
- `PUT /api/billing/{id}/pay` - Mark as paid

---

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Icons** - Icon library

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Database
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Pydantic** - Data validation

---

## 📝 License

MIT License - Echohorn © 2024
