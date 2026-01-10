'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron, Poppins } from 'next/font/google';
import { api, Vehicle, TripBookingCreate } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FaMinus, FaPlus, FaLocationDot, FaCalendarDays, FaClock, FaSuitcase, FaTruck, FaChevronDown } from 'react-icons/fa6';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Vehicle images mapping
const vehicleImages: Record<string, string> = {
  sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=100&fit=crop',
  muv_innova: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=200&h=100&fit=crop',
  muv_xylo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=100&fit=crop',
  tempo_traveller: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200&h=100&fit=crop',
};

interface VehicleOption {
  key: string;
  name: string;
  capacity: string;
  allowedLuggage: number;
  pricePerKm: number;
  image: string;
}

export default function BookTripForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState<'drop_trip' | 'round_trip'>('drop_trip');
  const [cities, setCities] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropDropdown, setShowDropDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupCity: '',
    dropCity: '',
    pickupDate: '',
    pickupTime: '',
    luggageCount: 0,
    selectedVehicle: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    estimatedDistance: 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, vehiclesData] = await Promise.all([
          api.getCities(),
          api.getVehicles()
        ]);
        setCities(citiesData);
        
        // Transform vehicles data
        const vehicleKeys = ['sedan', 'muv_innova', 'muv_xylo', 'tempo_traveller'];
        const transformedVehicles: VehicleOption[] = vehiclesData.map((v, index) => ({
          key: vehicleKeys[index] || `vehicle_${index}`,
          name: v.name,
          capacity: v.capacity,
          allowedLuggage: v.allowedLuggage,
          pricePerKm: v.pricePerKm,
          image: vehicleImages[vehicleKeys[index]] || '',
        }));
        setVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLuggageChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      luggageCount: Math.max(0, Math.min(50, prev.luggageCount + delta))
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pickupCity) newErrors.pickupCity = 'Pickup city is required';
    if (!formData.dropCity) newErrors.dropCity = 'Drop city is required';
    if (formData.pickupCity && formData.dropCity && formData.pickupCity === formData.dropCity) {
      newErrors.dropCity = 'Drop city must be different from pickup city';
    }
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';
    if (!formData.selectedVehicle) newErrors.selectedVehicle = 'Please select a vehicle';
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const tripData: TripBookingCreate = {
        tripType,
        pickupCity: formData.pickupCity,
        dropCity: formData.dropCity,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        luggageCount: formData.luggageCount,
        vehicleType: formData.selectedVehicle,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        estimatedDistance: formData.estimatedDistance,
      };
      
      const result = await api.createTrip(tripData);
      
      // Store email for dashboard access
      if (typeof window !== 'undefined') {
        localStorage.setItem('echohorn_user_email', formData.customerEmail);
        localStorage.setItem('echohorn_trip_id', result.id);
      }
      
      // Redirect to dashboard
      router.push(`/dashboard?email=${encodeURIComponent(formData.customerEmail)}&trip=${result.id}`);
    } catch (error: any) {
      console.error('Error creating trip:', error);
      alert(error.message || 'Failed to book trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicleData = vehicles.find(v => v.key === formData.selectedVehicle);
  const estimatedFare = selectedVehicleData 
    ? (formData.estimatedDistance * selectedVehicleData.pricePerKm).toFixed(2)
    : '0.00';

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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24 px-4 ${poppins.className}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`${orbitron.className} text-4xl md:text-5xl font-bold text-white mb-3`}>
            Book <span className="text-yellow-400">Trip</span>
          </h1>
          <p className="text-gray-400 text-lg">Experience seamless travel with Echohorn</p>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Trip Type Tabs */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              data-testid="trip-type-drop"
              onClick={() => setTripType('drop_trip')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 ${
                tripType === 'drop_trip'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              DROP TRIP
            </button>
            <button
              type="button"
              data-testid="trip-type-round"
              onClick={() => setTripType('round_trip')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-all duration-300 ${
                tripType === 'round_trip'
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ROUND TRIP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup City */}
              <div className="relative">
                <label className="block text-white mb-2 font-medium flex items-center gap-2">
                  <FaLocationDot className="text-green-500" />
                  Pickup City
                </label>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="pickup-city-select"
                    onClick={() => setShowPickupDropdown(!showPickupDropdown)}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.pickupCity ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white text-left flex items-center justify-between hover:border-yellow-400/50 transition-all`}
                  >
                    <span className={formData.pickupCity ? 'text-white' : 'text-gray-400'}>
                      {formData.pickupCity || 'Select Pickup City'}
                    </span>
                    <FaChevronDown className={`transition-transform ${showPickupDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showPickupDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                      >
                        {cities.map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, pickupCity: city }));
                              setShowPickupDropdown(false);
                              setErrors(prev => ({ ...prev, pickupCity: '' }));
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-yellow-400/20 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.pickupCity && <p className="text-red-400 text-sm mt-1">{errors.pickupCity}</p>}
              </div>

              {/* Drop City */}
              <div className="relative">
                <label className="block text-white mb-2 font-medium flex items-center gap-2">
                  <FaLocationDot className="text-blue-500" />
                  Drop City
                </label>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="drop-city-select"
                    onClick={() => setShowDropDropdown(!showDropDropdown)}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.dropCity ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white text-left flex items-center justify-between hover:border-yellow-400/50 transition-all`}
                  >
                    <span className={formData.dropCity ? 'text-white' : 'text-gray-400'}>
                      {formData.dropCity || 'Select Drop City'}
                    </span>
                    <FaChevronDown className={`transition-transform ${showDropDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showDropDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                      >
                        {cities.map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, dropCity: city }));
                              setShowDropDropdown(false);
                              setErrors(prev => ({ ...prev, dropCity: '' }));
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-yellow-400/20 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.dropCity && <p className="text-red-400 text-sm mt-1">{errors.dropCity}</p>}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 font-medium flex items-center gap-2">
                  <FaCalendarDays className="text-yellow-400" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  data-testid="pickup-date-input"
                  value={formData.pickupDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, pickupDate: e.target.value }));
                    setErrors(prev => ({ ...prev, pickupDate: '' }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.pickupDate ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-all`}
                />
                {errors.pickupDate && <p className="text-red-400 text-sm mt-1">{errors.pickupDate}</p>}
              </div>
              <div>
                <label className="block text-white mb-2 font-medium flex items-center gap-2">
                  <FaClock className="text-yellow-400" />
                  Pickup Time
                </label>
                <input
                  type="time"
                  data-testid="pickup-time-input"
                  value={formData.pickupTime}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, pickupTime: e.target.value }));
                    setErrors(prev => ({ ...prev, pickupTime: '' }));
                  }}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.pickupTime ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-all`}
                />
                {errors.pickupTime && <p className="text-red-400 text-sm mt-1">{errors.pickupTime}</p>}
              </div>
            </div>

            {/* Luggage Counter */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl p-4">
              <label className="block text-white mb-3 font-medium flex items-center gap-2">
                <FaSuitcase className="text-yellow-400" />
                Luggage Count
              </label>
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLuggageChange(-1)}
                  className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 transition-colors"
                  data-testid="luggage-decrease"
                >
                  <FaMinus />
                </motion.button>
                <div className="w-20 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white text-2xl font-bold border border-white/20">
                  {formData.luggageCount}
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLuggageChange(1)}
                  className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 transition-colors"
                  data-testid="luggage-increase"
                >
                  <FaPlus />
                </motion.button>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-white mb-3 font-medium flex items-center gap-2">
                <FaTruck className="text-yellow-400" />
                Select Vehicle
              </label>
              {errors.selectedVehicle && <p className="text-red-400 text-sm mb-2">{errors.selectedVehicle}</p>}
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.key}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, selectedVehicle: vehicle.key }));
                      setErrors(prev => ({ ...prev, selectedVehicle: '' }));
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      formData.selectedVehicle === vehicle.key
                        ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                    data-testid={`vehicle-option-${vehicle.key}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {vehicle.image ? (
                          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaTruck className="text-3xl text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{vehicle.name}</h3>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm">
                          <span className="text-gray-400">
                            Allowed luggage: <span className="text-white font-medium">{vehicle.allowedLuggage} Kgs</span>
                          </span>
                          <span className="text-gray-400">
                            Single Trip: <span className="text-yellow-400 font-medium">₹{vehicle.pricePerKm.toFixed(2)}/km</span>
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                        formData.selectedVehicle === vehicle.key
                          ? 'border-yellow-400 bg-yellow-400'
                          : 'border-white/30'
                      }`}>
                        {formData.selectedVehicle === vehicle.key && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full flex items-center justify-center text-black"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-white font-semibold text-lg mb-4">Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium">Full Name *</label>
                  <input
                    type="text"
                    data-testid="customer-name-input"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customerName: e.target.value }));
                      setErrors(prev => ({ ...prev, customerName: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.customerName ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.customerName && <p className="text-red-400 text-sm mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    data-testid="customer-phone-input"
                    value={formData.customerPhone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customerPhone: e.target.value }));
                      setErrors(prev => ({ ...prev, customerPhone: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.customerPhone ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all`}
                    placeholder="+91 9876543210"
                  />
                  {errors.customerPhone && <p className="text-red-400 text-sm mt-1">{errors.customerPhone}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2 font-medium">Email *</label>
                  <input
                    type="email"
                    data-testid="customer-email-input"
                    value={formData.customerEmail}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customerEmail: e.target.value }));
                      setErrors(prev => ({ ...prev, customerEmail: '' }));
                    }}
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      errors.customerEmail ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all`}
                    placeholder="john@example.com"
                  />
                  {errors.customerEmail && <p className="text-red-400 text-sm mt-1">{errors.customerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Fare Estimate */}
            {selectedVehicleData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-4 border border-yellow-400/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Estimated Fare</p>
                    <p className="text-sm text-gray-400">Based on ~{formData.estimatedDistance} km distance</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">₹{estimatedFare}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              data-testid="book-trip-submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-yellow-400/30 hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
