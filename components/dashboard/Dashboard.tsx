'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron, Poppins } from 'next/font/google';
import { api, DashboardData, TripBooking, Truck, Driver, Billing } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { 
  FaUser, FaTruck, FaMoneyBillWave, FaLocationDot, FaCalendarDays, 
  FaClock, FaSuitcase, FaPhone, FaEnvelope, FaIdCard, FaStar,
  FaMapLocationDot, FaRoute, FaCheckCircle, FaHourglassHalf,
  FaCreditCard, FaReceipt, FaArrowRight
} from 'react-icons/fa6';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

type TabType = 'trip' | 'truck' | 'billing';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
  assigned: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
  in_progress: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
  completed: 'bg-green-500/20 text-green-400 border-green-400/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-400/30',
  paid: 'bg-green-500/20 text-green-400 border-green-400/30',
};

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('trip');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [tripId, setTripId] = useState('');
  const [currentTrip, setCurrentTrip] = useState<TripBooking | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);

  useEffect(() => {
    const email = searchParams.get('email') || localStorage.getItem('echohorn_user_email') || '';
    const trip = searchParams.get('trip') || localStorage.getItem('echohorn_trip_id') || '';
    setUserEmail(email);
    setTripId(trip);

    if (email) {
      loadDashboardData(email, trip);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const loadDashboardData = async (email: string, trip: string) => {
    try {
      setLoading(true);
      const [dashboard, tripData] = await Promise.all([
        api.getDashboard(email),
        trip ? api.getTrip(trip).catch(() => null) : Promise.resolve(null)
      ]);
      
      setDashboardData(dashboard);
      setCurrentTrip(tripData || dashboard.activeTrip || (dashboard.recentTrips[0] || null));
      
      // Load billing if we have a trip
      if (tripData?.id || dashboard.recentTrips[0]?.id) {
        const billingData = await api.getBilling(tripData?.id || dashboard.recentTrips[0]?.id).catch(() => null);
        setBilling(billingData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'trip' as TabType, label: 'Trip Details', icon: FaRoute },
    { id: 'truck' as TabType, label: 'Truck Details', icon: FaTruck },
    { id: 'billing' as TabType, label: 'Billing & Payments', icon: FaMoneyBillWave },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 ${poppins.className}`}>
        <div className="max-w-md mx-auto text-center">
          <FaUser className="text-6xl text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Your Dashboard</h1>
          <p className="text-gray-400 mb-6">Please book a trip first to access your dashboard.</p>
          <a 
            href="/book-trip"
            className="inline-block px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Book a Trip
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 ${poppins.className}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`${orbitron.className} text-4xl md:text-5xl font-bold text-white mb-3`}>
            Your <span className="text-yellow-400">Dashboard</span>
          </h1>
          <p className="text-gray-400">Welcome back! Track your trips and manage your bookings.</p>
        </motion.div>

        {/* Summary Cards */}
        {dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Total Trips</p>
              <p className="text-2xl font-bold text-white">{dashboardData.summary.totalTrips}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{dashboardData.summary.completedTrips}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-yellow-400">₹{dashboardData.summary.totalSpent}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-400">{dashboardData.summary.pendingPayments}</p>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="text-lg" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Trip Details Tab */}
              {activeTab === 'trip' && (
                <motion.div
                  key="trip"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentTrip ? (
                    <div className="space-y-6">
                      {/* Current Trip Status */}
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Current Trip</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[currentTrip.status] || statusColors.pending}`}>
                          {currentTrip.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Trip Route */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaLocationDot className="text-green-500" />
                              <span className="text-gray-400 text-sm">Pickup</span>
                            </div>
                            <p className="text-white font-semibold text-lg">{currentTrip.pickupCity}</p>
                          </div>
                          <FaArrowRight className="text-yellow-400 text-xl" />
                          <div className="flex-1 text-right">
                            <div className="flex items-center justify-end gap-2 mb-2">
                              <span className="text-gray-400 text-sm">Drop</span>
                              <FaLocationDot className="text-blue-500" />
                            </div>
                            <p className="text-white font-semibold text-lg">{currentTrip.dropCity}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FaCalendarDays className="text-yellow-400" />
                            <span className="text-gray-400 text-sm">Date</span>
                          </div>
                          <p className="text-white font-medium">{currentTrip.pickupDate}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-yellow-400" />
                            <span className="text-gray-400 text-sm">Time</span>
                          </div>
                          <p className="text-white font-medium">{currentTrip.pickupTime}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FaTruck className="text-yellow-400" />
                            <span className="text-gray-400 text-sm">Vehicle</span>
                          </div>
                          <p className="text-white font-medium">{currentTrip.vehicleName}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FaSuitcase className="text-yellow-400" />
                            <span className="text-gray-400 text-sm">Luggage</span>
                          </div>
                          <p className="text-white font-medium">{currentTrip.luggageCount} pcs</p>
                        </div>
                      </div>

                      {/* Fare Info */}
                      <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl p-4 border border-yellow-400/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Estimated Fare</p>
                            <p className="text-sm text-gray-400">{currentTrip.tripType === 'round_trip' ? 'Round Trip' : 'One Way'}</p>
                          </div>
                          <p className="text-3xl font-bold text-yellow-400">
                            ₹{currentTrip.estimatedFare?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-semibold mb-3">Booking Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <FaUser className="text-yellow-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Name</p>
                              <p className="text-white">{currentTrip.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaPhone className="text-yellow-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Phone</p>
                              <p className="text-white">{currentTrip.customerPhone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaEnvelope className="text-yellow-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Email</p>
                              <p className="text-white text-sm">{currentTrip.customerEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaRoute className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No trips found. Book your first trip!</p>
                      <a 
                        href="/book-trip"
                        className="inline-block mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                      >
                        Book a Trip
                      </a>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Truck Details Tab */}
              {activeTab === 'truck' && (
                <motion.div
                  key="truck"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {dashboardData?.truckDetails ? (
                    <div className="space-y-6">
                      {/* Truck Info */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <FaTruck className="text-yellow-400" />
                          Vehicle Information
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Vehicle Type</p>
                            <p className="text-white font-medium">{dashboardData.truckDetails.vehicleName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Registration No.</p>
                            <p className="text-white font-medium">{dashboardData.truckDetails.registrationNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Model</p>
                            <p className="text-white font-medium">{dashboardData.truckDetails.model}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Year</p>
                            <p className="text-white font-medium">{dashboardData.truckDetails.year}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Color</p>
                            <p className="text-white font-medium">{dashboardData.truckDetails.color}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <span className={`px-2 py-1 rounded text-sm ${statusColors[dashboardData.truckDetails.status] || statusColors.pending}`}>
                              {dashboardData.truckDetails.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Driver Info */}
                      {dashboardData.driverDetails && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaUser className="text-yellow-400" />
                            Driver Details
                          </h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Name</p>
                              <p className="text-white font-medium">{dashboardData.driverDetails.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Phone</p>
                              <p className="text-white font-medium">{dashboardData.driverDetails.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">License No.</p>
                              <p className="text-white font-medium">{dashboardData.driverDetails.licenseNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Experience</p>
                              <p className="text-white font-medium">{dashboardData.driverDetails.experience} years</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Rating</p>
                              <p className="text-white font-medium flex items-center gap-1">
                                <FaStar className="text-yellow-400" />
                                {dashboardData.driverDetails.rating}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Trips</p>
                              <p className="text-white font-medium">{dashboardData.driverDetails.totalTrips}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Live Location */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <FaMapLocationDot className="text-yellow-400" />
                          Live Location
                        </h2>
                        {dashboardData.truckDetails.currentLocation ? (
                          <div className="space-y-4">
                            <div className="h-64 bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10" />
                              <div className="text-center z-10">
                                <FaMapLocationDot className="text-5xl text-yellow-400 mx-auto mb-2 animate-bounce" />
                                <p className="text-white">Tracking Active</p>
                                <p className="text-gray-400 text-sm mt-2">
                                  Lat: {dashboardData.truckDetails.currentLocation.latitude.toFixed(4)}, 
                                  Lng: {dashboardData.truckDetails.currentLocation.longitude.toFixed(4)}
                                </p>
                                {dashboardData.truckDetails.currentLocation.speed && (
                                  <p className="text-yellow-400 mt-1">
                                    Speed: {dashboardData.truckDetails.currentLocation.speed} km/h
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm text-center">
                              Last updated: {dashboardData.truckDetails.currentLocation.updatedAt}
                            </p>
                          </div>
                        ) : (
                          <div className="h-64 bg-gray-800/50 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                              <FaMapLocationDot className="text-5xl text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-400">Location tracking will be available once the trip starts</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No truck assigned yet</p>
                      <p className="text-gray-500 text-sm">Truck details will appear here once a vehicle is assigned to your trip.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {billing ? (
                    <div className="space-y-6">
                      {/* Payment Status */}
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Billing Summary</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[billing.paymentStatus] || statusColors.pending}`}>
                          {billing.paymentStatus.toUpperCase()}
                        </span>
                      </div>

                      {/* Invoice */}
                      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-4 border-b border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 text-sm">Invoice #{billing.id.slice(0, 8)}</p>
                              <p className="text-white font-semibold">{billing.vehicleName}</p>
                            </div>
                            <FaReceipt className="text-3xl text-yellow-400" />
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Base Fare ({billing.distance} km)</span>
                            <span className="text-white">₹{billing.basefare.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Luggage Charge</span>
                            <span className="text-white">₹{billing.luggageCharge.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Taxes (GST 18%)</span>
                            <span className="text-white">₹{billing.taxes.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex justify-between">
                              <span className="text-white font-bold text-lg">Total Amount</span>
                              <span className="text-yellow-400 font-bold text-2xl">₹{billing.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      {billing.paymentStatus === 'pending' ? (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <FaCreditCard className="text-yellow-400" />
                            Payment Options
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['UPI', 'Card', 'Net Banking', 'Cash'].map((method) => (
                              <button
                                key={method}
                                onClick={() => {
                                  // In a real app, this would trigger payment
                                  alert(`Payment via ${method} - Feature coming soon!`);
                                }}
                                className="p-4 bg-white/5 border border-white/20 rounded-xl text-white hover:border-yellow-400 hover:bg-yellow-400/10 transition-all"
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
                          <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-3xl text-green-400" />
                            <div>
                              <p className="text-white font-semibold">Payment Successful</p>
                              <p className="text-gray-400 text-sm">Paid via {billing.paymentMethod}</p>
                              {billing.paidAt && (
                                <p className="text-gray-500 text-sm">on {new Date(billing.paidAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recent Transactions */}
                      {dashboardData && dashboardData.recentBillings.length > 1 && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
                          <div className="space-y-3">
                            {dashboardData.recentBillings.slice(0, 5).map((b) => (
                              <div key={b.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                  <p className="text-white text-sm">{b.vehicleName}</p>
                                  <p className="text-gray-400 text-xs">{new Date(b.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-yellow-400 font-medium">₹{b.totalAmount.toFixed(2)}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[b.paymentStatus]}`}>
                                    {b.paymentStatus}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaMoneyBillWave className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No billing records found</p>
                      <p className="text-gray-500 text-sm">Your billing details will appear here after your trip is completed.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
