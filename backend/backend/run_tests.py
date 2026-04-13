"""
EchoHorn API - Full End-to-End Test Script
Runs against http://127.0.0.1:8000
"""
import requests
import json
from datetime import datetime

BASE = "http://127.0.0.1:8000/api"
results = []
access_token = None
refresh_token = None
contractor_token = None

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def hdr(auth_token=None):
    h = {"Content-Type": "application/json"}
    if auth_token:
        h["Authorization"] = f"Bearer {auth_token}"
    return h

def log(name, method, path, status, ok, note=""):
    icon = f"{GREEN}✅{RESET}" if ok else f"{RED}❌{RESET}"
    status_col = f"{GREEN}{status}{RESET}" if ok else f"{RED}{status}{RESET}"
    results.append((name, method, path, status, ok, note))
    print(f"  {icon}  {BOLD}{name:<40}{RESET}  {method:<6}  {status_col:<5}  {note[:80]}")

def test(name, method, path, body=None, token=None, expect=(200,201,204)):
    url = BASE + path
    try:
        r = getattr(requests, method.lower())(url, json=body, headers=hdr(token), timeout=8)
        ok = r.status_code in expect
        note = ""
        try:
            data = r.json()
            if not ok:
                note = str(data)[:100]
        except:
            data = r.text
            note = data[:100]
        log(name, method, path, r.status_code, ok, note)
        return r.status_code, data
    except Exception as e:
        log(name, method, path, 0, False, str(e)[:100])
        return 0, {}

# ─────────────────────────────────────────────────────────────────
print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
print(f"{BOLD}{CYAN}  EchoHorn API — Full End-to-End Test  {datetime.now().strftime('%H:%M:%S')}{RESET}")
print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")

# ── 1. AUTH ───────────────────────────────────────────────────────
print(f"{BOLD}AUTH ENDPOINTS{RESET}")

# Register Consumer
status, data = test("Register Consumer", "POST", "/auth/register/consumer/", {
    "email": "autotest_consumer@echohorn.com",
    "password": "TestPass@123", "password2": "TestPass@123",
    "first_name": "Auto", "last_name": "Consumer", "user_type": "consumer"
}, expect=(201, 400))

# Register Contractor
status, data = test("Register Contractor", "POST", "/auth/register/contractor/", {
    "email": "autotest_contractor@echohorn.com",
    "password": "TestPass@123", "password2": "TestPass@123",
    "first_name": "Auto", "last_name": "Contractor", "user_type": "contractor"
}, expect=(201, 400))

# Login Consumer
status, data = test("Login (Consumer)", "POST", "/auth/login/", {
    "email": "autotest_consumer@echohorn.com", "password": "TestPass@123"
})
if status == 200 and isinstance(data, dict):
    access_token = data.get("access")
    refresh_token = data.get("refresh")

# Login Contractor
status, data = test("Login (Contractor)", "POST", "/auth/login/", {
    "email": "autotest_contractor@echohorn.com", "password": "TestPass@123"
})
if status == 200 and isinstance(data, dict):
    contractor_token = data.get("access")

# Token Refresh
test("Token Refresh", "POST", "/auth/token/refresh/",
     {"refresh": refresh_token}, expect=(200,))

# GET /me/ — Consumer
test("Me — GET (Consumer)", "GET", "/auth/me/", token=access_token)

# PATCH /me/ — Consumer
test("Me — PATCH (Consumer)", "PATCH", "/auth/me/",
     {"first_name": "AutoUpdated"}, token=access_token)

# Complete Contractor Profile
status, cp = test("Complete Contractor Profile", "POST", "/auth/contractor/complete-profile/", {
    "contractor_type": "individual",
    "business_address": "42 Contractor Lane",
    "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"
}, token=contractor_token, expect=(201, 400))

# ── 2. CONTRACTOR — VEHICLES ──────────────────────────────────────
print(f"\n{BOLD}CONTRACTOR — VEHICLES{RESET}")

# Create Vehicle
status, veh = test("Create Vehicle", "POST", "/contractor/vehicles/", {
    "registration_number": "AUTOTEST001",
    "vehicle_type": "mini_truck",
    "model_make": "Tata Ace",
    "fuel_type": "diesel",
    "capacity_weight": "1.5"
}, token=contractor_token, expect=(201, 400))

vehicle_id = veh.get("id") if isinstance(veh, dict) else None

# List Vehicles
test("List Vehicles", "GET", "/contractor/vehicles/", token=contractor_token)

# Vehicle Detail
if vehicle_id:
    test("Vehicle Detail", "GET", f"/contractor/vehicles/{vehicle_id}/", token=contractor_token)
    # Update Vehicle
    test("Update Vehicle (PATCH)", "PATCH", f"/contractor/vehicles/{vehicle_id}/", {
        "status": "available", "current_location": "Mumbai"
    }, token=contractor_token)
