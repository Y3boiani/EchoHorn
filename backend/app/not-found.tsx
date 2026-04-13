'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Orbitron } from 'next/font/google';
import { FaHouse, FaRocket } from 'react-icons/fa6';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

// Floating star component
const FloatingStar = ({ index }: { index: number }) => {
  const size = Math.random() * 3 + 1;
  const duration = Math.random() * 3 + 2;
  const delay = Math.random() * 2;
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        opacity: [0.2, 1, 0.2],
        scale: [1, 1.5, 1],
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

export default function NotFound() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Floating stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <FloatingStar key={i} index={i} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className={`${orbitron.className} text-9xl font-bold mb-4`}
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 224, 0, 0.5)',
                '0 0 40px rgba(255, 224, 0, 0.8)',
                '0 0 20px rgba(255, 224, 0, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
              404
            </span>
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className={`${orbitron.className} text-3xl md:text-4xl font-bold text-white mb-4`}>
            Lost in Space
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Oops! Looks like this page has drifted into the void. Let's get you back on track.
          </p>
        </motion.div>

        {/* Floating rocket animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [-5, 5, -5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-6xl"
          >
            <FaRocket className="text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-yellow-500/30 hover:bg-yellow-500 transition-colors duration-300"
              data-testid="404-home-button"
            >
              <FaHouse />
              Back to Home
            </motion.div>
          </Link>
          <Link href="/reservation">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/10 text-white font-bold py-3 px-8 rounded-full border border-white/20 hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm"
              data-testid="404-contact-button"
            >
              Contact Us
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Animated particles effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        {Array.from({ length: 20 }).map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomDelay = Math.random() * 2;

          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: randomDelay,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
