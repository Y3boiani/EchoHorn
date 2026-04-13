"use client";

import { motion } from "framer-motion";
import SwiperEffect from "../swiperEffect/swiperEffect";
import { Poppins } from "next/font/google";
import { FaChevronDown } from "react-icons/fa6";
import React, { useEffect, useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

/* ---------------------- FIXED FLOATING PARTICLE ---------------------- */

type ParticleConfig = {
  sizePx: string;
  duration: number;
  delay: number;
  xPercent: string;
  yPercent: string;
};

const FloatingParticle = ({ index }: { index: number }) => {
  const [cfg, setCfg] = useState<ParticleConfig | null>(null);

  useEffect(() => {
    const size = Math.random() * 3 + 1; // original: 1–4 px
    const duration = Math.random() * 4 + 3; // 3–7 s
    const delay = Math.random() * 2; // 0–2 s
    const initialX = Math.random() * 100; // %
    const initialY = Math.random() * 100; // %

    setCfg({
      sizePx: `${size}px`,
      duration,
      delay,
      xPercent: `${initialX}%`,
      yPercent: `${initialY}%`,
    });
  }, [index]);

  if (!cfg) return null;

  return (
    <motion.div
      className="absolute rounded-full bg-yellow-400/20"
      style={{
        width: cfg.sizePx,
        height: cfg.sizePx,
        left: cfg.xPercent,
        top: cfg.yPercent,
      }}
      animate={{
        y: [0, -50, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: cfg.duration,
        delay: cfg.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/* ------------------------------ HOME PAGE ----------------------------- */

export default function Home() {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-no-repeat flex items-center relative overflow-hidden"
      style={{
        backgroundImage: `url("/background.png")`,
        backgroundPosition: "75% 55%",
      }}
    >
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      {/* Text + Animated Typing */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-[5rem] font-[poppins,sans-serif] ml-[50px] leading-[1.1] select-none z-10"
      >
        <ul className="relative -mb-10 w-max" style={{ bottom: "180px" }}>
          <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className={poppins.className}>Engineering the quiet</span>
          </motion.li>

          <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className={poppins.className}> in the chaos of</span>
          </motion.li>

          <li
            className="text-[rgb(148,150,14)] w-0 overflow-hidden whitespace-nowrap border-r-2 border-[rgb(148,150,14)]"
            style={{
              animation:
                "typingLoop 4s steps(25) infinite 0.6s, blink 0.5s step-end infinite 0.6s",
            }}
          >
            <span className={poppins.className}>motion.</span>
          </li>
        </ul>
      </motion.h1>

      {/* Swiper Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="ml-10 z-10"
      >
        <SwiperEffect />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
        onClick={scrollToNext}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-white/70 hover:text-yellow-400 transition-colors duration-300"
        >
          <span className="text-sm mb-2 font-medium">Scroll Down</span>
          <FaChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes typingLoop {
          0% { width: 0; }
          40% { width: 40%; }
          60% { width: 40%; }
          90% { width: 0; }
          100% { width: 0; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
}
