'use client';

import React, { useRef } from 'react'; // CORRECTED: Fixed the import for useRef
import { motion, useScroll, useTransform } from 'framer-motion';
import MemberCard from './MemberCard';
import Header from '@/components/header/header';

// --- Data (Stable: defined outside component) ---
const teamMembers = [
    { id: 1, imageUrl: '/img1.png', name: 'Aarav Sharma', role: 'Founder & CEO', description: 'Visionary leader with a passion for logistics and technology, driving the future of transportation.' },
    { id: 2, imageUrl: '/img2.png', name: 'Priya Singh', role: 'Chief Technology Officer', description: 'The architectural mind behind our AI platform, ensuring robust and scalable solutions.' },
    { id: 3, imageUrl: '/img3.png', name: 'Rohan Mehta', role: 'Head of Operations', description: 'Expert in fleet management, ensuring seamless integration and operational excellence for our partners.' },
    { id: 4, imageUrl: '/img4.png', name: 'Saanvi Gupta', role: 'Lead UX Designer', description: 'Crafting intuitive and user-friendly experiences that empower both drivers and fleet owners.' },
];

export default function AboutPageContent() {
  const targetRef = useRef<HTMLDivElement>(null);
  // useScroll tracks the scroll progress of the targetRef div
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // --- Animation Definitions ---

  // Phase 1: "About Us" section fades out
  const aboutOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const aboutScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // Phase 2: "Meet the Team" title fades in, moves up, and fades out
  const teamTitleOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
  const teamTitleY = useTransform(scrollYProgress, [0.1, 0.3], ["20px", "-100px"]);

  return (
    <>
      <Header />
      {/* This div has a large height to create a scrollbar. The content inside is sticky. */}
      <div ref={targetRef} className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Fixed Background */}
          <div className="fixed inset-0 z-[-1] bg-[url('/image-15.png')] bg-cover bg-center" />

          {/* About Us Section */}
          <motion.div
            style={{ opacity: aboutOpacity, scale: aboutScale }}
            className="absolute inset-0 flex h-full w-full items-center justify-center"
          >
            <div className="text-center max-w-4xl px-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-12 text-white">About Us</h1>
              <div className="p-12 rounded-3xl text-left text-lg leading-relaxed border border-white/10 bg-[url('/rectangle-13.png')] bg-cover bg-center">
                 <p className="text-gray-200">
                    At EchoHorn, we are building an AI-powered platform that bridges the gap between light commercial vehicle drivers and fleet owners. Our mission is simple — to create a transparent ecosystem where drivers are fairly rewarded, fleet owners are confidently informed, and our roads become safer for everyone.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team Section Container */}
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center">
            <motion.h2
              style={{ opacity: teamTitleOpacity, y: teamTitleY }}
              className="text-4xl md:text-6xl font-bold text-white mb-12"
            >
              Meet the Team
            </motion.h2>

            {/* Team Member Cards appear one after another */}
            {teamMembers.map((member, index) => {
              // Each card gets its own segment of the scroll duration
              const totalCards = teamMembers.length;
              const start = 0.3 + (index / totalCards) * 0.6;
              const end = start + (1 / totalCards) * 0.6;
              
              const cardOpacity = useTransform(
                scrollYProgress,
                [start, start + 0.05, end - 0.05, end],
                [0, 1, 1, 0]
              );
              const cardScale = useTransform(
                scrollYProgress,
                [start, start + 0.05, end - 0.05, end],
                [0.95, 1, 1, 0.95]
              );

              return (
                <motion.div 
                  style={{ 
                    opacity: cardOpacity, 
                    scale: cardScale,
                    position: 'absolute',
                  }} 
                  key={member.id}
                  className="w-full flex justify-center"
                >
                  <MemberCard
                    imageUrl={member.imageUrl}
                    name={member.name}
                    role={member.role}
                    description={member.description}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}