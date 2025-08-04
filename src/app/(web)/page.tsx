'use client';

import HeroSection from '@/components/home/HeroSection';
import ProblemSection from '@/components/home/ProblemSection';
import SolutionSection from '@/components/home/SolutionSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import UseCasesSection from '@/components/home/UseCasesSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import SocialProofSection from '@/components/home/SocialProofSection';
import FinalCTASection from '@/components/home/FinalCTASection';
import StickyForm from '@/components/home/StickyForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left Side - Content Sections (60%) */}
        <div className="w-3/5">
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <UseCasesSection />
          <FeaturesSection />
          <SocialProofSection />
          <FinalCTASection />
        </div>

        {/* Right Side - Sticky Form (40%) */}
        <StickyForm />
      </div>
    </div>
  );
}
