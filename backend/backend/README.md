# EchoHorn Backend API

Django REST API for logistics platform connecting customers, drivers, and fleet contractors.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip
- Virtual environment

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/Y3boiani/EchoHorn.git
   cd EchoHorn/backend
```

2. **Create virtual environment**
```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
```

3. **Install dependencies**
```bash
   pip install -r requirements.txt
```

4. **Create `.env` file**
```bash
   SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
```

5. **Run migrations**
```bash
   python manage.py migrate
```

6. **Create superuser (for admin panel)**
```bash
   python manage.py createsuperuser
   # Follow prompts - choose any user_type (customer/driver/contractor)
```

7. **Run development server**
```bash
   python manage.py runserver
```

Server runs at: `http://127.0.0.1:8000/`

Admin panel: `http://127.0.0.1:8000/admin/`

---

## 📚 API Documentation for Frontend

### Base URL
```
http://127.0.0.1:8000
```

### Authentication
All endpoints (except registration and login) require JWT authentication.

**Add to request headers:**
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## 🔐 Authentication Endpoints

### 1. Register Customer
```http
POST /api/auth/register/customer/
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+911234567890"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+911234567890",
  "user_type": "customer"
}
```

**Notes:**
- CustomerProfile is auto-created
- Password must be strong (letters + numbers)
- Phone number must be valid international format

---

### 2. Register Driver
```http
POST /api/auth/register/driver/
```

**Request Body:** (Same as customer)

**Response (201):** User object

**Important:** Driver must complete profile separately (see Complete Driver Profile)

---

### 3. Register Contractor
```http
POST /api/auth/register/contractor/
```

**Request Body:** (Same as customer)

**Response (201):** User object

**Important:** Contractor must complete profile separately (see Complete Contractor Profile)

---

### 4. Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Token Usage:**
- `access` token: Valid for 1 hour, use for API requests
- `refresh` token: Valid for 7 days, use to get new access token

**Store both tokens securely (localStorage/sessionStorage)**

---

### 5. Refresh Token
```http
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "access": "new_access_token_here"
}
```

**When to use:**
- When access token expires (401 error)
- Implement automatic token refresh in frontend

---

### 6. Get Current User
```http
GET /api/auth/me/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+911234567890",
  "user_type": "customer",
  "is_email_verified": false,
  "is_phone_verified": false,
  "customer_profile": {
    "id": 1,
    "saved_addresses": [],
    "company_name": "",
    "is_business": false
  },
  "driver_profile": null,
  "contractor_profile": null,
  "created_at": "2025-03-10T12:00:00Z"
}
```

**Use this to:**
- Check if user is logged in
- Get user type for conditional UI
- Check if profile is complete

---

### 7. Complete Driver Profile
```http
POST /api/auth/driver/complete-profile/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "aadhaar_number": "123456789012",
  "date_of_birth": "1990-01-01",
  "license_number": "DL1234567890",
  "license_expiry_date": "2030-12-31",
  "years_of_experience": 5,
  "home_region": "Mumbai",
  "currently_available": true,
  "preferred_route_types": "both"
}
```

**Response (201):** DriverProfile object

**Validation:**
- Only user_type='driver' can call this
- Aadhaar must be 12 digits
- License number must be unique
- preferred_route_types: 'local', 'intercity', or 'both'

---

### 8. Complete Contractor Profile
```http
POST /api/auth/contractor/complete-profile/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "contractor_type": "company",
  "company_name": "ABC Logistics",
  "gst_number": "27AABCU9603R1ZM",
  "years_in_business": 10,
  "business_address": "123 Main St, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "total_trucks_owned": 50
}
```

**Response (201):** ContractorProfile object

**Validation:**
- Only user_type='contractor' can call this
- contractor_type: 'individual' or 'company'

---

## 🛒 Customer Endpoints

### 1. Create Service Request
```http
POST /api/consumer/requests/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "service_type": "intercity",
  "pickup_address": "123 Pickup St, Mumbai, 400001",
  "pickup_floor_number": 3,
  "pickup_lift_available": true,
  "pickup_parking_available": false,
  "drop_address": "456 Drop St, Pune, 411001",
  "drop_floor_number": 2,
  "drop_lift_available": false,
  "drop_parking_available": true,
  "cargo_type": "furniture",
  "cargo_weight": 500.00,
  "room_count": 2,
  "packing_needed": true,
  "vehicle_type_preference": "medium_truck",
  "pickup_datetime": "2025-03-15T09:00:00Z",
  "special_notes": "Handle with care, fragile items"
}
```

**Field Options:**

**service_type:**
- `local` - Local Shifting
- `intercity` - Intercity
- `office` - Office Relocation
- `single_item` - Single Item Delivery

**cargo_type:**
- `electronics`
- `furniture`
- `food` (perishables)
- `construction`
- `textiles`
- `general`

**vehicle_type_preference:**
- `mini_truck`
- `medium_truck`
- `full_truck`
- `trailer`
- `tempo`

