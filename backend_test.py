#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Echohorn Trip Booking Platform
Tests all API endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class EchohornAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_data = {}
        
    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")
        return success
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> tuple[bool, Dict, int]:
        """Make HTTP request and return success, response, status_code"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, {}, 0
                
            return response.status_code < 400, response.json() if response.content else {}, response.status_code
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, {}, 0

    def test_health_check(self):
        """Test health endpoint"""
        success, response, status = self.make_request('GET', '/api/health')
        return self.log_test(
            "Health Check", 
            success and status == 200 and response.get('status') == 'healthy',
            f"Status: {status}, Response: {response.get('status', 'N/A')}"
        )

    def test_get_vehicles(self):
        """Test vehicles endpoint"""
        success, response, status = self.make_request('GET', '/api/vehicles')
        vehicles_valid = isinstance(response, list) and len(response) == 4
        if vehicles_valid:
            self.test_data['vehicles'] = response
            vehicle_names = [v.get('name', '') for v in response]
            expected_vehicles = ['Sedan', 'MUV-Innova', 'MUV-Xylo', 'Tempo Traveller']
            vehicles_valid = any(expected in str(vehicle_names) for expected in expected_vehicles)
        
        return self.log_test(
            "Get Vehicles", 
            success and status == 200 and vehicles_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_get_cities(self):
        """Test cities endpoint"""
        success, response, status = self.make_request('GET', '/api/cities')
        cities_valid = isinstance(response, list) and len(response) > 20
        if cities_valid:
            self.test_data['cities'] = response
            expected_cities = ['Mumbai', 'Delhi', 'Bangalore']
            cities_valid = all(city in response for city in expected_cities)
        
        return self.log_test(
            "Get Cities", 
            success and status == 200 and cities_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_create_trip_booking(self):
        """Test trip booking creation"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        trip_data = {
            "tripType": "drop_trip",
            "pickupCity": "Mumbai",
            "dropCity": "Delhi",
            "pickupDate": tomorrow,
            "pickupTime": "10:00",
            "luggageCount": 2,
            "vehicleType": "muv_innova",
            "customerName": "Test User",
            "customerPhone": "9999999999",
            "customerEmail": "test@test.com",
            "estimatedDistance": 1400,
            "notes": "Test booking"
        }
        
        success, response, status = self.make_request('POST', '/api/trips', trip_data)
        if success and status == 201:
            self.test_data['trip_id'] = response.get('id')
            self.test_data['trip'] = response
        
        return self.log_test(
            "Create Trip Booking", 
            success and status == 201 and 'id' in response,
            f"Status: {status}, Trip ID: {response.get('id', 'N/A')}"
        )

    def test_get_trips(self):
        """Test getting trips"""
        success, response, status = self.make_request('GET', '/api/trips')
        trips_valid = isinstance(response, list)
        
        return self.log_test(
            "Get All Trips", 
            success and status == 200 and trips_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_get_trip_by_email(self):
        """Test getting trips by customer email"""
        params = {"customer_email": "test@test.com"}
        success, response, status = self.make_request('GET', '/api/trips', params=params)
        trips_valid = isinstance(response, list) and len(response) > 0
        
        return self.log_test(
            "Get Trips by Email", 
            success and status == 200 and trips_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_get_specific_trip(self):
        """Test getting specific trip by ID"""
        if 'trip_id' not in self.test_data:
            return self.log_test("Get Specific Trip", False, "No trip ID available")
        
        trip_id = self.test_data['trip_id']
        success, response, status = self.make_request('GET', f'/api/trips/{trip_id}')
        
        return self.log_test(
            "Get Specific Trip", 
            success and status == 200 and response.get('id') == trip_id,
            f"Status: {status}, Trip ID: {response.get('id', 'N/A')}"
        )

    def test_create_driver(self):
        """Test driver registration"""
        tomorrow = (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')
        
        driver_data = {
            "name": "Test Driver",
            "phone": "9876543210",
            "email": "driver@test.com",
            "licenseNumber": "DL123456789",
            "licenseExpiry": tomorrow,
            "address": "123 Test Street, Test City",
            "experience": 5
        }
        
        success, response, status = self.make_request('POST', '/api/drivers', driver_data)
        if success and status == 201:
            self.test_data['driver_id'] = response.get('id')
        
        return self.log_test(
            "Create Driver", 
            success and status == 201 and 'id' in response,
            f"Status: {status}, Driver ID: {response.get('id', 'N/A')}"
        )

    def test_get_drivers(self):
        """Test getting drivers"""
        success, response, status = self.make_request('GET', '/api/drivers')
        drivers_valid = isinstance(response, list)
        
        return self.log_test(
            "Get Drivers", 
            success and status == 200 and drivers_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_create_truck(self):
        """Test truck registration"""
        tomorrow = (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')
        
        truck_data = {
            "vehicleType": "muv_innova",
            "registrationNumber": "MH01AB1234",
            "model": "Toyota Innova",
            "year": 2022,
            "color": "White",
            "insuranceNumber": "INS123456789",
            "insuranceExpiry": tomorrow,
            "fitnessExpiry": tomorrow,
            "ownerId": "owner123",
            "ownerName": "Test Owner",
            "ownerPhone": "9876543210"
        }
        
        success, response, status = self.make_request('POST', '/api/trucks', truck_data)
        if success and status == 201:
            self.test_data['truck_id'] = response.get('id')
        
        return self.log_test(
            "Create Truck", 
            success and status == 201 and 'id' in response,
            f"Status: {status}, Truck ID: {response.get('id', 'N/A')}"
        )

    def test_get_trucks(self):
        """Test getting trucks"""
        success, response, status = self.make_request('GET', '/api/trucks')
        trucks_valid = isinstance(response, list)
        
        return self.log_test(
            "Get Trucks", 
            success and status == 200 and trucks_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def test_get_billing(self):
        """Test billing endpoint"""
        if 'trip_id' not in self.test_data:
            return self.log_test("Get Billing", False, "No trip ID available")
        
        trip_id = self.test_data['trip_id']
        success, response, status = self.make_request('GET', f'/api/billing/{trip_id}')
        
        return self.log_test(
            "Get Billing", 
            success and status == 200 and 'totalAmount' in response,
            f"Status: {status}, Total: {response.get('totalAmount', 'N/A')}"
        )

    def test_dashboard_data(self):
        """Test dashboard endpoint"""
        email = "john@example.com"
        success, response, status = self.make_request('GET', f'/api/dashboard/{email}')
        dashboard_valid = 'summary' in response and 'recentTrips' in response
        
        return self.log_test(
            "Get Dashboard Data", 
            success and status == 200 and dashboard_valid,
            f"Status: {status}, Summary: {bool(response.get('summary'))}"
        )

    def test_create_reservation(self):
        """Test reservation creation"""
        reservation_data = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "9999999999",
            "company": "Test Company",
            "fleetSize": "10-50",
            "message": "Test reservation message"
        }
        
        success, response, status = self.make_request('POST', '/api/reservations', reservation_data)
        if success and status == 201:
            self.test_data['reservation_id'] = response.get('id')
        
        return self.log_test(
            "Create Reservation", 
            success and status == 201 and 'id' in response,
            f"Status: {status}, Reservation ID: {response.get('id', 'N/A')}"
        )

    def test_get_reservations(self):
        """Test getting reservations"""
        success, response, status = self.make_request('GET', '/api/reservations')
        reservations_valid = isinstance(response, list)
        
        return self.log_test(
            "Get Reservations", 
            success and status == 200 and reservations_valid,
            f"Status: {status}, Count: {len(response) if isinstance(response, list) else 0}"
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Echohorn Backend API Tests")
        print("=" * 50)
        
        # Basic health and data endpoints
        self.test_health_check()
        self.test_get_vehicles()
        self.test_get_cities()
        
        # Trip booking flow
        self.test_create_trip_booking()
        self.test_get_trips()
        self.test_get_trip_by_email()
        self.test_get_specific_trip()
        
        # Driver and truck management
        self.test_create_driver()
        self.test_get_drivers()
        self.test_create_truck()
        self.test_get_trucks()
        
        # Billing and dashboard
        self.test_get_billing()
        self.test_dashboard_data()
        
        # Reservations
        self.test_create_reservation()
        self.test_get_reservations()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = EchohornAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())