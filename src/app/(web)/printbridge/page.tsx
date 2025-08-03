'use client';

import PrintBridgeHeroSection from '@/components/printbridge/HeroSection';
import PrintBridgeProblemSection from '@/components/printbridge/ProblemSection';
import PrintBridgeSolutionSection from '@/components/printbridge/SolutionSection';
import PrintBridgeCompetitiveAdvantagesSection from '@/components/printbridge/CompetitiveAdvantagesSection';
import PrintBridgeTechnicalSpecsSection from '@/components/printbridge/TechnicalSpecsSection';
import PrintBridgeUseCasesSection from '@/components/printbridge/UseCasesSection';
import PrintBridgeGetStartedSection from '@/components/printbridge/GetStartedSection';
import PrintBridgeFinalCTASection from '@/components/printbridge/FinalCTASection';

export default function PrintBridgePage() {
  return (
    <div className="min-h-screen bg-white">
      <PrintBridgeHeroSection />
      <PrintBridgeProblemSection />
      <PrintBridgeSolutionSection />
      <PrintBridgeCompetitiveAdvantagesSection />
      <PrintBridgeTechnicalSpecsSection />
      <PrintBridgeUseCasesSection />
      <PrintBridgeGetStartedSection />
      <PrintBridgeFinalCTASection />
    </div>
  );
} 