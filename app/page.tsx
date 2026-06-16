"use client";
import { C } from "@/components/landing/constants";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemBandSection } from "@/components/landing/ProblemBandSection";
import { ProductWalkthrough } from "@/components/landing/ProductWalkthrough";
import { ReferentielSection } from "@/components/landing/ReferentielSection";
import { DashboardSection } from "@/components/landing/DashboardSection";
import { ConformiteSection } from "@/components/landing/ConformiteSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemBandSection />
        <ProductWalkthrough />
        <ReferentielSection />
        <DashboardSection />
        <ConformiteSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
