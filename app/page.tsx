import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LiveSimulation } from "@/components/landing/LiveSimulation";
import { TemplateLibrary } from "@/components/landing/TemplateLibrary";
import { StatsSection } from "@/components/landing/StatsSection";
import { VideoSection } from "@/components/landing/VideoSection";
import { ForEveryoneSection } from "@/components/landing/ForEveryoneSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
	return (
		<main className="min-h-screen bg-[#F8F9FA]">
			<LandingNavbar />
			<HeroSection />
			<StatsSection />
			<FeatureGrid />
			<LiveSimulation />
			<HowItWorksSection />
			<TemplateLibrary />
			<VideoSection />
			<ForEveryoneSection />
			<Footer />
		</main>
	);
}
