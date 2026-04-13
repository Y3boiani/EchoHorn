"use client";

import { useState } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { visionsData } from './vision-data';
import InitialCarousel from './InitialCarousel';
import SelectedVisionView from './SelectedVisionView';

const VisionsGallery: FC = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedVision = selectedId ? visionsData.find(v => v.id === selectedId) : null;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-4 mt-16">
            <motion.h1
                animate={{
                    opacity: selectedId ? 0.7 : 1,
                    y: selectedId ? -150 : 0,
                    scale: selectedId ? 0.8 : 1,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-6xl font-extralight mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)] uppercase"
            >
                Our Vision
            </motion.h1>

            <InitialCarousel onSelectVision={setSelectedId} selectedId={selectedId} />

            <AnimatePresence>
                {selectedVision && (
                    <SelectedVisionView
                        selectedVision={selectedVision}
                        onDeselect={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisionsGallery;