// API service layer for Echohorn

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

// ==================== TYPES ====================

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  fleetSize?: string;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationCreate {
  name: string;
  email: string;
  phone: string;
  company: string;
  fleetSize?: string;
  message?: string;
}

export interface Stats {
  total: number;
  pending: number;
  contacted: number;
  completed: number;
  recent: Reservation[];
}

export interface Vehicle {
  name: string;
  capacity: string;
  allowedLuggage: number;
  pricePerKm: number;
  image: string;
}

export interface TripBooking {
  id: string;
  tripType: string;
  pickupCity: string;
  dropCity: string;
  pickupDate: string;
  pickupTime: string;
  luggageCount: number;
  vehicleType: string;
  vehicleName: string;
  pricePerKm: number;
  estimatedDistance?: number;
  estimatedFare?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  status: string;
  assignedDriverId?: string;
  assignedTruckId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripBookingCreate {
  tripType: string;
  pickupCity: string;
  dropCity: string;
  pickupDate: string;
  pickupTime: string;
  luggageCount: number;
  vehicleType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  estimatedDistance?: number;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  experience: number;
  profilePhoto?: string;
  rating: number;
  totalTrips: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverCreate {
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  experience: number;
  profilePhoto?: string;
}

export interface Truck {
  id: string;
  vehicleType: string;
  vehicleName: string;
  registrationNumber: string;
  model: string;
  year: number;
  color: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  driverId?: string;
  driverName?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  status: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TruckCreate {
  vehicleType: string;
  registrationNumber: string;
  model: string;
  year: number;
  color: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  driverId?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
}

export interface Billing {
  id: string;
  tripId: string;
  customerId: string;
  customerName: string;
  vehicleName: string;
  distance: number;
  basefare: number;
  luggageCharge: number;
  taxes: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export interface DashboardData {
  summary: {
    totalTrips: number;
    completedTrips: number;
    totalSpent: number;
    pendingPayments: number;
  };
  recentTrips: TripBooking[];
  recentBillings: Billing[];
  activeTrip?: TripBooking;
  truckDetails?: Truck;
  driverDetails?: Driver;
}

// ==================== API SERVICE ====================

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ==================== RESERVATIONS ====================

  async createReservation(data: ReservationCreate): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getReservations(status?: string): Promise<Reservation[]> {
    const url = new URL(`${this.baseUrl}/api/reservations`);
    if (status) url.searchParams.append('status', status);
    const response = await fetch(url.toString());
    return this.handleResponse(response);
  }

  async getStats(): Promise<Stats> {
    const response = await fetch(`${this.baseUrl}/api/reservations/stats`);
    return this.handleResponse(response);
  }

  async getReservation(id: string): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`);
    return this.handleResponse(response);
  }

  async updateReservation(id: string, data: { status?: string; notes?: string }): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteReservation(id: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // ==================== VEHICLES ====================

  async getVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${this.baseUrl}/api/vehicles`);
    return this.handleResponse(response);
  }

  // ==================== CITIES ====================

  async getCities(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/cities`);
    return this.handleResponse(response);
  }

  // ==================== TRIPS ====================

  async createTrip(data: TripBookingCreate): Promise<TripBooking> {
    const response = await fetch(`${this.baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getTrips(status?: string, customerEmail?: string): Promise<TripBooking[]> {
    const url = new URL(`${this.baseUrl}/api/trips`);
    if (status) url.searchParams.append('status', status);
    if (customerEmail) url.searchParams.append('customer_email', customerEmail);
    const response = await fetch(url.toString());
    return this.handleResponse(response);
  }

  async getTrip(id: string): Promise<TripBooking> {
    const response = await fetch(`${this.baseUrl}/api/trips/${id}`);
    return this.handleResponse(response);
  }

  async updateTrip(id: string, data: {
    status?: string;
    assignedDriverId?: string;
    assignedTruckId?: string;
    actualDistance?: number;
    actualFare?: number;
    notes?: string;
  }): Promise<TripBooking> {
    const response = await fetch(`${this.baseUrl}/api/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // ==================== DRIVERS ====================

  async createDriver(data: DriverCreate): Promise<Driver> {
    const response = await fetch(`${this.baseUrl}/api/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getDrivers(status?: string): Promise<Driver[]> {
    const url = new URL(`${this.baseUrl}/api/drivers`);
    if (status) url.searchParams.append('status', status);
    const response = await fetch(url.toString());
    return this.handleResponse(response);
  }

  async getDriver(id: string): Promise<Driver> {
    const response = await fetch(`${this.baseUrl}/api/drivers/${id}`);
    return this.handleResponse(response);
  }

  // ==================== TRUCKS ====================

  async createTruck(data: TruckCreate): Promise<Truck> {
    const response = await fetch(`${this.baseUrl}/api/trucks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getTrucks(status?: string, ownerId?: string): Promise<Truck[]> {
    const url = new URL(`${this.baseUrl}/api/trucks`);
    if (status) url.searchParams.append('status', status);
    if (ownerId) url.searchParams.append('owner_id', ownerId);
    const response = await fetch(url.toString());
    return this.handleResponse(response);
  }

  async getTruck(id: string): Promise<Truck> {
    const response = await fetch(`${this.baseUrl}/api/trucks/${id}`);
    return this.handleResponse(response);
  }

  async updateTruckLocation(id: string, location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }): Promise<{ message: string; location: object }> {
    const response = await fetch(`${this.baseUrl}/api/trucks/${id}/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    return this.handleResponse(response);
  }

  // ==================== BILLING ====================

  async getBilling(tripId: string): Promise<Billing> {
    const response = await fetch(`${this.baseUrl}/api/billing/${tripId}`);
    return this.handleResponse(response);
  }

  async getCustomerBillings(email: string): Promise<Billing[]> {
    const response = await fetch(`${this.baseUrl}/api/billing/customer/${encodeURIComponent(email)}`);
    return this.handleResponse(response);
  }

  async markBillingPaid(billingId: string, paymentMethod: string): Promise<Billing> {
    const response = await fetch(`${this.baseUrl}/api/billing/${billingId}/pay?payment_method=${encodeURIComponent(paymentMethod)}`, {
      method: 'PUT',
    });
    return this.handleResponse(response);
  }

  // ==================== DASHBOARD ====================

  async getDashboard(email: string): Promise<DashboardData> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/${encodeURIComponent(email)}`);
    return this.handleResponse(response);
  }

  // ==================== HEALTH ====================

  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
