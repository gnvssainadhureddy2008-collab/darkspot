import { createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import SignalGrid from "@/components/landing/SignalGrid";
import EngineSection from "@/components/landing/EngineSection";
import CapabilitySection from "@/components/landing/CapabilitySection";
import { FinalCta, SiteFooter } from "@/components/landing/ClosingSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DARKSPOT — Find what your sources never say" },
      {
        name: "description",
        content:
          "DARKSPOT maps the information gaps, contradictions, outdated facts and unsupported claims inside your research sources.",
      },
      { property: "og:title", content: "DARKSPOT — Research intelligence" },
      {
        property: "og:description",
        content: "An AI research engine that reports what your evidence base is missing.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main>
        <Hero />
        <SignalGrid />
        <EngineSection />
        <CapabilitySection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}