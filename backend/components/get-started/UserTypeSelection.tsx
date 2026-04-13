'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Orbitron, Inter } from 'next/font/google';
import { FaTruck, FaUser, FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const FloatingParticle = ({ index }: { index: number }) => {
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 3 + 2;
  const delay = Math.random() * 2;
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full bg-yellow-400/30"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export default function UserTypeSelection() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center py-32 px-4">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/Coming_Soon.png')`, scale: 1.1, opacity: 0.3 }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {/* Floating particles */}
      <div className="absolute inset-0 z-10">
        {Array.from({ length: 25 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 w-full max-w-5xl"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className={`${orbitron.className} text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6`}>
            How would you like to <span className="text-yellow-400">get started?</span>
          </h1>
          <p className={`${inter.className} text-gray-300 text-lg md:text-xl max-w-2xl mx-auto`}>
            Choose your path to experience the future of fleet management and logistics
          </p>
        </motion.div>

        {/* Selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Consumer Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/consumer" target="_blank" data-testid="consumer-card-link">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-10 cursor-pointer overflow-hidden transition-all duration-500 hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-400/10"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-yellow-400/10 to-transparent" />
                
                {/* Icon */}
                <motion.div
                  className="relative z-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/30"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <FaUser className="w-10 h-10 text-black" />
                </motion.div>

                {/* Content */}
                <h2 className={`${orbitron.className} relative z-10 text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors duration-300`}>
                  I&apos;m a Consumer
                </h2>
                <p className={`${inter.className} relative z-10 text-gray-400 text-base md:text-lg mb-8 leading-relaxed`}>
                  Looking to book delivery services or need transportation solutions for your packages and goods.
                </p>

                {/* Features list */}
                <ul className={`${inter.className} relative z-10 space-y-3 mb-8`}>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                    Book trial deliveries
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                    Track your packages
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                    Get competitive rates
                  </li>
                </ul>

                {/* CTA */}
                <div className="relative z-10 flex items-center gap-2 text-yellow-400 font-semibold">
                  <span>Get Started</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Truck Driver / Fleet Owner Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/fleet-portal" target="_blank" data-testid="fleet-owner-card-link">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-xl rounded-3xl border border-orange-400/20 p-8 md:p-10 cursor-pointer overflow-hidden transition-all duration-500 hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-400/10"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-400/10 to-transparent" />
                
                {/* Icon */}
                <motion.div
                  className="relative z-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-400/30"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <FaTruck className="w-10 h-10 text-white" />
                </motion.div>

                {/* Content */}
                <h2 className={`${orbitron.className} relative z-10 text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300`}>
                  Truck Driver / Fleet Owner
                </h2>
                <p className={`${inter.className} relative z-10 text-gray-400 text-base md:text-lg mb-8 leading-relaxed`}>
                  Join our network of professional drivers and fleet operators to grow your business.
                </p>

                {/* Features list */}
                <ul className={`${inter.className} relative z-10 space-y-3 mb-8`}>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    Register your fleet
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    Get matched with jobs
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    Earn fair rewards
                  </li>
                </ul>

                {/* CTA */}
                <div className="relative z-10 flex items-center gap-2 text-orange-400 font-semibold">
                  <span>Register Now</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <Link 
            href="/" 
            className={`${inter.className} text-gray-400 hover:text-yellow-400 transition-colors duration-300`}
            data-testid="back-to-home-link"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
