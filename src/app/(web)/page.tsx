'use client';

import HeroSection from '@/components/home/HeroSection';
import SummarySection from '@/components/home/SummarySection';
import TargetAudienceSection from '@/components/home/TargetAudienceSection';
import BrandPromiseSection from '@/components/home/BrandPromiseSection';
import BeforeAfterSection from '@/components/home/BeforeAfterSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StickyForm from '@/components/home/StickyForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left Side - Content Sections */}
        <div className="w-1/2">
          <HeroSection />
          <SummarySection />
          <TargetAudienceSection />
          <BrandPromiseSection />
          <BeforeAfterSection />
          <FeaturesSection />
          <TestimonialsSection />
        </div>
        
        {/* Right Side - Sticky Form */}
        <StickyForm />
      </div>
    </div>
  );
}
