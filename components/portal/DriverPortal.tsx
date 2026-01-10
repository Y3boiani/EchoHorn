'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Orbitron, Poppins } from 'next/font/google';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/portal/AuthForm';
import Header from '@/components/header/header';
import { api, TripBooking, Truck, Driver } from '@/lib/api';
import {
  FaTruck, FaRoute, FaMoneyBillWave, FaLocationDot, FaCalendarDays,
  FaClock, FaStar, FaRightFromBracket, FaCircleCheck, FaPlay, FaStop,
  FaMapLocationDot, FaGauge
} from 'react-icons/fa6';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

type TabType = 'trips' | 'vehicle' | 'earnings';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
  assigned: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
  in_progress: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
  completed: 'bg-green-500/20 text-green-400 border-green-400/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-400/30',
  available: 'bg-green-500/20 text-green-400 border-green-400/30',
  on_trip: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
};

export default function DriverPortal() {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('trips');
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Check if user is driver
      if (user.user_type !== 'driver') {
        router.push('/portal/customer');
        return;
      }
      loadDriverData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const loadDriverData = async () => {
    if (!user) return;
    try {
      // Load driver's trips and trucks
      const [driversData, trucksData] = await Promise.all([
        api.getDrivers(),
        api.getTrucks(),
      ]);

      // Find this driver's info
      const driver = driversData.find(d => d.email === user.email);
      setDriverInfo(driver || null);

      if (driver) {
        // Get trucks owned/driven by this driver
        const myTrucks = trucksData.filter(t => t.driverId === driver.id || t.ownerId === driver.id);
        setTrucks(myTrucks);

        // Get assigned trips
        const allTrips = await api.getTrips();
        const myTrips = allTrips.filter(t => t.assignedDriverId === driver.id);
        setTrips(myTrips);
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    // In a real app, this would start/stop GPS tracking
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
          userType="driver"
          title="Driver Portal"
          subtitle="Sign in to manage your trips and earnings"
        />
      </>
    );
  }

  const tabs = [
    { id: 'trips' as TabType, label: 'My Trips', icon: FaRoute },
    { id: 'vehicle' as TabType, label: 'My Vehicle', icon: FaTruck },
    { id: 'earnings' as TabType, label: 'Earnings', icon: FaMoneyBillWave },
  ];

  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const activeTrip = trips.find(t => ['assigned', 'in_progress'].includes(t.status));

  return (
    <>
      <Header />
      <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 ${poppins.className}`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header with Driver Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`${orbitron.className} text-3xl md:text-4xl font-bold text-white mb-2`}>
                Welcome, <span className="text-yellow-400">{user?.name}</span>
              </h1>
              <p className="text-gray-400">Driver Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
            >
              <FaRightFromBracket /> Sign Out
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Total Trips</p>
              <p className="text-2xl font-bold text-white">{trips.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{completedTrips}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                <FaStar /> {driverInfo?.rating || '5.0'}
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`text-lg font-bold ${activeTrip ? 'text-orange-400' : 'text-green-400'}`}>
                {activeTrip ? 'On Trip' : 'Available'}
              </p>
            </div>
          </div>

          {/* Active Trip Banner */}
          {activeTrip && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30 p-4 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <FaRoute className="text-2xl text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Active Trip</p>
                    <p className="text-gray-300 text-sm">
                      {activeTrip.pickupCity} → {activeTrip.dropCity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTracking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    isTracking
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isTracking ? <><FaStop /> Stop Tracking</> : <><FaPlay /> Start Tracking</>}
                </button>
              </div>
            </motion.div>
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
                  {activeTab === 'trips' && (
                    <div className="space-y-4">
                      {trips.length > 0 ? (
                        trips.map((trip) => (
                          <div
                            key={trip.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <FaRoute className="text-yellow-400" />
                                <span className="text-white font-medium">
                                  {trip.pickupCity} → {trip.dropCity}
                                </span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[trip.status]}`}>
                                {trip.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <FaCalendarDays /> {trip.pickupDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaClock /> {trip.pickupTime}
                              </span>
                              <span className="text-yellow-400 font-medium">
                                ₹{trip.estimatedFare?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <FaRoute className="text-6xl text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No trips assigned yet</p>
                          <p className="text-gray-500 text-sm mt-2">New trips will appear here when assigned</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'vehicle' && (
                    <div className="space-y-6">
                      {trucks.length > 0 ? (
                        trucks.map((truck) => (
                          <div key={truck.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaTruck className="text-yellow-400" /> {truck.vehicleName}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[truck.status]}`}>
                                {truck.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm">Registration</p>
                                <p className="text-white font-medium">{truck.registrationNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Model</p>
                                <p className="text-white font-medium">{truck.model}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Year</p>
                                <p className="text-white font-medium">{truck.year}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Color</p>
                                <p className="text-white font-medium">{truck.color}</p>
                              </div>
                            </div>

                            {/* Live Location */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium flex items-center gap-2">
                                  <FaMapLocationDot className="text-yellow-400" /> Live Tracking
                                </p>
                                {truck.currentLocation && (
                                  <p className="text-green-400 text-sm flex items-center gap-1">
                                    <FaGauge /> {truck.currentLocation.speed || 0} km/h
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <FaTruck className="text-6xl text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No vehicles registered</p>
                          <a href="/driver-register" className="inline-block mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300">
                            Register Vehicle
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'earnings' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-6 border border-yellow-400/30">
                        <p className="text-gray-300">Total Earnings</p>
                        <p className="text-4xl font-bold text-yellow-400 mt-2">
                          ₹{trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.estimatedFare || 0), 0).toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">{completedTrips} completed trips</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-white font-semibold mb-4">Recent Earnings</h3>
                        {trips.filter(t => t.status === 'completed').length > 0 ? (
                          <div className="space-y-3">
                            {trips.filter(t => t.status === 'completed').slice(0, 5).map((trip) => (
                              <div key={trip.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                  <p className="text-white text-sm">{trip.pickupCity} → {trip.dropCity}</p>
                                  <p className="text-gray-400 text-xs">{trip.pickupDate}</p>
                                </div>
                                <p className="text-yellow-400 font-medium">₹{trip.estimatedFare?.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">No earnings yet</p>
                        )}
                      </div>
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
