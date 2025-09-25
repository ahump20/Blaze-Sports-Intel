import type { FC } from "react";

import { CapabilityGrid } from "./components/CapabilityGrid";
import { Differentiators } from "./components/Differentiators";
import { ExperienceCenter } from "./components/ExperienceCenter";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Insights } from "./components/Insights";
import {
  analyticsSuite,
  pipelineCapabilities
} from "./data/sections";

export const App: FC = () => (
  <div>
    <Header />
    <main id="main-content">
      <Hero />
      <Differentiators />
      <CapabilityGrid
        id="analytics"
        title="Command Center"
        subtitle="The mission-critical workflows from the legacy microsites, harmonized for leadership."
        capabilities={analyticsSuite}
      />
      <ExperienceCenter />
      <CapabilityGrid
        id="pipeline"
        title="AI Intelligence Pipeline"
        subtitle="End-to-end infrastructure connecting wearables, APIs, model ops, and executive storytelling."
        capabilities={pipelineCapabilities}
      />
      <Insights />
    </main>
    <Footer />
  </div>
);
