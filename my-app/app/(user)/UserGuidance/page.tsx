"use client";

import GuidanceHero from "@/components/guidance/Guidancehero";
import StepsSection from "@/components/guidance/Stepssection";
import DietaryAndGroupSection from "@/components/guidance/Dietaryandgroupsection";
import SupportAndEcoSection from "@/components/guidance/Supportandecosection";
import FaqSection from "@/components/guidance/Faqsection";
import ContactCtaBanner from "@/components/guidance/Contactctabanner";
import Footer from "@/components/Footer";

export default function GuidancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* <GuidanceHero /> */}
      <StepsSection />
      <DietaryAndGroupSection />
      <SupportAndEcoSection />
      <FaqSection />
      <ContactCtaBanner />
      <Footer />
    </div>
  );
}