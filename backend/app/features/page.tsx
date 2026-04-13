import Header from "@/components/header/header";
import Galaxy from "@/components/features/galaxy";
import FeaturePlacards from "@/components/features/placcard";

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="relative w-full h-screen overflow-hidden">
        {/* The Galaxy animation renders as the background */}
        <Galaxy />
        
        {/* This container centers the placards and allows clicks to pass through to the galaxy */}
        <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
          <FeaturePlacards />
        </div>
      </main>
    </>
  );
}