**Response (201):**
```json
{
  "id": 1,
  "customer": 1,
  "customer_name": "John Doe",
  "service_type": "intercity",
  "pickup_address": "123 Pickup St, Mumbai, 400001",
  "pickup_floor_number": 3,
  "pickup_lift_available": true,
  "pickup_parking_available": false,
  "drop_address": "456 Drop St, Pune, 411001",
  "drop_floor_number": 2,
  "drop_lift_available": false,
  "drop_parking_available": true,
  "cargo_type": "furniture",
  "cargo_weight": "500.00",
  "room_count": 2,
  "packing_needed": true,
  "vehicle_type_preference": "medium_truck",
  "pickup_datetime": "2025-03-15T09:00:00Z",
  "special_notes": "Handle with care, fragile items",
  "ml_suggested_vehicle_type": null,
  "ml_suggested_price": null,
  "status": "pending",
  "created_at": "2025-03-10T12:00:00Z",
  "updated_at": "2025-03-10T12:00:00Z"
}
```

---

### 2. List My Service Requests
```http
GET /api/consumer/requests/list/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Array of ServiceRequest objects

**UI Usage:**
- Show in "My Requests" page
- Display status badges (pending, confirmed, completed, etc.)

---

### 3. Get Service Request Details
```http
GET /api/consumer/requests/{id}/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Single ServiceRequest object

---

### 4. Get Available Drivers
```http
GET /api/consumer/requests/{service_request_id}/drivers/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "service_request_id": 1,
  "ml_suggested_price": 5000.00,
  "available_drivers": [
    {
      "id": 1,
      "name": "Rajesh Kumar",
      "is_independent": true,
      "contractor_name": "Self",
      "contractor_type": null,
      "phone_number": "+919876543210",
      "license_number": "DL0123456789",
      "years_of_experience": 8,
      "average_rating": "4.50",
      "efficiency_score": "85.50",
      "assigned_vehicles": [
        {
          "id": 1,
          "registration_number": "MH01AB1234",
          "vehicle_type": "medium_truck",
          "capacity_weight": "5.00",
          "model_make": "Tata 407",
          "fuel_type": "diesel",
          "current_location": "Mumbai",
          "total_trips_completed": 120,
          "average_rating": "4.50"
        }
      ]
    },
    {
      "id": 2,
      "name": "Suresh Patil",
      "is_independent": false,
      "contractor_name": "ABC Logistics",
      "contractor_type": "company",
      "phone_number": "+919876543211",
      "license_number": "DL9876543210",
      "years_of_experience": 5,
      "average_rating": "4.20",
      "efficiency_score": "78.30",
      "assigned_vehicles": [...]
    }
  ]
}
```

**UI Implementation:**
- Display drivers as cards/list
- Show rating stars
- Show "Independent" badge if `is_independent: true`
- Show contractor name if fleet driver
- Show vehicle details
- Add "Select Driver" button

---

### 5. Create Booking
```http
POST /api/consumer/bookings/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "service_request": 1,
  "driver": 1,
  "contractor": 2,
  "vehicle": 1,
  "final_price": 5000.00
}
```

**How to get these IDs:**
- `service_request`: From create service request response
- `driver`, `contractor`, `vehicle`: From available drivers response

**Response (201):**
```json
{
  "id": 1,
  "service_request": 1,
  "service_request_details": {...},
  "driver": 1,
  "driver_details": {...},
  "contractor": 2,
  "contractor_name": "ABC Logistics",
  "vehicle": 1,
  "vehicle_details": {...},
  "final_price": "5000.00",
  "advance_percentage": "20.00",
  "advance_paid": false,
  "advance_amount": "1000.00",
  "full_payment_paid": false,
  "payment_date": null,
  "status": "awaiting_acceptance",
  "booking_confirmed_at": null,
  "trip_started_at": null,
  "trip_completed_at": null,
  "created_at": "2025-03-10T12:30:00Z",
  "updated_at": "2025-03-10T12:30:00Z"
}
```

**Note:** `advance_amount` is auto-calculated (20% of final_price by default)

---

### 6. List My Bookings
```http
GET /api/consumer/bookings/list/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Array of Booking objects with full nested details

---

### 7. Get Booking Details
```http
GET /api/consumer/bookings/{id}/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Single Booking object with full details

---

### 8. Pay Advance
```http
POST /api/consumer/bookings/{booking_id}/pay-advance/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:** Empty `{}`

**Response (200):** Updated Booking object

**Side Effects:**
- `advance_paid` → `true`
- `booking.status` → `'awaiting_acceptance'`
- `service_request.status` → `'payment_pending'`

**UI Flow:**
1. Show "Pay ₹{advance_amount} to confirm" button
2. User completes payment (integrate Razorpay/Stripe)
3. Call this endpoint on successful payment
4. Show "Waiting for driver acceptance" message

---

### 9. Pay Full Amount
```http
POST /api/consumer/bookings/{booking_id}/pay-full/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:** Empty `{}`

**Response (200):** Updated Booking object

**Validation:**
- Requires `advance_paid: true`

