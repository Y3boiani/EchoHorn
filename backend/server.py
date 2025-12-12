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
        # Remove common phone formatting characters
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

# ==================== EMAIL SERVICE ====================

async def send_email_notification(reservation: dict):
    """Send email notifications for new reservations"""
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@echohorn.com")
        
        # Skip if SMTP not configured
        if not smtp_user or not smtp_password:
            print("⚠️ SMTP not configured, skipping email notification")
            return
        
        # Run email sending in thread pool to avoid blocking
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
        # Don't raise exception - email failure shouldn't break the reservation

def _send_emails_sync(smtp_host, smtp_port, smtp_user, smtp_password, admin_email, reservation):
    """Synchronous email sending function"""
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    
    # 1. Customer confirmation email
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
                <p>We've received your trial booking request and we're excited to show you how Echohorn can transform your fleet management.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #FFE000; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Booking Details:</h3>
                    <p><strong>Name:</strong> {reservation['name']}</p>
                    <p><strong>Company:</strong> {reservation['company']}</p>
                    <p><strong>Email:</strong> {reservation['email']}</p>
                    <p><strong>Phone:</strong> {reservation['phone']}</p>
                    {f"<p><strong>Fleet Size:</strong> {reservation['fleetSize']}</p>" if reservation.get('fleetSize') else ''}
                    <p><strong>Booking ID:</strong> {reservation['id']}</p>
                </div>
                
                <h3>What's Next?</h3>
                <ul>
                    <li>Our team will contact you within 24 hours</li>
                    <li>We'll schedule a personalized demo session</li>
                    <li>You'll get hands-on experience with our platform</li>
                    <li>We'll answer all your questions</li>
                </ul>
                
                <p style="margin-top: 30px;">If you have any immediate questions, feel free to reply to this email.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                    <p><strong>Echohorn</strong> - Engineering the Quiet in the Chaos of Motion</p>
                    <p style="font-size: 12px;">AI-powered fleet management for the modern world</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    customer_msg.attach(MIMEText(customer_html, 'html'))
    server.send_message(customer_msg)
    
    # 2. Admin notification email
    admin_msg = MIMEMultipart('alternative')
    admin_msg['Subject'] = f'🔔 New Trial Booking: {reservation["company"]}'
    admin_msg['From'] = smtp_user
    admin_msg['To'] = admin_email
    
    admin_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #FFE000;">🎯 New Trial Booking Received!</h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Contact Information:</h3>
                <p><strong>Name:</strong> {reservation['name']}</p>
                <p><strong>Company:</strong> {reservation['company']}</p>
                <p><strong>Email:</strong> <a href="mailto:{reservation['email']}">{reservation['email']}</a></p>
                <p><strong>Phone:</strong> <a href="tel:{reservation['phone']}">{reservation['phone']}</a></p>
                {f"<p><strong>Fleet Size:</strong> {reservation['fleetSize']}</p>" if reservation.get('fleetSize') else ''}
                {f"<p><strong>Message:</strong> {reservation['message']}</p>" if reservation.get('message') else ''}
                <p><strong>Booking ID:</strong> {reservation['id']}</p>
                <p><strong>Submitted:</strong> {reservation['createdAt']}</p>
            </div>
            
            <p><strong>Action Required:</strong> Please contact this lead within 24 hours.</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #FFE000; border-radius: 4px;">
                <p style="margin: 0;">💡 <strong>Tip:</strong> View all bookings in your admin dashboard</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    admin_msg.attach(MIMEText(admin_html, 'html'))
    server.send_message(admin_msg)
    
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
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

# ==================== RESERVATION ENDPOINTS ====================

@app.post("/api/reservations", response_model=ReservationResponse, status_code=201)
async def create_reservation(reservation: ReservationCreate):
    """Create a new trial booking reservation"""
    try:
        # Create reservation document
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
        
        # Save to database
        result = await db.reservations.insert_one(reservation_doc)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create reservation")
        
        # Send email notifications (non-blocking)
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
        
        # Get 5 most recent reservations
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
        # Prepare update document
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if update.status:
            if update.status not in ["pending", "contacted", "completed", "cancelled"]:
                raise HTTPException(status_code=400, detail="Invalid status")
            update_doc["status"] = update.status
        
        if update.notes is not None:
            update_doc["notes"] = update.notes
        
        # Update in database
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
