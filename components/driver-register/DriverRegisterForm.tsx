'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron, Poppins } from 'next/font/google';
import { api, DriverCreate, TruckCreate, Vehicle } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaTruck, FaIdCard, FaPhone, FaEnvelope, FaLocationDot,
  FaCalendarDays, FaCircleCheck, FaArrowRight, FaArrowLeft
} from 'react-icons/fa6';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

type FormStep = 'driver' | 'truck' | 'success';

export default function DriverRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>('driver');
  const [vehicles, setVehicles] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [driverId, setDriverId] = useState('');
  
  const [driverData, setDriverData] = useState<DriverCreate>({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    experience: 0,
  });

  const [truckData, setTruckData] = useState<TruckCreate>({
    vehicleType: '',
    registrationNumber: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    ownerId: '',
    ownerName: '',
    ownerPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehiclesData = await api.getVehicles();
        const vehicleKeys = ['sedan', 'muv_innova', 'muv_xylo', 'tempo_traveller'];
        setVehicles(vehiclesData.map((v, i) => ({
          key: vehicleKeys[i] || `vehicle_${i}`,
          name: v.name,
        })));
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const validateDriverForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!driverData.name.trim()) newErrors.name = 'Name is required';
    if (!driverData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!driverData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!driverData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!driverData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
    if (!driverData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTruckForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!truckData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!truckData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!truckData.model.trim()) newErrors.model = 'Model is required';
    if (!truckData.color.trim()) newErrors.color = 'Color is required';
    if (!truckData.insuranceNumber.trim()) newErrors.insuranceNumber = 'Insurance number is required';
    if (!truckData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry is required';
    if (!truckData.fitnessExpiry) newErrors.fitnessExpiry = 'Fitness expiry is required';
    if (!truckData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!truckData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDriverSubmit = async () => {
    if (!validateDriverForm()) return;
    
    setSubmitting(true);
    
    try {
      const result = await api.createDriver(driverData);
      setDriverId(result.id);
      setTruckData(prev => ({ ...prev, driverId: result.id, ownerId: result.id, ownerName: driverData.name, ownerPhone: driverData.phone }));
      setStep('truck');
    } catch (error: any) {
      console.error('Error creating driver:', error);
      alert(error.message || 'Failed to register driver. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTruckSubmit = async () => {
    if (!validateTruckForm()) return;
    
    setSubmitting(true);
    
    try {
      await api.createTruck(truckData);
      setStep('success');
    } catch (error: any) {
      console.error('Error creating truck:', error);
      alert(error.message || 'Failed to register vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
        className="relative z-10 max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`${orbitron.className} text-4xl md:text-5xl font-bold text-white mb-3`}>
            Driver & Fleet <span className="text-yellow-400">Registration</span>
          </h1>
          <p className="text-gray-400 text-lg">Join the Echohorn network and start earning</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'driver' || step === 'truck' || step === 'success' ? 'text-yellow-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'driver' ? 'border-yellow-400 bg-yellow-400 text-black' : 
              step === 'truck' || step === 'success' ? 'border-green-400 bg-green-400 text-black' : 'border-gray-500'
            }`}>
              {step === 'truck' || step === 'success' ? <FaCircleCheck /> : '1'}
            </div>
            <span className="hidden md:inline">Driver Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step === 'truck' || step === 'success' ? 'text-yellow-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'truck' ? 'border-yellow-400 bg-yellow-400 text-black' : 
              step === 'success' ? 'border-green-400 bg-green-400 text-black' : 'border-gray-500'
            }`}>
              {step === 'success' ? <FaCheckCircle /> : '2'}
            </div>
            <span className="hidden md:inline">Vehicle Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step === 'success' ? 'text-yellow-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'success' ? 'border-green-400 bg-green-400 text-black' : 'border-gray-500'
            }`}>
              {step === 'success' ? <FaCheckCircle /> : '3'}
            </div>
            <span className="hidden md:inline">Complete</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {/* Driver Form */}
            {step === 'driver' && (
              <motion.div
                key="driver"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaUser className="text-yellow-400" />
                  Driver Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Full Name *</label>
                      <input
                        type="text"
                        data-testid="driver-name-input"
                        value={driverData.name}
                        onChange={(e) => setDriverData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-white mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        data-testid="driver-phone-input"
                        value={driverData.phone}
                        onChange={(e) => setDriverData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="+91 9876543210"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Email *</label>
                    <input
                      type="email"
                      data-testid="driver-email-input"
                      value={driverData.email}
                      onChange={(e) => setDriverData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                      placeholder="driver@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">License Number *</label>
                      <input
                        type="text"
                        data-testid="driver-license-input"
                        value={driverData.licenseNumber}
                        onChange={(e) => setDriverData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.licenseNumber ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="DL-1234567890"
                      />
                      {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-white mb-2">License Expiry *</label>
                      <input
                        type="date"
                        data-testid="driver-license-expiry-input"
                        value={driverData.licenseExpiry}
                        onChange={(e) => setDriverData(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.licenseExpiry ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                      />
                      {errors.licenseExpiry && <p className="text-red-400 text-sm mt-1">{errors.licenseExpiry}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      data-testid="driver-experience-input"
                      value={driverData.experience}
                      onChange={(e) => setDriverData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Address *</label>
                    <textarea
                      data-testid="driver-address-input"
                      value={driverData.address}
                      onChange={(e) => setDriverData(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.address ? 'border-red-500' : 'border-white/20'} rounded-xl text-white resize-none`}
                      rows={3}
                      placeholder="Full address"
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleDriverSubmit}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="driver-submit-btn"
                >
                  {submitting ? 'Processing...' : 'Continue'}
                  <FaArrowRight />
                </motion.button>
              </motion.div>
            )}

            {/* Truck Form */}
            {step === 'truck' && (
              <motion.div
                key="truck"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaTruck className="text-yellow-400" />
                  Vehicle Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Vehicle Type *</label>
                    <select
                      data-testid="truck-type-select"
                      value={truckData.vehicleType}
                      onChange={(e) => setTruckData(prev => ({ ...prev, vehicleType: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.vehicleType ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                    >
                      <option value="" className="bg-gray-900">Select vehicle type</option>
                      {vehicles.map(v => (
                        <option key={v.key} value={v.key} className="bg-gray-900">{v.name}</option>
                      ))}
                    </select>
                    {errors.vehicleType && <p className="text-red-400 text-sm mt-1">{errors.vehicleType}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Registration Number *</label>
                      <input
                        type="text"
                        data-testid="truck-registration-input"
                        value={truckData.registrationNumber}
                        onChange={(e) => setTruckData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.registrationNumber ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="MH-12-AB-1234"
                      />
                      {errors.registrationNumber && <p className="text-red-400 text-sm mt-1">{errors.registrationNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-white mb-2">Model *</label>
                      <input
                        type="text"
                        data-testid="truck-model-input"
                        value={truckData.model}
                        onChange={(e) => setTruckData(prev => ({ ...prev, model: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.model ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="Toyota Innova Crysta"
                      />
                      {errors.model && <p className="text-red-400 text-sm mt-1">{errors.model}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2">Year</label>
                      <input
                        type="number"
                        data-testid="truck-year-input"
                        value={truckData.year}
                        onChange={(e) => setTruckData(prev => ({ ...prev, year: parseInt(e.target.value) || 2024 }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
                        min="1990"
                        max="2030"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Color *</label>
                      <input
                        type="text"
                        data-testid="truck-color-input"
                        value={truckData.color}
                        onChange={(e) => setTruckData(prev => ({ ...prev, color: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.color ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="White"
                      />
                      {errors.color && <p className="text-red-400 text-sm mt-1">{errors.color}</p>}
                    </div>
                    <div>
                      <label className="block text-white mb-2">Insurance No. *</label>
                      <input
                        type="text"
                        data-testid="truck-insurance-input"
                        value={truckData.insuranceNumber}
                        onChange={(e) => setTruckData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.insuranceNumber ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                        placeholder="INS-123456"
                      />
                      {errors.insuranceNumber && <p className="text-red-400 text-sm mt-1">{errors.insuranceNumber}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Insurance Expiry *</label>
                      <input
                        type="date"
                        data-testid="truck-insurance-expiry-input"
                        value={truckData.insuranceExpiry}
                        onChange={(e) => setTruckData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.insuranceExpiry ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                      />
                      {errors.insuranceExpiry && <p className="text-red-400 text-sm mt-1">{errors.insuranceExpiry}</p>}
                    </div>
                    <div>
                      <label className="block text-white mb-2">Fitness Expiry *</label>
                      <input
                        type="date"
                        data-testid="truck-fitness-expiry-input"
                        value={truckData.fitnessExpiry}
                        onChange={(e) => setTruckData(prev => ({ ...prev, fitnessExpiry: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white/5 border ${errors.fitnessExpiry ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                      />
                      {errors.fitnessExpiry && <p className="text-red-400 text-sm mt-1">{errors.fitnessExpiry}</p>}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-white font-semibold mb-3">Fleet Owner Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Owner Name *</label>
                        <input
                          type="text"
                          data-testid="owner-name-input"
                          value={truckData.ownerName}
                          onChange={(e) => setTruckData(prev => ({ ...prev, ownerName: e.target.value }))}
                          className={`w-full px-4 py-3 bg-white/5 border ${errors.ownerName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                          placeholder="Owner name"
                        />
                        {errors.ownerName && <p className="text-red-400 text-sm mt-1">{errors.ownerName}</p>}
                      </div>
                      <div>
                        <label className="block text-white mb-2">Owner Phone *</label>
                        <input
                          type="tel"
                          data-testid="owner-phone-input"
                          value={truckData.ownerPhone}
                          onChange={(e) => setTruckData(prev => ({ ...prev, ownerPhone: e.target.value }))}
                          className={`w-full px-4 py-3 bg-white/5 border ${errors.ownerPhone ? 'border-red-500' : 'border-white/20'} rounded-xl text-white`}
                          placeholder="+91 9876543210"
                        />
                        {errors.ownerPhone && <p className="text-red-400 text-sm mt-1">{errors.ownerPhone}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep('driver')}
                    className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleTruckSubmit}
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="truck-submit-btn"
                  >
                    {submitting ? 'Processing...' : 'Complete Registration'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6"
                >
                  <FaCheckCircle className="text-5xl text-green-400" />
                </motion.div>
                <h2 className={`${orbitron.className} text-3xl font-bold text-white mb-4`}>
                  Registration Complete!
                </h2>
                <p className="text-gray-400 mb-6">
                  Thank you for joining Echohorn. Your driver and vehicle details have been successfully registered.
                  Our team will verify your documents and activate your account within 24-48 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Go to Homepage
                  </button>
                  <button
                    onClick={() => {
                      setStep('driver');
                      setDriverData({
                        name: '',
                        phone: '',
                        email: '',
                        licenseNumber: '',
                        licenseExpiry: '',
                        address: '',
                        experience: 0,
                      });
                      setTruckData({
                        vehicleType: '',
                        registrationNumber: '',
                        model: '',
                        year: new Date().getFullYear(),
                        color: '',
                        insuranceNumber: '',
                        insuranceExpiry: '',
                        fitnessExpiry: '',
                        ownerId: '',
                        ownerName: '',
                        ownerPhone: '',
                      });
                    }}
                    className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                  >
                    Register Another Vehicle
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
