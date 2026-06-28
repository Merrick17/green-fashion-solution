import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Services } from "@/components/landing/services";
import { ProposalShowcase } from "@/components/landing/proposal-showcase";
import { StoryJourney } from "@/components/landing/story-journey";
import { GlobalPresence } from "@/components/landing/global-presence";
import { TrustSection } from "@/components/landing/trust-section";
import { Faq } from "@/components/landing/faq";
import { LeadForm } from "@/components/landing/lead-form";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <ProposalShowcase />
        <StoryJourney />
        <GlobalPresence />
        <TrustSection />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
