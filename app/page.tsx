import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
	return (
		<main className="min-h-screen">
			<HeroSection />
			<FeatureGrid />
			<HowItWorksSection />
			<Footer />
		</main>
	);
}
