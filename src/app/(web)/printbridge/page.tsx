'use client';

import PrintBridgeHeroSection from '@/components/printbridge/HeroSection';
import PrintBridgeIntegrationSection from '@/components/printbridge/IntegrationSection';
import PrintBridgeProblemSection from '@/components/printbridge/ProblemSection';
import PrintBridgeBrowserSection from '@/components/printbridge/BrowserSection';
import PrintBridgeSolutionSection from '@/components/printbridge/SolutionSection';
import PrintBridgeCompetitiveAdvantagesSection from '@/components/printbridge/CompetitiveAdvantagesSection';
import PrintBridgeTechnicalSpecsSection from '@/components/printbridge/TechnicalSpecsSection';
import PrintBridgeUseCasesSection from '@/components/printbridge/UseCasesSection';
import PrintBridgeGetStartedSection from '@/components/printbridge/GetStartedSection';

export default function PrintBridgePage() {
  return (
    <div className="bg-white">
      <PrintBridgeHeroSection />
      <PrintBridgeProblemSection />
      <PrintBridgeBrowserSection />
      <PrintBridgeSolutionSection />
      <PrintBridgeCompetitiveAdvantagesSection />
      <PrintBridgeTechnicalSpecsSection />
      <PrintBridgeUseCasesSection />
      <PrintBridgeGetStartedSection />
      <PrintBridgeIntegrationSection />
    </div>
  );
} 