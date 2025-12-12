// API service layer for Echohorn

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new reservation
  async createReservation(data: ReservationCreate): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Get all reservations
  async getReservations(status?: string): Promise<Reservation[]> {
    const url = new URL(`${this.baseUrl}/api/reservations`);
    if (status) {
      url.searchParams.append('status', status);
    }
    const response = await fetch(url.toString());
    return this.handleResponse(response);
  }

  // Get reservation stats
  async getStats(): Promise<Stats> {
    const response = await fetch(`${this.baseUrl}/api/reservations/stats`);
    return this.handleResponse(response);
  }

  // Get single reservation
  async getReservation(id: string): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`);
    return this.handleResponse(response);
  }

  // Update reservation
  async updateReservation(id: string, data: { status?: string; notes?: string }): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Delete reservation
  async deleteReservation(id: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${this.baseUrl}/api/reservations/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
