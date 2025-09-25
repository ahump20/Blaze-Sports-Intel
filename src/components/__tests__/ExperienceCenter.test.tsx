import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { experiences } from "../../data/sections";
import { ExperienceCenter } from "../ExperienceCenter";

describe("ExperienceCenter", () => {
  it("renders each sport-specific showcase in the expected order", () => {
    render(<ExperienceCenter />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    const sportsOrder = experiences.map((experience) => experience.sport);

    expect(headings).toHaveLength(experiences.length);
    headings.forEach((heading, index) => {
      expect(heading.textContent).toBe(experiences[index].headline);
      expect(sportsOrder[index]).toBe(experiences[index].sport);
    });
  });
});
