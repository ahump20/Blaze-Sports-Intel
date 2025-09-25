import { describe, expect, it } from "vitest";

import { analyticsSuite, experiences, pipelineCapabilities } from "../sections";

const sportOrder = ["Baseball", "Football", "Basketball", "Track & Field"] as const;

describe("section data integrity", () => {
  it("uses icons that map to supported components", () => {
    const supportedIcons = new Set(["dashboard", "brain", "chart", "shield", "layers", "sparkle"]);
    [...analyticsSuite, ...pipelineCapabilities].forEach((capability) => {
      expect(supportedIcons.has(capability.icon)).toBe(true);
    });
  });

  it("keeps experiences sorted by sport priority", () => {
    const indices = experiences.map((experience) => sportOrder.indexOf(experience.sport));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });
});
