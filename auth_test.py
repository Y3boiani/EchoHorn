#!/usr/bin/env python3
"""
Authentication API Testing for Echohorn
Tests the auth endpoints specifically for the portal functionality
"""

import requests
import sys
import json
from datetime import datetime

class AuthAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.tokens = {}
        
    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")
        return success
    
    def make_request(self, method: str, endpoint: str, data=None, token=None):
        """Make HTTP request and return success, response, status_code"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            else:
                return False, {}, 0
                
            return response.status_code < 400, response.json() if response.content else {}, response.status_code
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, {}, 0

    def test_register_customer(self):
        """Test customer registration"""
        customer_data = {
            "name": "Test Customer",
            "email": "customer2@test.com",
            "phone": "9876543210",
            "password": "test1234",
            "user_type": "customer"
        }
        
        success, response, status = self.make_request('POST', '/api/auth/register', customer_data)
        if success and status == 201:
            self.tokens['customer'] = response.get('token')
            
        return self.log_test(
            "Register Customer", 
            success and status == 201 and 'token' in response and response.get('user', {}).get('user_type') == 'customer',
            f"Status: {status}, User Type: {response.get('user', {}).get('user_type', 'N/A')}"
        )

    def test_register_driver(self):
        """Test driver registration"""
        driver_data = {
            "name": "Test Driver",
            "email": "driver2@test.com", 
            "phone": "9876543211",
            "password": "test1234",
            "user_type": "driver"
        }
        
        success, response, status = self.make_request('POST', '/api/auth/register', driver_data)
        if success and status == 201:
            self.tokens['driver'] = response.get('token')
            
        return self.log_test(
            "Register Driver", 
            success and status == 201 and 'token' in response and response.get('user', {}).get('user_type') == 'driver',
            f"Status: {status}, User Type: {response.get('user', {}).get('user_type', 'N/A')}"
        )

    def test_login_customer(self):
        """Test customer login"""
        login_data = {
            "email": "customer@test.com",
            "password": "password123"
        }
        
        success, response, status = self.make_request('POST', '/api/auth/login', login_data)
        if success and status == 200:
            self.tokens['existing_customer'] = response.get('token')
            
        return self.log_test(
            "Login Existing Customer", 
            success and status == 200 and 'token' in response,
            f"Status: {status}, User Type: {response.get('user', {}).get('user_type', 'N/A')}"
        )

    def test_login_driver(self):
        """Test driver login"""
        login_data = {
            "email": "driver@test.com",
            "password": "password123"
        }
        
        success, response, status = self.make_request('POST', '/api/auth/login', login_data)
        if success and status == 200:
            self.tokens['existing_driver'] = response.get('token')
            
        return self.log_test(
            "Login Existing Driver", 
            success and status == 200 and 'token' in response,
            f"Status: {status}, User Type: {response.get('user', {}).get('user_type', 'N/A')}"
        )

    def test_get_current_user(self):
        """Test getting current user info"""
        if 'customer' not in self.tokens:
            return self.log_test("Get Current User", False, "No customer token available")
        
        success, response, status = self.make_request('GET', '/api/auth/me', token=self.tokens['customer'])
        
        return self.log_test(
            "Get Current User", 
            success and status == 200 and 'email' in response,
            f"Status: {status}, Email: {response.get('email', 'N/A')}"
        )

    def test_verify_token(self):
        """Test token verification"""
        if 'driver' not in self.tokens:
            return self.log_test("Verify Token", False, "No driver token available")
        
        success, response, status = self.make_request('GET', '/api/auth/verify', token=self.tokens['driver'])
        
        return self.log_test(
            "Verify Token", 
            success and status == 200 and response.get('valid') == True,
            f"Status: {status}, Valid: {response.get('valid', False)}, User Type: {response.get('user_type', 'N/A')}"
        )

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, response, status = self.make_request('POST', '/api/auth/login', login_data)
        
        return self.log_test(
            "Invalid Login", 
            not success and status == 401,
            f"Status: {status} (Expected 401)"
        )

    def test_invalid_token(self):
        """Test API call with invalid token"""
        success, response, status = self.make_request('GET', '/api/auth/me', token='invalid_token_123')
        
        return self.log_test(
            "Invalid Token", 
            not success and status == 401,
            f"Status: {status} (Expected 401)"
        )

    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔐 Starting Echohorn Authentication API Tests")
        print("=" * 50)
        
        # Registration tests
        self.test_register_customer()
        self.test_register_driver()
        
        # Login tests
        self.test_login_customer()
        self.test_login_driver()
        
        # Token verification tests
        self.test_get_current_user()
        self.test_verify_token()
        
        # Error handling tests
        self.test_invalid_login()
        self.test_invalid_token()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Auth Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All authentication tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = AuthAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())