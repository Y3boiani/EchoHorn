"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import { EffectCoverflow, Pagination } from "swiper/modules";

const slideData = [
  { id: 1, src: "/sliderimg1.png", alt: "Slider Image 1" },
  { id: 2, src: "/sliderimg1.png", alt: "Slider Image 2" },
  { id: 3, src: "/sliderimg1.png", alt: "Slider Image 3" },
  { id: 4, src: "/sliderimg1.png", alt: "Slider Image 4" },
  { id: 5, src: "/sliderimg1.png", alt: "Slider Image 5" },
];

export default function SwiperEffect() {
  return (
    // 1. Adjusted the container size to be more compact
    <div
      className="relative w-[350px] h-[500px] flex justify-center items-center"
    >
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination]}
        className="w-full h-full"
      >
        {slideData.map((slide) => (
          // 2. Adjusted slide dimensions
          <SwiperSlide key={slide.id} className="!w-[300px] !h-[450px] bg-transparent flex justify-center items-center">
            <Image
              src={slide.src}
              alt={slide.alt}
              width={300} 
              height={450}
              className="w-full h-full object-contain rounded-2xl shadow-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}