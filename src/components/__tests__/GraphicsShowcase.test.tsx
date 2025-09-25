import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GraphicsShowcase } from "../GraphicsShowcase";

describe("GraphicsShowcase", () => {
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList));

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders copy for the cinematic showcase", () => {
    render(<GraphicsShowcase />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /championship visuals rendered live/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Baseball, Football, Basketball, and Track & Field/i)).toBeVisible();
  });
});
