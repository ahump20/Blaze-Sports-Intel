import { z } from "zod";

import type { IconName } from "../components/Icon";

const iconSchema = z.enum(["dashboard", "brain", "chart", "shield", "layers", "sparkle"]);

const capabilitySchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: iconSchema
});

const experienceSchema = z.object({
  sport: z.enum(["Baseball", "Football", "Basketball", "Track & Field"]),
  headline: z.string(),
  subheading: z.string(),
  cta: z.string(),
  badge: z.string()
});

const insightSchema = z.object({
  title: z.string(),
  summary: z.string(),
  metric: z.string()
});

export const analyticsSuite = capabilitySchema.array().parse([
  {
    title: "Command Center",
    description:
      "Unify scouting intel, roster health, and win probability into one executive control tower.",
    icon: "dashboard"
  },
  {
    title: "Neural Coach",
    description:
      "AI-generated practice plans with constraint-based adjustments and player biometric feedback.",
    icon: "brain"
  },
  {
    title: "Revenue Flight Deck",
    description:
      "Pipeline sponsorship ROI, NIL activation, and premium inventory utilization in real time.",
    icon: "chart"
  }
]);

export const experiences = experienceSchema.array().parse([
  {
    sport: "Baseball",
    headline: "Cardinals Precision Lab",
    subheading:
      "3D ball-flight heatmaps and defensive shift scenarios layered with weather-adjusted pitching models.",
    cta: "Launch MLB Control Room",
    badge: "Pro"
  },
  {
    sport: "Football",
    headline: "Titans Sideline Intel",
    subheading:
      "Live coverage integrates play-calling tendencies, player GPS loads, and situational readiness alerts.",
    cta: "View NFL War Room",
    badge: "Live"
  },
  {
    sport: "Basketball",
    headline: "Grizzlies Momentum Engine",
    subheading:
      "Possession-by-possession shot quality and neural highlight reels drive executive storytelling.",
    cta: "Enter NBA Experience",
    badge: "Spotlight"
  },
  {
    sport: "Track & Field",
    headline: "Longhorns Velocity Hub",
    subheading:
      "Biomechanics capture, wind calibration, and recruiting radars guide every meet decision.",
    cta: "Explore NCAA Suite",
    badge: "Elite"
  }
]);

export const pipelineCapabilities = capabilitySchema.array().parse([
  {
    title: "Data Fusion Layer",
    description:
      "Secure ingest from wearables, league APIs, and custom scouts with automated anomaly detection.",
    icon: "shield"
  },
  {
    title: "Model Operations",
    description:
      "Versioned model registry, automated validation, and blue/green deployment for real-time inference.",
    icon: "layers"
  },
  {
    title: "Storytelling Studio",
    description:
      "Executive-grade visuals, media embeds, and sponsor overlays built from a single metrics fabric.",
    icon: "sparkle"
  }
]);

export const strategicInsights = insightSchema.array().parse([
  {
    title: "Unified Data Layer",
    summary: "43 disparate tools consolidated into one secure Blaze Intelligence workspace.",
    metric: "-63% tech overhead"
  },
  {
    title: "Decision Velocity",
    summary: "Coaching adjustments deployed in under 90 seconds with automated QA checkpoints.",
    metric: "4.6x faster calls"
  },
  {
    title: "Executive Adoption",
    summary: "Stakeholder dashboards with WCAG AA accessibility drive sustained leadership engagement.",
    metric: "97% active usage"
  }
]);

export type AnalyticsCapability = (typeof analyticsSuite)[number];
export type Experience = (typeof experiences)[number];
export type PipelineCapability = (typeof pipelineCapabilities)[number];
export type StrategicInsight = (typeof strategicInsights)[number];
export type CapabilityIcon = IconName;
