import type { FC } from 'react';

const Vision: FC = () => {
  return (
    <main
      className="min-h-screen text-white bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url("/visions_stars.png")`,
      }}
    >
      {/* The semi-transparent overlay has been removed to make the background 
        image fully visible, as per your reference image. 
      */}
      <section className="container mx-auto px-4 py-10">
         {/* The black box container has been removed. The page is now ready for your design. */}
      </section>
    </main>
  );
}

export default Vision;
