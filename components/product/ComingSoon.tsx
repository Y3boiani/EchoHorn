'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Orbitron } from 'next/font/google';
import { FaBell } from 'react-icons/fa6';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const Star = React.memo(() => {
  const size = Math.random() * 2 + 1;
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;
  const duration = Math.random() * 2 + 1;

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
        willChange: 'opacity',
      }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
});
Star.displayName = 'Star';

const FloatingText = React.memo(() => {
    const text = "Coming Soon...";
    return (
        <h1 className={`${orbitron.className} text-5xl md:text-7xl font-bold text-white text-center tracking-widest drop-shadow-2xl`}>
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: index * 0.1 }}
                    style={{ display: 'inline-block', willChange: 'transform' }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </h1>
    );
});
FloatingText.displayName = 'FloatingText';

export default function ComingSoon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTarget) return;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };

  const starsX = useTransform(mouseX, [0, 1], ["5%", "-5%"]);
  const starsY = useTransform(mouseY, [0, 1], ["5%", "-5%"]);
  const textX = useTransform(mouseX, [0, 1], ["-2%", "2%"]);
  const textY = useTransform(mouseY, [0, 1], ["-5%", "5%"]);
  
  const mouseXPercent = useTransform(mouseX, val => `${val * 100}%`);
  const mouseYPercent = useTransform(mouseY, val => `${val * 100}%`);
  
  const aurora = useMotionTemplate`
    radial-gradient(400px at ${mouseXPercent} ${mouseYPercent}, rgba(29, 78, 216, 0.15), transparent 80%)
  `;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsSubmitted(true);
    setError('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center"
    >
        <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/Coming_Soon.png')`, scale: 1.1, willChange: 'transform' }}
        />
        <motion.div
            className="absolute inset-0 z-10"
            style={{ backgroundImage: aurora, willChange: 'background-image' }}
        />
        <motion.div
            className="absolute inset-[-10%] z-20"
            style={{ x: starsX, y: starsY, willChange: 'transform' }}
        >
            {Array.from({ length: 100 }).map((_, i) => (
                <Star key={i} />
            ))}
        </motion.div>
        
        <motion.div 
            className="relative z-30 flex flex-col items-center"
            style={{ x: textX, y: textY, willChange: 'transform' }}
        >
            <FloatingText />
            
            {/* Newsletter signup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12 w-full max-w-md px-4"
            >
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-white/80 text-center mb-6 text-lg">
                                Get notified when we launch
                            </p>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        data-testid="newsletter-email-input"
                                        placeholder="Enter your email"
                                        className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm"
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm mt-2 ml-4"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </div>
                                <motion.button
                                    type="submit"
                                    data-testid="newsletter-submit-button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-500 transition-colors duration-300 shadow-lg shadow-yellow-500/30"
                                >
                                    <FaBell />
                                    Notify Me
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
                            >
                                <motion.svg
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="w-8 h-8 text-green-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <motion.path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </motion.svg>
                            </motion.div>
                            <p className="text-white text-xl font-semibold">
                                You're on the list! 🎉
                            </p>
                            <p className="text-white/60 mt-2">
                                We'll notify you when we launch
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    </div>
  );
}