from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional, List
import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from contextlib import asynccontextmanager

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.echohorn_db
    print("✅ Connected to MongoDB")
    yield
    # Shutdown
    client.close()
    print("❌ MongoDB connection closed")

app = FastAPI(
    title="Echohorn API",
    description="Backend API for Echohorn Fleet Management Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELS ====================

# Vehicle Types
VEHICLE_TYPES = {
    "sedan": {
        "name": "Sedan (4+1)",
        "capacity": "4+1",
        "allowedLuggage": 30,
        "pricePerKm": 14.00,
        "image": "/img5.png"
    },
    "muv_innova": {
        "name": "MUV-Innova (7+1)",
        "capacity": "7+1",
        "allowedLuggage": 60,
        "pricePerKm": 19.00,
        "image": "/img6.png"
    },
    "muv_xylo": {
        "name": "MUV-Xylo (7+1)",
        "capacity": "7+1",
        "allowedLuggage": 70,
        "pricePerKm": 18.00,
        "image": "/img7.png"
    },
    "tempo_traveller": {
        "name": "Tempo Traveller (12+1)",
        "capacity": "12+1",
        "allowedLuggage": 40,
        "pricePerKm": 30.00,
        "image": "/img8.png"
    }
}

class ReservationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    company: str = Field(..., min_length=2, max_length=100)
    fleetSize: Optional[str] = None
    message: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        return v

class ReservationResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    company: str
    fleetSize: Optional[str]
    message: Optional[str]
    status: str
    createdAt: datetime
    updatedAt: datetime

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class StatsResponse(BaseModel):
    total: int
    pending: int
    contacted: int
    completed: int
    recent: List[ReservationResponse]

# ==================== TRIP BOOKING MODELS ====================

class TripBookingCreate(BaseModel):
    tripType: str = Field(..., description="drop_trip or round_trip")
    pickupCity: str = Field(..., min_length=2, max_length=100)
    dropCity: str = Field(..., min_length=2, max_length=100)
    pickupDate: str = Field(..., description="Pickup date")
    pickupTime: str = Field(..., description="Pickup time")
    luggageCount: int = Field(..., ge=0, le=50)
    vehicleType: str = Field(..., description="Vehicle type key")
    customerName: str = Field(..., min_length=2, max_length=100)
    customerPhone: str = Field(..., min_length=10, max_length=20)
    customerEmail: EmailStr
    estimatedDistance: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)

class TripBookingResponse(BaseModel):
    id: str
    tripType: str
    pickupCity: str
    dropCity: str
    pickupDate: str
    pickupTime: str
    luggageCount: int
    vehicleType: str
    vehicleName: str
    pricePerKm: float
    estimatedDistance: Optional[float]
    estimatedFare: Optional[float]
    customerName: str
    customerPhone: str
    customerEmail: str
    notes: Optional[str]
    status: str
    assignedDriverId: Optional[str]
    assignedTruckId: Optional[str]
    createdAt: datetime
    updatedAt: datetime

class TripBookingUpdate(BaseModel):
    status: Optional[str] = None
    assignedDriverId: Optional[str] = None
    assignedTruckId: Optional[str] = None
    actualDistance: Optional[float] = None
    actualFare: Optional[float] = None
    notes: Optional[str] = None

# ==================== DRIVER/TRUCK MODELS ====================

class DriverCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    licenseNumber: str = Field(..., min_length=5, max_length=30)
    licenseExpiry: str
    address: str = Field(..., min_length=10, max_length=300)
    experience: int = Field(..., ge=0, le=50, description="Years of experience")
    profilePhoto: Optional[str] = None

class DriverResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    licenseNumber: str
    licenseExpiry: str
    address: str
    experience: int
    profilePhoto: Optional[str]
    rating: float
    totalTrips: int
    status: str
    createdAt: datetime
    updatedAt: datetime

class TruckCreate(BaseModel):
    vehicleType: str = Field(..., description="Vehicle type key")
    registrationNumber: str = Field(..., min_length=5, max_length=20)
    model: str = Field(..., min_length=2, max_length=100)
    year: int = Field(..., ge=1990, le=2030)
    color: str = Field(..., min_length=2, max_length=30)
    insuranceNumber: str = Field(..., min_length=5, max_length=50)
    insuranceExpiry: str
    fitnessExpiry: str
    driverId: Optional[str] = None
    ownerId: str = Field(..., description="Fleet owner ID")
    ownerName: str = Field(..., min_length=2, max_length=100)
    ownerPhone: str = Field(..., min_length=10, max_length=20)