else:
    # Try with id=1 as fallback
    test("Vehicle Detail (fallback id=1)", "GET", "/contractor/vehicles/1/", token=contractor_token, expect=(200,404))
    test("Update Vehicle (fallback id=1)", "PATCH", "/contractor/vehicles/1/",
         {"status": "available"}, token=contractor_token, expect=(200,404))

# ── 3. CONTRACTOR — DRIVERS ───────────────────────────────────────
print(f"\n{BOLD}CONTRACTOR — DRIVERS{RESET}")
test("List Drivers", "GET", "/contractor/drivers/", token=contractor_token)
test("Driver Detail (id=1)", "GET", "/contractor/drivers/1/", token=contractor_token, expect=(200,404))
test("Add Fleet Driver (missing user)", "POST", "/contractor/drivers/add-fleet-driver/",
     {"driver_user_id": 9999}, token=contractor_token, expect=(400,403,404))
test("Register Independent (non-driver user)", "POST", "/contractor/drivers/register-independent/",
     {}, token=contractor_token, expect=(400,403))
test("List Assignments", "GET", "/contractor/assignments/", token=contractor_token)
test("Assign Driver (bad IDs)", "POST", "/contractor/assign-driver/",
     {"driver": 9999, "vehicle": 9999}, token=contractor_token, expect=(400,404))

# ── 4. CONSUMER — SERVICE REQUESTS ───────────────────────────────
print(f"\n{BOLD}CONSUMER — SERVICE REQUESTS{RESET}")

status, req = test("Create Service Request", "POST", "/consumer/requests/", {
    "service_type": "local",
    "vehicle_type_preference": "mini_truck",
    "cargo_type": "general",
    "cargo_weight": "500",
    "pickup_address": "123 Auto Test Pickup St, Mumbai",
    "drop_address": "456 Auto Test Drop Ave, Pune",
    "pickup_floor_number": 0,
    "drop_floor_number": 0,
    "pickup_datetime": "2026-06-01T09:00:00Z",
    "special_notes": "Automated test"
}, token=access_token)

request_id = req.get("id") if isinstance(req, dict) else None

test("List Service Requests", "GET", "/consumer/requests/list/", token=access_token)

if request_id:
    test("Service Request Detail", "GET", f"/consumer/requests/{request_id}/", token=access_token)
    test("Available Drivers for Request", "GET", f"/consumer/requests/{request_id}/drivers/", token=access_token)
else:
    test("Service Request Detail (fallback)", "GET", "/consumer/requests/1/", token=access_token, expect=(200,404))
    test("Available Drivers (fallback)", "GET", "/consumer/requests/1/drivers/", token=access_token, expect=(200,404))

# ── 5. CONSUMER — BOOKINGS ────────────────────────────────────────
print(f"\n{BOLD}CONSUMER — BOOKINGS{RESET}")
test("List Bookings", "GET", "/consumer/bookings/list/", token=access_token)
test("Booking Create (no valid driver yet)", "POST", "/consumer/bookings/", {
    "service_request": request_id or 1,
    "driver": 9999, "contractor": 9999,
    "vehicle": 9999, "final_price": "5000"
}, token=access_token, expect=(400, 404))
test("Booking Detail (id=1)", "GET", "/consumer/bookings/1/", token=access_token, expect=(200,404))
test("Pay Advance (id=1)", "POST", "/consumer/bookings/1/pay-advance/", {}, token=access_token, expect=(200,404))
test("Pay Full (id=1)", "POST", "/consumer/bookings/1/pay-full/", {}, token=access_token, expect=(200,400,404))

# ── 6. CONSUMER — RATINGS ─────────────────────────────────────────
print(f"\n{BOLD}CONSUMER — RATINGS{RESET}")
test("Create Rating (no booking)", "POST", "/consumer/ratings/", {
    "booking": 9999, "rated_user": 9999, "rating": 5, "review": "Auto test"
}, token=access_token, expect=(400, 404))

# ── DELETE VEHICLE (cleanup) ──────────────────────────────────────
print(f"\n{BOLD}CLEANUP{RESET}")
if vehicle_id:
    test("Delete Vehicle", "DELETE", f"/contractor/vehicles/{vehicle_id}/",
         token=contractor_token, expect=(204,))

# ─────────────────────────────────────────────────────────────────
passes = sum(1 for r in results if r[4])
fails  = sum(1 for r in results if not r[4])
total  = len(results)

print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
print(f"{BOLD}  RESULTS: {GREEN}{passes} passed{RESET}  |  {RED}{fails} failed{RESET}  |  {total} total{RESET}")
print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")

if fails:
    print(f"{BOLD}{RED}Failed endpoints:{RESET}")
    for name, method, path, status, ok, note in results:
        if not ok:
            print(f"  {RED}✗ {name}{RESET} → {status} — {note[:120]}")
    print()
