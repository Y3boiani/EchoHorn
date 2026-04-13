'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins, Inter } from 'next/font/google';
import { FaSun, FaMoon, FaUser, FaEnvelope, FaPhone, FaLocationDot, FaCalendarDays, FaArrowLeft, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function ConsumerPortal() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferredDate: '',
    password: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert('Login functionality coming soon!');
  };

  // Theme classes
  const theme = {
    bg: isDarkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-white to-yellow-50',
    card: isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-amber-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    input: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400' 
      : 'bg-white border-amber-200 text-gray-900 placeholder-gray-400 focus:border-amber-500',
    accent: 'text-amber-500',
    button: isDarkMode
      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600'
      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600',
    tabActive: isDarkMode ? 'bg-yellow-400 text-black' : 'bg-amber-500 text-white',
    tabInactive: isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700',
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500`}>
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${isDarkMode ? 'bg-yellow-400/5' : 'bg-amber-200/30'} blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full ${isDarkMode ? 'bg-amber-400/5' : 'bg-orange-200/30'} blur-3xl`} />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-950/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-gray-800' : 'border-amber-100'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/get-started" className="flex items-center gap-3" data-testid="consumer-back-link">
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
            className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-amber-100 text-amber-600'} transition-colors duration-300`}
            data-testid="consumer-theme-toggle"
          >
            {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-lg">
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
                  <motion.h1 
                    className={`${poppins.className} text-3xl md:text-4xl font-bold ${theme.text} mb-3`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Consumer <span className={theme.accent}>Portal</span>
                  </motion.h1>
                  <motion.p 
                    className={`${inter.className} ${theme.textMuted}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Book your trial or sign in to your account
                  </motion.p>
                </div>

                {/* Card */}
                <motion.div
                  className={`${theme.card} backdrop-blur-xl rounded-3xl border shadow-xl overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Tabs */}
                  <div className={`flex ${isDarkMode ? 'bg-gray-800/50' : 'bg-amber-50'} p-1.5`}>
                    <button
                      onClick={() => setActiveTab('register')}
                      className={`${inter.className} flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === 'register' ? theme.tabActive : theme.tabInactive
                      }`}
                      data-testid="consumer-register-tab"
                    >
                      Book a Trial
                    </button>
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`${inter.className} flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === 'login' ? theme.tabActive : theme.tabInactive
                      }`}
                      data-testid="consumer-login-tab"
                    >
                      Returning Customer
                    </button>
                  </div>

                  <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      {activeTab === 'register' ? (
                        <motion.form
                          key="register"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onSubmit={handleSubmit}
                          className="space-y-5"
                        >
                          {/* Name */}
                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Full Name *
                            </label>
                            <div className="relative">
                              <FaUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="consumer-name-input"
                              />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                          </div>

                          {/* Email */}
                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Email Address *
                            </label>
                            <div className="relative">
                              <FaEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="consumer-email-input"
                              />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                          </div>

                          {/* Phone */}
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
                                data-testid="consumer-phone-input"
                              />
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                          </div>

                          {/* Address */}
                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Address *
                            </label>
                            <div className="relative">
                              <FaLocationDot className={`absolute left-4 top-4 ${theme.textMuted}`} />
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                rows={2}
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300 resize-none`}
                                data-testid="consumer-address-input"
                              />
                            </div>
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                          </div>

                          {/* Preferred Date */}
                          <div>
                            <label className={`${inter.className} block ${theme.text} mb-2 font-medium text-sm`}>
                              Preferred Trial Date *
                            </label>
                            <div className="relative">
                              <FaCalendarDays className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                              <input
                                type="date"
                                name="preferredDate"
                                value={formData.preferredDate}
                                onChange={handleChange}
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="consumer-date-input"
                              />
                            </div>
                            {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
                          </div>

                          {/* Submit */}
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${poppins.className} w-full py-4 rounded-xl font-semibold ${theme.button} shadow-lg transition-all duration-300 disabled:opacity-50`}
                            data-testid="consumer-submit-button"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                />
                                Processing...
                              </span>
                            ) : (
                              'Book My Trial'
                            )}
                          </motion.button>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleLogin}
                          className="space-y-5"
                        >
                          {/* Email */}
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
                                placeholder="john@example.com"
                                className={`${inter.className} w-full pl-12 pr-4 py-3.5 rounded-xl border ${theme.input} transition-all duration-300`}
                                data-testid="consumer-login-email-input"
                              />
                            </div>
                          </div>

                          {/* Password */}
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
                                data-testid="consumer-login-password-input"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted} hover:${theme.text}`}
                                data-testid="consumer-toggle-password"
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>

                          {/* Forgot password */}
                          <div className="text-right">
                            <button type="button" className={`${inter.className} text-sm ${theme.accent} hover:underline`}>
                              Forgot password?
                            </button>
                          </div>

                          {/* Submit */}
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${poppins.className} w-full py-4 rounded-xl font-semibold ${theme.button} shadow-lg transition-all duration-300 disabled:opacity-50`}
                            data-testid="consumer-login-button"
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
                className={`${theme.card} backdrop-blur-xl rounded-3xl border shadow-xl p-8 md:p-12 text-center`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'} flex items-center justify-center`}
                >
                  <FaCheck className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className={`${poppins.className} text-2xl md:text-3xl font-bold ${theme.text} mb-4`}>
                  Trial Booked Successfully!
                </h2>
                <p className={`${inter.className} ${theme.textMuted} mb-6`}>
                  Thank you for booking with Echohorn. We&apos;ll contact you shortly to confirm your trial date.
                </p>
                <Link href="/" data-testid="consumer-success-home-link">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${poppins.className} px-8 py-3 rounded-xl font-semibold ${theme.button}`}
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
