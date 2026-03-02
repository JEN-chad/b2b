import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProcessSteps } from "@/components/ProcessSteps";
import { TimelineComparison } from "@/components/TimelineComparison";
import { MetricsHighlights } from "@/components/MetricsHighlights";
import { BubbleEffect } from "@/components/BubbleEffect";
import { Footer } from "@/components/Footer";

export default function HomePage() {
    return (
        <main className="min-h-screen relative flex flex-col pt-4">
            <BubbleEffect />
            <div className="z-10 flex flex-col">
                <Header />
                <HeroSection />
                <ProcessSteps />
                <TimelineComparison />
                <MetricsHighlights />
                <Footer />
            </div>
        </main>
    );
}
