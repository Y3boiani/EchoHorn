import React from 'react'; // Import React for React.memo

// --- Data for Feature Hotspots ---
// This data is constant and defined outside the component to prevent re-creation on every render.
const featureHotspots = [
  {
    id: 'feature-1',
    title: '✨ AI-Powered Insights',
    description: 'Discover trends and patterns automatically.',
  },
  {
    id: 'feature-2',
    title: '🚀 Real-time Collaboration',
    description: 'Work with your team from anywhere.',
  },
  {
    id: 'feature-3',
    title: '🔒 Enhanced Security',
    description: 'Your data is protected with enterprise-grade security.',
  },
  {
    id: 'feature-4',
    title: '📊 Advanced Analytics',
    description: 'Deep dive into your data with custom dashboards.',
  },
];

// --- Type Definition for Placard Props ---
// Using a specific interface instead of `any` improves type safety and code clarity.
interface PlacardProps {
  className?: string;
  title: string;
  description: string;
}

/**
 * A reusable, styled placard component for displaying feature information.
 *
 * Performance Optimizations:
 * 1.  React.memo: Wrapped in `React.memo` to prevent re-rendering when its props do not change.
 * 2.  Strongly Typed Props: Uses a `PlacardProps` interface for better type safety.
 */
const Placard = React.memo(({ className = '', title, description }: PlacardProps) => (
  <div
    className={`
      flex flex-col justify-center text-left p-8
      bg-neutral-900/25
      backdrop-blur-2xl
      rounded-3xl
      border border-white/5
      shadow-[0_8px_32px_rgba(120,80,220,0.25)]
      transition-all duration-300
      hover:border-white/20
      hover:shadow-[0_8px_40px_rgba(120,80,220,0.4)]
      pointer-events-auto
      ${className}
    `}
  >
    <div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  </div>
));
Placard.displayName = 'Placard';

/**
 * Displays a grid of feature placards.
 *
 * Performance Optimizations:
 * 1.  Component Memoization: The main component is wrapped in `React.memo`.
 * 2.  Child Component Memoization: Uses the memoized `Placard` component.
 * 3.  Stable Data Source: `featureHotspots` array is defined outside the component scope.
 */
const FeaturePlacards = React.memo(() => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-10 text-white">
        Features
      </h1>
      
      {/* The layout is intentionally asymmetric, so manual placement is preserved. */}
      <div className="flex flex-col gap-6" style={{ width: '950px' }}>
        
        {/* Top Row */}
        <div className="flex gap-6">
          <Placard
            className="w-1/2 h-72"
            title={featureHotspots[0].title}
            description={featureHotspots[0].description}
          />
          <Placard
            className="w-1/2 h-72"
            title={featureHotspots[1].title}
            description={featureHotspots[1].description}
          />
        </div>

        {/* Bottom Row */}
        <div className="flex gap-6">
          <Placard
            className="w-1/3 h-52"
            title={featureHotspots[2].title}
            description={featureHotspots[2].description}
          />
          <Placard
            className="w-2/3 h-52"
            title={featureHotspots[3].title}
            description={featureHotspots[3].description}
          />
        </div>
      </div>
    </div>
  );
});
FeaturePlacards.displayName = 'FeaturePlacards';

export default FeaturePlacards;