import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { LiveSimulation } from "@/components/landing/LiveSimulation";
import { StatsSection } from "@/components/landing/StatsSection";
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
			<ForEveryoneSection />
			<Footer />
		</main>
	);
}
