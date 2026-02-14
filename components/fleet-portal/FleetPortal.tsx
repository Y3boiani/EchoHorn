'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rajdhani, Inter } from 'next/font/google';
import { 
  FaSun, FaMoon, FaTruck, FaEnvelope, FaPhone, FaIdCard, FaBuilding, 
  FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaUser, FaShield, FaFileContract,
  FaWeightScale, FaRuler
} from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function FleetPortal() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Driver Details
    fullName: '',
    email: '',
    phone: '',
    driverLicense: '',
    // Company Details
    companyName: '',
    fleetSize: '',
    dotNumber: '',
    insuranceNumber: '',
    // Truck Details
    vehicleType: '',
    vehicleSize: '',
    licensePlate: '',
    vehicleCapacity: '',
    password: '',
    confirmPassword: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.driverLicense.trim()) newErrors.driverLicense = 'Driver license is required';
    } else if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.fleetSize) newErrors.fleetSize = 'Fleet size is required';
    } else if (step === 3) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!formData.vehicleSize) newErrors.vehicleSize = 'Vehicle size is required';
      if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert('Login functionality coming soon!');
  };

  // Theme classes - Dark theme (default) vs Light theme
  const theme = {
    bg: isDarkMode 
      ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950' 
      : 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100',
    card: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900/90 to-slate-900/90 border-orange-500/20' 
      : 'bg-white/90 border-slate-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    input: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-orange-400' 
      : 'bg-white border-slate-300 text-gray-900 placeholder-gray-400 focus:border-orange-500',
    accent: isDarkMode ? 'text-orange-400' : 'text-orange-600',
    button: isDarkMode
      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700',
    tabActive: isDarkMode ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white',
    tabInactive: isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700',
    stepActive: isDarkMode ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white',
    stepComplete: isDarkMode ? 'bg-green-500 text-white' : 'bg-green-500 text-white',
    stepInactive: isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500',
  };

  const steps = [
    { num: 1, title: 'Driver Info', icon: FaUser },
    { num: 2, title: 'Company', icon: FaBuilding },
    { num: 3, title: 'Vehicle', icon: FaTruck },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500`}>
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/40'} blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full ${isDarkMode ? 'bg-red-500/10' : 'bg-red-200/30'} blur-3xl`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${isDarkMode ? 'bg-orange-500/5' : 'bg-orange-100/50'} blur-3xl`} />
      </div>

      {/* Grid pattern overlay */}
      {isDarkMode && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-950/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-gray-800' : 'border-slate-200'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/get-started" className="flex items-center gap-3" data-testid="fleet-back-link">
            <motion.div whileHover={{ x: -3 }} className={theme.textMuted}>
              <FaArrowLeft className="w-5 h-5" />
            </motion.div>
            <Image src="/logo.png" alt="Echohorn" width={120} height={32} />
          </Link>
          
          {/* Theme toggle */}
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 text-orange-400' : 'bg-slate-200 text-orange-600'} transition-colors duration-300`}
            data-testid="fleet-theme-toggle"
          >
            {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'} mb-4`}
                  >
                    <FaTruck className="w-4 h-4" />
                    <span className={`${inter.className} text-sm font-medium`}>Fleet Owner Portal</span>
                  </motion.div>
                  <motion.h1 
                    className={`${rajdhani.className} text-3xl md:text-4xl font-bold ${theme.text} mb-3`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Join the <span className={theme.accent}>Echohorn Network</span>
                  </motion.h1>
                  <motion.p 
                    className={`${inter.className} ${theme.textMuted}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Register your fleet or sign in to your account
                  </motion.p>
                </div>

                {/* Card */}
                <motion.div
                  className={`${theme.card} backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Tabs */}
                  <div className={`flex ${isDarkMode ? 'bg-gray-800/50' : 'bg-slate-100'} p-1.5`}>
                    <button
                      onClick={() => { setActiveTab('register'); setCurrentStep(1); }}
                      className={`${inter.className} flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === 'register' ? theme.tabActive : theme.tabInactive
                      }`}
                      data-testid="fleet-register-tab"
                    >
                      Register Fleet
                    </button>
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`${inter.className} flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === 'login' ? theme.tabActive : theme.tabInactive
                      }`}
                      data-testid="fleet-login-tab"
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      {activeTab === 'register' ? (
                        <motion.div
                          key="register"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          {/* Progress Steps */}
                          <div className="flex items-center justify-between mb-8">
                            {steps.map((step, index) => (
                              <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                  <motion.div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                      currentStep > step.num 
                                        ? theme.stepComplete 
                                        : currentStep === step.num 
                                          ? theme.stepActive 
                                          : theme.stepInactive
                                    } transition-all duration-300`}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {currentStep > step.num ? (
                                      <FaCheck className="w-5 h-5" />
                                    ) : (
                                      <step.icon className="w-5 h-5" />
                                    )}
                                  </motion.div>
                                  <span className={`${inter.className} text-xs mt-2 ${currentStep >= step.num ? theme.text : theme.textMuted}`}>
                                    {step.title}
                                  </span>
                                </div>
                                {index < steps.length - 1 && (
                                  <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.num ? (isDarkMode ? 'bg-orange-500' : 'bg-orange-400') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                              {/* Step 1: Driver Info */}
                              {currentStep === 1 && (
                                <motion.div
                                  key="step1"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-5"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Full Name *
                                      </label>
                                      <div className="relative">
                                        <FaUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="text"
                                          name="fullName"
                                          value={formData.fullName}
                                          onChange={handleChange}
                                          placeholder="John Doe"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-fullname-input"
                                        />
                                      </div>
                                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Email *
                                      </label>
                                      <div className="relative">
                                        <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="email"
                                          name="email"
                                          value={formData.email}
                                          onChange={handleChange}
                                          placeholder="john@company.com"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-email-input"
                                        />
                                      </div>
                                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Phone Number *
                                      </label>
                                      <div className="relative">
                                        <FaPhone className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="tel"
                                          name="phone"
                                          value={formData.phone}
                                          onChange={handleChange}
                                          placeholder="+1 (555) 000-0000"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-phone-input"
                                        />
                                      </div>
                                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Driver License # *
                                      </label>
                                      <div className="relative">
                                        <FaIdCard className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="text"
                                          name="driverLicense"
                                          value={formData.driverLicense}
                                          onChange={handleChange}
                                          placeholder="DL-XXXXXXXX"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-license-input"
                                        />
                                      </div>
                                      {errors.driverLicense && <p className="text-red-500 text-sm mt-1">{errors.driverLicense}</p>}
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 2: Company Details */}
                              {currentStep === 2 && (
                                <motion.div
                                  key="step2"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-5"
                                >
                                  <div>
                                    <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                      Company Name *
                                    </label>
                                    <div className="relative">
                                      <FaBuilding className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                      <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Your Company LLC"
                                        className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                        data-testid="fleet-company-input"
                                      />
                                    </div>
                                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Fleet Size *
                                      </label>
                                      <div className="relative">
                                        <FaTruck className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <select
                                          name="fleetSize"
                                          value={formData.fleetSize}
                                          onChange={handleChange}
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300 appearance-none cursor-pointer`}
                                          data-testid="fleet-size-select"
                                        >
                                          <option value="" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Select fleet size</option>
                                          <option value="1" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>1 vehicle (Owner-operator)</option>
                                          <option value="2-5" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>2-5 vehicles</option>
                                          <option value="6-20" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>6-20 vehicles</option>
                                          <option value="21-50" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>21-50 vehicles</option>
                                          <option value="50+" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>50+ vehicles</option>
                                        </select>
                                      </div>
                                      {errors.fleetSize && <p className="text-red-500 text-sm mt-1">{errors.fleetSize}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        DOT Number
                                      </label>
                                      <div className="relative">
                                        <FaFileContract className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="text"
                                          name="dotNumber"
                                          value={formData.dotNumber}
                                          onChange={handleChange}
                                          placeholder="USDOT XXXXXXX"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-dot-input"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                      Insurance Policy Number
                                    </label>
                                    <div className="relative">
                                      <FaShield className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                      <input
                                        type="text"
                                        name="insuranceNumber"
                                        value={formData.insuranceNumber}
                                        onChange={handleChange}
                                        placeholder="INS-XXXXXXXXX"
                                        className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                        data-testid="fleet-insurance-input"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 3: Vehicle Details */}
                              {currentStep === 3 && (
                                <motion.div
                                  key="step3"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-5"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Vehicle Type *
                                      </label>
                                      <div className="relative">
                                        <FaTruck className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <select
                                          name="vehicleType"
                                          value={formData.vehicleType}
                                          onChange={handleChange}
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300 appearance-none cursor-pointer`}
                                          data-testid="fleet-vehicle-type-select"
                                        >
                                          <option value="" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Select type</option>
                                          <option value="box-truck" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Box Truck</option>
                                          <option value="semi-truck" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Semi Truck</option>
                                          <option value="flatbed" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Flatbed</option>
                                          <option value="refrigerated" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Refrigerated</option>
                                          <option value="cargo-van" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Cargo Van</option>
                                          <option value="pickup" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Pickup Truck</option>
                                        </select>
                                      </div>
                                      {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Vehicle Size *
                                      </label>
                                      <div className="relative">
                                        <FaRuler className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <select
                                          name="vehicleSize"
                                          value={formData.vehicleSize}
                                          onChange={handleChange}
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300 appearance-none cursor-pointer`}
                                          data-testid="fleet-vehicle-size-select"
                                        >
                                          <option value="" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Select size</option>
                                          <option value="small" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Small (up to 10ft)</option>
                                          <option value="medium" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Medium (10-16ft)</option>
                                          <option value="large" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Large (16-26ft)</option>
                                          <option value="extra-large" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Extra Large (26ft+)</option>
                                        </select>
                                      </div>
                                      {errors.vehicleSize && <p className="text-red-500 text-sm mt-1">{errors.vehicleSize}</p>}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        License Plate *
                                      </label>
                                      <div className="relative">
                                        <FaIdCard className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="text"
                                          name="licensePlate"
                                          value={formData.licensePlate}
                                          onChange={handleChange}
                                          placeholder="ABC-1234"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-plate-input"
                                        />
                                      </div>
                                      {errors.licensePlate && <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Vehicle Capacity (lbs)
                                      </label>
                                      <div className="relative">
                                        <FaWeightScale className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type="text"
                                          name="vehicleCapacity"
                                          value={formData.vehicleCapacity}
                                          onChange={handleChange}
                                          placeholder="10,000"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-capacity-input"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Password *
                                      </label>
                                      <div className="relative">
                                        <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type={showPassword ? 'text' : 'password'}
                                          name="password"
                                          value={formData.password}
                                          onChange={handleChange}
                                          placeholder="Create password"
                                          className={`${inter.className} w-full pl-12 pr-12 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-password-input"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setShowPassword(!showPassword)}
                                          className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                                        >
                                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                      </div>
                                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                      <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                                        Confirm Password *
                                      </label>
                                      <div className="relative">
                                        <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                                        <input
                                          type={showPassword ? 'text' : 'password'}
                                          name="confirmPassword"
                                          value={formData.confirmPassword}
                                          onChange={handleChange}
                                          placeholder="Confirm password"
                                          className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                          data-testid="fleet-confirm-password-input"
                                        />
                                      </div>
                                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 mt-8">
                              {currentStep > 1 && (
                                <motion.button
                                  type="button"
                                  onClick={handleBack}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`${inter.className} flex-1 py-4 rounded-xl font-semibold border-2 ${isDarkMode ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-slate-300 text-gray-700 hover:bg-slate-100'} transition-all duration-300`}
                                  data-testid="fleet-back-button"
                                >
                                  Back
                                </motion.button>
                              )}
                              {currentStep < 3 ? (
                                <motion.button
                                  type="button"
                                  onClick={handleNext}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`${inter.className} flex-1 py-4 rounded-xl font-semibold ${theme.button} shadow-lg transition-all duration-300`}
                                  data-testid="fleet-next-button"
                                >
                                  Continue
                                </motion.button>
                              ) : (
                                <motion.button
                                  type="submit"
                                  disabled={isSubmitting}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`${inter.className} flex-1 py-4 rounded-xl font-semibold ${theme.button} shadow-lg transition-all duration-300 disabled:opacity-50`}
                                  data-testid="fleet-submit-button"
                                >
                                  {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                      />
                                      Registering...
                                    </span>
                                  ) : (
                                    'Complete Registration'
                                  )}
                                </motion.button>
                              )}
                            </div>
                          </form>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleLogin}
                          className="space-y-5"
                        >
                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Email Address
                            </label>
                            <div className="relative">
                              <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                              <input
                                type="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                placeholder="john@company.com"
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="fleet-login-email-input"
                              />
                            </div>
                          </div>

                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Password
                            </label>
                            <div className="relative">
                              <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Enter your password"
                                className={`${inter.className} w-full pl-12 pr-12 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="fleet-login-password-input"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <button type="button" className={`${inter.className} text-sm ${theme.accent} hover:underline`}>
                              Forgot password?
                            </button>
                          </div>

                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${inter.className} w-full py-4 rounded-xl font-semibold ${theme.button} shadow-lg transition-all duration-300 disabled:opacity-50`}
                            data-testid="fleet-login-button"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                />
                                Signing in...
                              </span>
                            ) : (
                              'Sign In'
                            )}
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${theme.card} backdrop-blur-xl rounded-3xl border shadow-2xl p-8 md:p-12 text-center`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30`}
                >
                  <FaCheck className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className={`${rajdhani.className} text-3xl md:text-4xl font-bold ${theme.text} mb-4`}>
                  Registration Complete!
                </h2>
                <p className={`${inter.className} ${theme.textMuted} mb-8`}>
                  Welcome to the Echohorn network! Your fleet has been registered successfully. 
                  We&apos;ll review your information and get in touch within 24-48 hours.
                </p>
                <Link href="/" data-testid="fleet-success-home-link">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${inter.className} px-8 py-4 rounded-xl font-semibold ${theme.button} shadow-lg`}
                  >
                    Back to Home
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
