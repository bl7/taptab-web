'use client';

import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StickyForm from '@/components/home/StickyForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left Side - 50vw Content Sections */}
        <div className="w-1/2">
          <HeroSection />
          <FeaturesSection />
          <TestimonialsSection />
        </div>
        
        {/* Right Side - Sticky Form */}
        <StickyForm />
      </div>
    </div>
  );
}
