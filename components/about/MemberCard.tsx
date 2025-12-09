'use client';

import Image from "next/image";

const MemberCard = ({
  imageUrl,
  name,
  role,
  description,
}: {
  imageUrl: string;
  name: string;
  role: string;
  description: string;
}) => {
  return (
    // 1. Increased max-width for a larger card and used grid for proportional scaling
    <div className="grid grid-cols-1 md:grid-cols-3 items-center p-12 gap-12 rounded-3xl border border-white/10 w-full max-w-6xl bg-cover bg-center bg-[url('/rectangle-13.png')]">
      {/* 2. Image container now takes up 1 of 3 columns */}
      <div className="flex justify-center md:col-span-1">
        <Image
          src={imageUrl}
          alt={`Photo of ${name}`}
          width={240}            // 3. Increased image size
          height={240}
          className="rounded-full object-cover w-48 h-48 md:w-60 md:h-60 border-4 border-sky-400/60 flex-shrink-0"
        />
      </div>

      {/* 4. Text container now takes up 2 of 3 columns for generous space */}
      <div className="text-center md:text-left md:col-span-2">
        <h3 className="text-5xl font-bold text-white">{name}</h3>
        <p className="text-sky-400 text-2xl font-semibold mt-3">{role}</p>
        <p className="mt-8 text-gray-200 text-xl leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default MemberCard;
