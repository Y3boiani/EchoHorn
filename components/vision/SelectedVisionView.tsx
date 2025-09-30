"use client";

import type { FC } from 'react';
import React from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { visionsData, type Vision } from './vision-data';

interface SelectedVisionViewProps {
  selectedVision: Vision;
  onDeselect: () => void;
}

const SelectedVisionView: FC<SelectedVisionViewProps> = React.memo(({ selectedVision, onDeselect }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-400, 400], [5, -5]);
  const rotateY = useTransform(x, [-400, 400], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const getArcPosition = (index: number, total: number, radius: number) => {
    const angle = (index / (total - 1)) * Math.PI;
    return { x: -radius * Math.sin(angle), y: radius * Math.cos(angle) };
  };

  const thumbnailVisions = visionsData.filter(v => v.id !== selectedVision.id);

  return (
    <motion.div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
      {/* Full-screen overlay */}
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
        onClick={onDeselect}
      />
      <motion.div
        className="w-full max-w-7xl h-full flex flex-col md:flex-row gap-8 items-center justify-center relative"
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      >
        {/* Left Side: Interactive Image Arc */}
        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center"
          style={{ perspective: 1000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div className="relative w-[500px] h-[500px]" style={{ rotateX, rotateY }}>
            <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${selectedVision.glowColor}22 0%, transparent 60%)` }} />
            <motion.div layoutId={`vision-card-${selectedVision.id}`} className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={onDeselect}>
              <Image
                key={selectedVision.id}
                src={selectedVision.imgSrc}
                alt={selectedVision.title}
                width={320}
                height={320}
                className="object-cover rounded-full shadow-2xl shadow-black/50"
                priority // This image is important when selected, so we prioritize it
              />
            </motion.div>
            {/* Thumbnail Arc */}
            {thumbnailVisions.map((vision, index) => {
              const { x, y } = getArcPosition(index, thumbnailVisions.length, 220);
              return (
                <motion.div
                  key={vision.id}
                  className="absolute cursor-pointer rounded-full overflow-hidden bg-black/30 border-2 border-transparent hover:border-yellow-400"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 + index * 0.1 }}
                  style={{ top: `calc(50% - 50px + ${y}px)`, left: `calc(50% - 50px + ${x}px)`, width: '100px', height: '100px' }}
                  whileHover={{ scale: 1.15, opacity: 1, zIndex: 10 }}
                >
                  <Image src={vision.imgSrc} alt={vision.title} width={100} height={100} className="object-contain p-2" />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Right Side: Text Content */}
        <motion.div className="w-full md:w-1/2 text-center md:text-left relative">
          <AnimatePresence mode="wait">
            <motion.h2 key={`title-${selectedVision.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="relative text-4xl lg:text-5xl font-bold text-yellow-400 mb-6">{selectedVision.title}</motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p key={`desc-${selectedVision.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: 0.1, duration: 0.5 }} className="relative text-xl lg:text-2xl text-white/80 leading-relaxed">{selectedVision.description}</motion.p>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
SelectedVisionView.displayName = 'SelectedVisionView';

export default SelectedVisionView;