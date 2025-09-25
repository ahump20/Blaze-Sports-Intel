import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { uniqueDifferentiators } from "../../data/sections";
import { Differentiators } from "../Differentiators";

describe("Differentiators", () => {
  it("lists each Blaze Intelligence differentiator with its proof point", () => {
    render(<Differentiators />);

    uniqueDifferentiators.forEach((differentiator) => {
      expect(screen.getByRole("heading", { level: 3, name: differentiator.title })).toBeVisible();
      expect(screen.getByText(differentiator.proof, { exact: false })).toBeVisible();
    });
  });
});
