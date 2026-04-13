import type { FC } from 'react';
import Header from "../../components/header/header"; // Corrected to relative path
import VisionsGallery from '@/components/vision/visions_gallery';

const VisionPage: FC = () => {
  return (
    <>
      <Header />
      {/* This main element now acts as the container with the background */}
      <main
        className="min-h-screen text-white bg-cover bg-center bg-fixed overflow-hidden flex flex-col justify-center items-center p-4"
        style={{ backgroundImage: `url("/visions_stars.png")` }}
      >
        {/* The gallery is now correctly placed INSIDE the container */}
        <VisionsGallery />
      </main>
    </>
  );
};

export default VisionPage;