**Side Effects:**
- `full_payment_paid` → `true`
- `payment_date` → current timestamp

**UI Flow:**
- Show after trip completion
- Display remaining amount: `final_price - advance_amount`

---

### 10. Rate Driver
```http
POST /api/consumer/ratings/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "booking": 1,
  "rated_user": 2,
  "rating": 5,
  "review": "Excellent driver! Very professional and careful with items."
}
```

**Response (201):**
```json
{
  "id": 1,
  "booking": 1,
  "rated_by": 1,
  "rated_by_name": "John Doe",
  "rated_user": 2,
  "rated_user_name": "Rajesh Kumar",
  "rating": 5,
  "review": "Excellent driver! Very professional and careful with items.",
  "created_at": "2025-03-10T15:00:00Z"
}
```

**Validation:**
- `rating`: Integer 1-5
- `review`: Optional text
- `rated_user`: Driver's user ID (get from booking.driver.user)

---

## 🚛 Contractor Endpoints

### 1. Add Vehicle
```http
POST /api/contractor/vehicles/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "registration_number": "MH01AB1234",
  "vehicle_type": "medium_truck",
  "capacity_weight": 5.00,
  "model_make": "Tata 407",
  "fuel_type": "diesel",
  "length_feet": 12.0,
  "width_feet": 6.0,
  "height_feet": 6.5,
  "gps_device_id": "GPS123456",
  "current_location": "Mumbai",
  "insurance_policy_number": "INS987654",
  "insurance_expiry_date": "2026-12-31",
  "puc_number": "PUC123456",
  "puc_expiry_date": "2025-06-30"
}
```

**Required Fields:**
- registration_number (unique)
- vehicle_type
- capacity_weight
- model_make

**Optional Fields:** All others (can be added/updated later)

**Response (201):** Vehicle object

---

### 2. List My Vehicles
```http
GET /api/contractor/vehicles/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Array of Vehicle objects

---

### 3. Get Vehicle Details
```http
GET /api/contractor/vehicles/{id}/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Single Vehicle object

---

### 4. Update Vehicle
```http
PUT /api/contractor/vehicles/{id}/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:** Fields to update (partial update supported)

**Response (200):** Updated Vehicle object

---

### 5. Delete Vehicle
```http
DELETE /api/contractor/vehicles/{id}/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (204):** No Content

---

### 6. List My Drivers
```http
GET /api/contractor/drivers/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Array of Driver objects

---

### 7. Add Fleet Driver
```http
POST /api/contractor/drivers/add-fleet-driver/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "driver_user_id": 5
}
```

**Requirements:**
- Only contractors can call this
- driver_user_id must be existing driver user
- That driver cannot already have a driver_account

**Response (201):** Driver object

**How it works:**
1. Driver registers via `/api/auth/register/driver/`
2. Driver completes profile
3. Contractor adds them to fleet using their user ID
4. Driver now appears in contractor's fleet

---

### 8. Assign Driver to Vehicle
```http
POST /api/contractor/assign-driver/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "driver": 1,
  "vehicle": 1
}
```

**Validation:**
- Both driver and vehicle must belong to contractor

**Response (201):**
```json
{
  "id": 1,
  "driver": 1,
  "driver_name": "Rajesh Kumar",
  "vehicle": 1,
  "vehicle_registration": "MH01AB1234",
  "assigned_at": "2025-03-10T12:00:00Z",
  "is_active": true
}
```

---

### 9. List Driver-Vehicle Assignments
```http
GET /api/contractor/assignments/
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** Array of DriverVehicleAssignment objects

---

## 🚗 Independent Driver Endpoints

### Register as Independent Driver
```http
POST /api/contractor/drivers/register-independent/
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:** Empty `{}`

**Requirements:**
- User must be driver (user_type='driver')
- Must have completed driver profile
- Cannot already have driver_account

**Response (201):** Driver object where `contractor` = `user` (self-managed)

**Flow:**
1. User registers as driver
2. Completes driver profile
3. Calls this endpoint
4. Can now add own vehicles using contractor endpoints

---

## 📊 Status Values Reference

### ServiceRequest Status
- `pending` - Just created, waiting for driver selection
- `driver_selected` - Customer selected driver
- `payment_pending` - Advance payment in progress
- `confirmed` - Booking confirmed
- `in_transit` - Trip in progress
- `delivered` - Items delivered
- `completed` - Trip completed, payment done
- `cancelled` - Cancelled by customer/driver

### Booking Status
- `awaiting_acceptance` - Waiting for driver/contractor to accept
- `accepted` - Driver accepted the booking
- `rejected` - Driver rejected the booking
- `in_progress` - Trip in progress
- `completed` - Trip completed
- `cancelled` - Cancelled

### Driver Status
- `available` - Ready for new bookings
- `on_trip` - Currently on a trip
- `off_duty` - Not available
- `inactive` - Account deactivated

### Vehicle Status
- `available` - Ready to use
- `in_use` - Currently assigned to booking
- `maintenance` - Under maintenance
- `inactive` - Not in service

---