import HeroCommandCenter from "@/components/sections/HeroCommandCenter";
import ProblemSection from "@/components/sections/ProblemSection";
import SolutionOverview from "@/components/sections/SolutionOverview";
import WhySkyERPSection from "@/components/sections/WhySkyERPSection";
import ModuleGrid from "@/components/sections/ModuleGrid";
import IndustryGrid from "@/components/sections/IndustryGrid";
import AISection from "@/components/sections/AISection";
import MarketplaceSection from "@/components/sections/MarketplaceSection";
import ReportsSection from "@/components/sections/ReportsSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import SecuritySection from "@/components/sections/SecuritySection";
import PricingPreview from "@/components/sections/PricingPreview";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTA from "@/components/sections/FinalCTA";
import JsonLd from "@/components/seo/JsonLd";
import { softwareSchema } from "@/lib/seo/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareSchema()} />
      <HeroCommandCenter />
      <ProblemSection />
      <SolutionOverview />
      <WhySkyERPSection />
      <ModuleGrid />
      <IndustryGrid />
      <AISection />
      <MarketplaceSection />
      <ReportsSection />
      <IntegrationsSection />
      <SecuritySection />
      <PricingPreview />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
