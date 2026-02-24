import {
  Navbar,
  Hero,
  SocialProof,
  Benefits,
  ProductPreview,
  HowItWorks,
  Testimonials,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <Benefits />
        <ProductPreview />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
