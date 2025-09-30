"use client";

import type { FC } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { visionsData,} from './vision-data';

interface InitialCarouselProps {
  onSelectVision: (id: number) => void;
  selectedId: number | null;
}

const InitialCarousel: FC<InitialCarouselProps> = React.memo(({ onSelectVision, selectedId }) => {
  const getCarouselSize = (index: number) => [100, 140, 180, 140, 100][index];

  return (
    <div className="w-full flex items-center justify-center space-x-8">
      {visionsData.map((vision, index) => {
        const size = getCarouselSize(index);
        const isCenterImage = index === 2;

        return (
          <motion.div
            key={vision.id}
            layoutId={`vision-card-${vision.id}`}
            onClick={() => onSelectVision(vision.id)}
            className="cursor-pointer rounded-full overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, width: size, height: size }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
            whileHover={{ y: -15, scale: 1.05, rotate: isCenterImage ? 0 : (index % 2 === 0 ? -5 : 5), zIndex: 10 }}
          >
            <motion.div
              className="w-full h-full"
              style={{ opacity: selectedId ? 0 : (isCenterImage ? 1 : 0.6) }}
              whileHover={{ opacity: 1 }}
            >
              <Image
                src={vision.imgSrc}
                alt={vision.title}
                width={size}
                height={size}
                className="object-cover w-full h-full"
                priority={isCenterImage} // Prioritize loading the main, central image
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
});
InitialCarousel.displayName = 'InitialCarousel';

export default InitialCarousel;