class TruckResponse(BaseModel):
    id: str
    vehicleType: str
    vehicleName: str
    registrationNumber: str
    model: str
    year: int
    color: str
    insuranceNumber: str
    insuranceExpiry: str
    fitnessExpiry: str
    driverId: Optional[str]
    driverName: Optional[str]
    ownerId: str
    ownerName: str
    ownerPhone: str
    status: str
    currentLocation: Optional[dict]
    createdAt: datetime
    updatedAt: datetime

class TruckLocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    heading: Optional[float] = Field(None, ge=0, le=360)
    speed: Optional[float] = Field(None, ge=0)

# ==================== BILLING MODELS ====================

class BillingResponse(BaseModel):
    id: str
    tripId: str
    customerId: str
    customerName: str
    vehicleName: str
    distance: float
    basefare: float
    luggageCharge: float
    taxes: float
    totalAmount: float
    paymentStatus: str
    paymentMethod: Optional[str]
    paidAt: Optional[datetime]
    createdAt: datetime

# ==================== EMAIL SERVICE ====================

async def send_email_notification(reservation: dict):
    """Send email notifications for new reservations"""
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@echohorn.com")
        
        if not smtp_user or not smtp_password:
            print("⚠️ SMTP not configured, skipping email notification")
            return
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, 
            _send_emails_sync, 
            smtp_host, smtp_port, smtp_user, smtp_password, 
            admin_email, reservation
        )
        print(f"✅ Email notifications sent for reservation {reservation['id']}")
        
    except Exception as e:
        print(f"⚠️ Email sending failed: {e}")

def _send_emails_sync(smtp_host, smtp_port, smtp_user, smtp_password, admin_email, reservation):
    """Synchronous email sending function"""
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    
    customer_msg = MIMEMultipart('alternative')
    customer_msg['Subject'] = '🎉 Your Echohorn Trial Booking is Confirmed!'
    customer_msg['From'] = smtp_user
    customer_msg['To'] = reservation['email']
    
    customer_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #000; color: #FFE000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Welcome to Echohorn!</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #000;">Thank You, {reservation['name']}! 🚀</h2>
                <p>We've received your trial booking request.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #FFE000; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Booking Details:</h3>
                    <p><strong>Name:</strong> {reservation['name']}</p>
                    <p><strong>Company:</strong> {reservation['company']}</p>
                    <p><strong>Email:</strong> {reservation['email']}</p>
                    <p><strong>Phone:</strong> {reservation['phone']}</p>
                    <p><strong>Booking ID:</strong> {reservation['id']}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    customer_msg.attach(MIMEText(customer_html, 'html'))
    server.send_message(customer_msg)
    server.quit()

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "message": "Echohorn API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    try:
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

# ==================== VEHICLE ENDPOINTS ====================

@app.get("/api/vehicles")
async def get_vehicles():
    """Get all available vehicle types"""
    return list(VEHICLE_TYPES.values())

@app.get("/api/vehicles/{vehicle_key}")
async def get_vehicle(vehicle_key: str):
    """Get specific vehicle type"""
    if vehicle_key not in VEHICLE_TYPES:
        raise HTTPException(status_code=404, detail="Vehicle type not found")
    return VEHICLE_TYPES[vehicle_key]

# ==================== TRIP BOOKING ENDPOINTS ====================

@app.post("/api/trips", response_model=TripBookingResponse, status_code=201)
async def create_trip_booking(trip: TripBookingCreate):
    """Create a new trip booking"""
    try:
        if trip.vehicleType not in VEHICLE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid vehicle type")
        
        vehicle = VEHICLE_TYPES[trip.vehicleType]
        trip_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        estimated_fare = None
        if trip.estimatedDistance:
            estimated_fare = round(trip.estimatedDistance * vehicle["pricePerKm"], 2)
        
        trip_doc = {
            "id": trip_id,
            "tripType": trip.tripType,
            "pickupCity": trip.pickupCity,
            "dropCity": trip.dropCity,
            "pickupDate": trip.pickupDate,
            "pickupTime": trip.pickupTime,
            "luggageCount": trip.luggageCount,
            "vehicleType": trip.vehicleType,
            "vehicleName": vehicle["name"],
            "pricePerKm": vehicle["pricePerKm"],
            "estimatedDistance": trip.estimatedDistance,
            "estimatedFare": estimated_fare,
            "customerName": trip.customerName,
            "customerPhone": trip.customerPhone,
            "customerEmail": trip.customerEmail,
            "notes": trip.notes,
            "status": "pending",
            "assignedDriverId": None,
            "assignedTruckId": None,
            "createdAt": now,
            "updatedAt": now,
        }
        
        await db.trips.insert_one(trip_doc)
        return TripBookingResponse(**trip_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips", response_model=List[TripBookingResponse])
async def get_trips(
    status: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0)
):
    """Get all trips"""
    try:
        query = {}
        if status:
            query["status"] = status
        if customer_email:
            query["customerEmail"] = customer_email
        
        cursor = db.trips.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        trips = await cursor.to_list(length=limit)
        
        return [TripBookingResponse(**trip) for trip in trips]
    except Exception as e:
        print(f"Error fetching trips: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}", response_model=TripBookingResponse)
async def get_trip(trip_id: str):
    """Get a specific trip"""
    try:
        trip = await db.trips.find_one({"id": trip_id})
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        return TripBookingResponse(**trip)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trips/{trip_id}", response_model=TripBookingResponse)
async def update_trip(trip_id: str, update: TripBookingUpdate):
    """Update a trip"""
    try:
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if update.status:
            valid_statuses = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]
            if update.status not in valid_statuses:
                raise HTTPException(status_code=400, detail="Invalid status")
            update_doc["status"] = update.status
        
        if update.assignedDriverId:
            update_doc["assignedDriverId"] = update.assignedDriverId
        if update.assignedTruckId:
            update_doc["assignedTruckId"] = update.assignedTruckId
        if update.actualDistance is not None:
            update_doc["actualDistance"] = update.actualDistance
        if update.actualFare is not None:
            update_doc["actualFare"] = update.actualFare
        if update.notes:
            update_doc["notes"] = update.notes
        
        result = await db.trips.find_one_and_update(
            {"id": trip_id},
            {"$set": update_doc},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        return TripBookingResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DRIVER ENDPOINTS ====================

@app.post("/api/drivers", response_model=DriverResponse, status_code=201)
async def create_driver(driver: DriverCreate):
    """Register a new driver"""
    try:
        driver_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        driver_doc = {
            "id": driver_id,
            "name": driver.name,
            "phone": driver.phone,
            "email": driver.email,
            "licenseNumber": driver.licenseNumber,
            "licenseExpiry": driver.licenseExpiry,
            "address": driver.address,
            "experience": driver.experience,
            "profilePhoto": driver.profilePhoto,
            "rating": 5.0,
            "totalTrips": 0,
            "status": "available",
            "createdAt": now,
            "updatedAt": now,
        }
        
        await db.drivers.insert_one(driver_doc)
        return DriverResponse(**driver_doc)
    except Exception as e:
        print(f"Error creating driver: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/drivers", response_model=List[DriverResponse])
async def get_drivers(
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all drivers"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.drivers.find(query).sort("createdAt", -1).limit(limit)
        drivers = await cursor.to_list(length=limit)
        
        return [DriverResponse(**driver) for driver in drivers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: str):
    """Get a specific driver"""
    try:
        driver = await db.drivers.find_one({"id": driver_id})
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        return DriverResponse(**driver)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TRUCK ENDPOINTS ====================

@app.post("/api/trucks", response_model=TruckResponse, status_code=201)
async def create_truck(truck: TruckCreate):
    """Register a new truck"""
    try:
        if truck.vehicleType not in VEHICLE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid vehicle type")
        
        vehicle = VEHICLE_TYPES[truck.vehicleType]
        truck_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        driver_name = None
        if truck.driverId:
            driver = await db.drivers.find_one({"id": truck.driverId})
            if driver:
                driver_name = driver["name"]
        
        truck_doc = {
            "id": truck_id,
            "vehicleType": truck.vehicleType,
            "vehicleName": vehicle["name"],
            "registrationNumber": truck.registrationNumber,
            "model": truck.model,
            "year": truck.year,
            "color": truck.color,
            "insuranceNumber": truck.insuranceNumber,
            "insuranceExpiry": truck.insuranceExpiry,
            "fitnessExpiry": truck.fitnessExpiry,
            "driverId": truck.driverId,
            "driverName": driver_name,
            "ownerId": truck.ownerId,
            "ownerName": truck.ownerName,
            "ownerPhone": truck.ownerPhone,
            "status": "available",
            "currentLocation": None,
            "createdAt": now,
            "updatedAt": now,
        }
        
        await db.trucks.insert_one(truck_doc)
        return TruckResponse(**truck_doc)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating truck: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trucks", response_model=List[TruckResponse])
async def get_trucks(
    status: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all trucks"""
    try:
        query = {}
        if status:
            query["status"] = status
        if owner_id:
            query["ownerId"] = owner_id
        
        cursor = db.trucks.find(query).sort("createdAt", -1).limit(limit)
        trucks = await cursor.to_list(length=limit)
        
        return [TruckResponse(**truck) for truck in trucks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trucks/{truck_id}", response_model=TruckResponse)
async def get_truck(truck_id: str):
    """Get a specific truck"""
    try:
        truck = await db.trucks.find_one({"id": truck_id})
        if not truck:
            raise HTTPException(status_code=404, detail="Truck not found")
        return TruckResponse(**truck)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trucks/{truck_id}/location")
async def update_truck_location(truck_id: str, location: TruckLocationUpdate):
    """Update truck's live location"""
    try:
        location_data = {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "heading": location.heading,
            "speed": location.speed,
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        result = await db.trucks.find_one_and_update(
            {"id": truck_id},
            {"$set": {
                "currentLocation": location_data,
                "updatedAt": datetime.utcnow()
            }},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Truck not found")
        
        return {"message": "Location updated", "location": location_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BILLING ENDPOINTS ====================

@app.get("/api/billing/{trip_id}", response_model=BillingResponse)
async def get_billing(trip_id: str):
    """Get billing details for a trip"""
    try:
        trip = await db.trips.find_one({"id": trip_id})
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        # Check if billing already exists
        billing = await db.billings.find_one({"tripId": trip_id})
        
        if not billing:
            # Create billing record
            distance = trip.get("actualDistance") or trip.get("estimatedDistance") or 0
            base_fare = round(distance * trip["pricePerKm"], 2)
            luggage_charge = round(trip["luggageCount"] * 5, 2)  # ₹5 per luggage
            subtotal = base_fare + luggage_charge
            taxes = round(subtotal * 0.18, 2)  # 18% GST
            total = round(subtotal + taxes, 2)
            
            billing = {
                "id": str(uuid.uuid4()),
                "tripId": trip_id,
                "customerId": trip["customerEmail"],
                "customerName": trip["customerName"],
                "vehicleName": trip["vehicleName"],
                "distance": distance,
                "basefare": base_fare,
                "luggageCharge": luggage_charge,
                "taxes": taxes,
                "totalAmount": total,
                "paymentStatus": "pending",
                "paymentMethod": None,
                "paidAt": None,
                "createdAt": datetime.utcnow(),
            }
            await db.billings.insert_one(billing)
        
        return BillingResponse(**billing)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/billing/customer/{email}", response_model=List[BillingResponse])
async def get_customer_billings(email: str):
    """Get all billing records for a customer"""
    try:
        cursor = db.billings.find({"customerId": email}).sort("createdAt", -1)
        billings = await cursor.to_list(length=100)
        return [BillingResponse(**b) for b in billings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/billing/{billing_id}/pay")
async def mark_billing_paid(billing_id: str, payment_method: str = Query(...)):
    """Mark a billing as paid"""
    try:
        result = await db.billings.find_one_and_update(
            {"id": billing_id},
            {"$set": {
                "paymentStatus": "paid",
                "paymentMethod": payment_method,
                "paidAt": datetime.utcnow()
            }},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Billing not found")
        
        return BillingResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/{email}")
async def get_dashboard_data(email: str):
    """Get complete dashboard data for a customer"""
    try:
        # Get customer trips
        trips_cursor = db.trips.find({"customerEmail": email}).sort("createdAt", -1).limit(10)
        trips = await trips_cursor.to_list(length=10)
        
        # Get billings
        billings_cursor = db.billings.find({"customerId": email}).sort("createdAt", -1).limit(10)
        billings = await billings_cursor.to_list(length=10)
        
        # Calculate totals
        total_trips = await db.trips.count_documents({"customerEmail": email})
        completed_trips = await db.trips.count_documents({"customerEmail": email, "status": "completed"})
        
        total_spent = 0
        for b in billings:
            if b.get("paymentStatus") == "paid":
                total_spent += b.get("totalAmount", 0)
        
        # Get assigned truck details for active trips
        active_trip = None
        truck_details = None
        driver_details = None
        
        active_trips = await db.trips.find_one({
            "customerEmail": email,
            "status": {"$in": ["confirmed", "assigned", "in_progress"]}
        })
        
        if active_trips:
            active_trip = TripBookingResponse(**active_trips)
            
            if active_trips.get("assignedTruckId"):
                truck = await db.trucks.find_one({"id": active_trips["assignedTruckId"]})
                if truck:
                    truck_details = TruckResponse(**truck)
            
            if active_trips.get("assignedDriverId"):
                driver = await db.drivers.find_one({"id": active_trips["assignedDriverId"]})
                if driver:
                    driver_details = DriverResponse(**driver)
        
        return {
            "summary": {
                "totalTrips": total_trips,
                "completedTrips": completed_trips,
                "totalSpent": round(total_spent, 2),
                "pendingPayments": sum(1 for b in billings if b.get("paymentStatus") == "pending")
            },
            "recentTrips": [TripBookingResponse(**t) for t in trips],
            "recentBillings": [BillingResponse(**b) for b in billings],
            "activeTrip": active_trip,
            "truckDetails": truck_details,
            "driverDetails": driver_details
        }
    except Exception as e:
        print(f"Error fetching dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CITIES ENDPOINT ====================

@app.get("/api/cities")
async def get_cities():
    """Get list of available cities"""
    cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
        "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
        "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
        "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
        "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
        "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad"
    ]
    return sorted(cities)

# ==================== RESERVATION ENDPOINTS ====================

@app.post("/api/reservations", response_model=ReservationResponse, status_code=201)
async def create_reservation(reservation: ReservationCreate):
    """Create a new trial booking reservation"""
    try:
        reservation_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        reservation_doc = {
            "id": reservation_id,
            "name": reservation.name,
            "email": reservation.email,
            "phone": reservation.phone,
            "company": reservation.company,
            "fleetSize": reservation.fleetSize,
            "message": reservation.message,
            "status": "pending",
            "createdAt": now,
            "updatedAt": now,
        }
        
        result = await db.reservations.insert_one(reservation_doc)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create reservation")
        
        asyncio.create_task(send_email_notification(reservation_doc))
        
        return ReservationResponse(**reservation_doc)
        
    except Exception as e:
        print(f"Error creating reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reservations", response_model=List[ReservationResponse])
async def get_reservations(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0)
):
    """Get all reservations (admin endpoint)"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.reservations.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        reservations = await cursor.to_list(length=limit)
        
        return [ReservationResponse(**res) for res in reservations]
        
    except Exception as e:
        print(f"Error fetching reservations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reservations/stats", response_model=StatsResponse)
async def get_reservation_stats():
    """Get reservation statistics for admin dashboard"""
    try:
        total = await db.reservations.count_documents({})
        pending = await db.reservations.count_documents({"status": "pending"})
        contacted = await db.reservations.count_documents({"status": "contacted"})
        completed = await db.reservations.count_documents({"status": "completed"})
        
        cursor = db.reservations.find({}).sort("createdAt", -1).limit(5)
        recent_list = await cursor.to_list(length=5)
        recent = [ReservationResponse(**res) for res in recent_list]
        
        return StatsResponse(
            total=total,
            pending=pending,
            contacted=contacted,
            completed=completed,
            recent=recent
        )
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reservations/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(reservation_id: str):
    """Get a specific reservation by ID"""
    try:
        reservation = await db.reservations.find_one({"id": reservation_id})
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        return ReservationResponse(**reservation)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/reservations/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(reservation_id: str, update: ReservationUpdate):
    """Update reservation status or notes (admin endpoint)"""
    try:
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if update.status:
            if update.status not in ["pending", "contacted", "completed", "cancelled"]:
                raise HTTPException(status_code=400, detail="Invalid status")
            update_doc["status"] = update.status
        
        if update.notes is not None:
            update_doc["notes"] = update.notes
        
        result = await db.reservations.find_one_and_update(
            {"id": reservation_id},
            {"$set": update_doc},
            return_document=True
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        return ReservationResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/reservations/{reservation_id}")
async def delete_reservation(reservation_id: str):
    """Delete a reservation (admin endpoint)"""
    try:
        result = await db.reservations.delete_one({"id": reservation_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        return {"message": "Reservation deleted successfully", "id": reservation_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
