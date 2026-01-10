'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Orbitron, Poppins } from 'next/font/google';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/portal/AuthForm';
import Header from '@/components/header/header';
import { api, DashboardData, TripBooking, Billing } from '@/lib/api';
import {
  FaUser, FaTruck, FaMoneyBillWave, FaLocationDot, FaCalendarDays,
  FaClock, FaSuitcase, FaPhone, FaEnvelope, FaStar,
  FaMapLocationDot, FaRoute, FaCircleCheck,
  FaCreditCard, FaReceipt, FaArrowRight, FaRightFromBracket
} from 'react-icons/fa6';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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

export default function CustomerPortal() {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('trip');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentTrip, setCurrentTrip] = useState<TripBooking | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Check if user is customer
      if (user.user_type !== 'customer') {
        router.push('/portal/driver');
        return;
      }
      loadDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const dashboard = await api.getDashboard(user.email);
      setDashboardData(dashboard);
      setCurrentTrip(dashboard.activeTrip || dashboard.recentTrips[0] || null);

      if (dashboard.recentTrips[0]?.id) {
        const billingData = await api.getBilling(dashboard.recentTrips[0].id).catch(() => null);
        setBilling(billingData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
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

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <AuthForm
          userType="customer"
          title="Customer Portal"
          subtitle="Sign in to track your trips and manage bookings"
        />
      </>
    );
  }

  const tabs = [
    { id: 'trip' as TabType, label: 'My Trips', icon: FaRoute },
    { id: 'truck' as TabType, label: 'Truck Details', icon: FaTruck },
    { id: 'billing' as TabType, label: 'Billing', icon: FaMoneyBillWave },
  ];

  return (
    <>
      <Header />
      <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 ${poppins.className}`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header with User Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`${orbitron.className} text-3xl md:text-4xl font-bold text-white mb-2`}>
                Welcome, <span className="text-yellow-400">{user?.name}</span>
              </h1>
              <p className="text-gray-400">Customer Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
            >
              <FaRightFromBracket /> Sign Out
            </button>
          </div>

          {/* Summary Cards */}
          {dashboardData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-orange-400">{dashboardData.summary.pendingPayments}</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <>
                  {activeTab === 'trip' && (
                    <div className="space-y-6">
                      {currentTrip ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Current Trip</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[currentTrip.status]}`}>
                              {currentTrip.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

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

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <FaCalendarDays className="text-yellow-400 mb-2" />
                              <p className="text-gray-400 text-sm">Date</p>
                              <p className="text-white font-medium">{currentTrip.pickupDate}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <FaClock className="text-yellow-400 mb-2" />
                              <p className="text-gray-400 text-sm">Time</p>
                              <p className="text-white font-medium">{currentTrip.pickupTime}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <FaTruck className="text-yellow-400 mb-2" />
                              <p className="text-gray-400 text-sm">Vehicle</p>
                              <p className="text-white font-medium">{currentTrip.vehicleName}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <FaSuitcase className="text-yellow-400 mb-2" />
                              <p className="text-gray-400 text-sm">Luggage</p>
                              <p className="text-white font-medium">{currentTrip.luggageCount} pcs</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl p-4 border border-yellow-400/30">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-300">Estimated Fare</p>
                                <p className="text-sm text-gray-400">{currentTrip.tripType === 'round_trip' ? 'Round Trip' : 'One Way'}</p>
                              </div>
                              <p className="text-3xl font-bold text-yellow-400">₹{currentTrip.estimatedFare?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <FaRoute className="text-6xl text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No trips yet. Book your first trip!</p>
                          <a href="/book-trip" className="inline-block mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300">
                            Book a Trip
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'truck' && (
                    <div className="space-y-6">
                      {dashboardData?.truckDetails ? (
                        <>
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FaTruck className="text-yellow-400" /> Vehicle Information
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm">Vehicle Type</p>
                                <p className="text-white font-medium">{dashboardData.truckDetails.vehicleName}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Registration</p>
                                <p className="text-white font-medium">{dashboardData.truckDetails.registrationNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Model</p>
                                <p className="text-white font-medium">{dashboardData.truckDetails.model}</p>
                              </div>
                            </div>
                          </div>

                          {dashboardData.driverDetails && (
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FaUser className="text-yellow-400" /> Driver Details
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
                                  <p className="text-gray-400 text-sm">Rating</p>
                                  <p className="text-white font-medium flex items-center gap-1">
                                    <FaStar className="text-yellow-400" /> {dashboardData.driverDetails.rating}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FaMapLocationDot className="text-yellow-400" /> Live Location
                            </h2>
                            {dashboardData.truckDetails.currentLocation ? (
                              <div className="h-48 bg-gray-800 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <FaMapLocationDot className="text-4xl text-yellow-400 mx-auto mb-2 animate-bounce" />
                                  <p className="text-white">Tracking Active</p>
                                  <p className="text-gray-400 text-sm mt-1">
                                    Speed: {dashboardData.truckDetails.currentLocation.speed || 0} km/h
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="h-48 bg-gray-800/50 rounded-xl flex items-center justify-center">
                                <p className="text-gray-400">Location tracking starts when trip begins</p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <FaTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No truck assigned yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="space-y-6">
                      {billing ? (
                        <>
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
                                <span className="text-gray-400">GST (18%)</span>
                                <span className="text-white">₹{billing.taxes.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-white/10 pt-3">
                                <div className="flex justify-between">
                                  <span className="text-white font-bold text-lg">Total</span>
                                  <span className="text-yellow-400 font-bold text-2xl">₹{billing.totalAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {billing.paymentStatus === 'pending' && (
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FaCreditCard className="text-yellow-400" /> Payment Options
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['UPI', 'Card', 'Net Banking', 'Cash'].map((method) => (
                                  <button
                                    key={method}
                                    className="p-4 bg-white/5 border border-white/20 rounded-xl text-white hover:border-yellow-400 transition-all"
                                  >
                                    {method}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <FaMoneyBillWave className="text-6xl text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No billing records found</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
