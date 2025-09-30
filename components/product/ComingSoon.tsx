'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

// --- OPTIMIZATION 1: Memoized Components ---
// By wrapping our static components in React.memo, we prevent them from
// re-rendering every time the mouse moves, which is a significant performance win.

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
        // --- OPTIMIZATION 2: Browser Animation Hint ---
        // 'will-change' tells the browser to prepare for this property to be animated,
        // allowing it to optimize rendering.
        willChange: 'opacity',
      }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
});
Star.displayName = 'Star'; // Helps in debugging

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
  
  // --- OPTIMIZATION 3: Declarative Motion Template ---
  // Using motion values directly in the template is more idiomatic and performant.
  const mouseXPercent = useTransform(mouseX, val => `${val * 100}%`);
  const mouseYPercent = useTransform(mouseY, val => `${val * 100}%`);
  
  const aurora = useMotionTemplate`
    radial-gradient(400px at ${mouseXPercent} ${mouseYPercent}, rgba(29, 78, 216, 0.15), transparent 80%)
  `;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center"
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
            className="relative z-30"
            style={{ x: textX, y: textY, willChange: 'transform' }}
        >
            <FloatingText />
        </motion.div>
    </div>
  );
}