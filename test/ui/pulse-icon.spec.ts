import { vi } from "vitest";

vi.mock("@raycast/api", () => ({
  Color: { Green: "green", Yellow: "yellow", Red: "red", Blue: "blue" },
  environment: { supportPath: "/tmp", raycastVersion: "1.104.21" },
}));

import { describe, expect, it } from "vitest";
import { buildPulseFrames } from "@/ui/pulse-icon";

describe("buildPulseFrames", () => {
  it("builds a sequence of frames with a growing, fading ring in the given color", () => {
    const frames = buildPulseFrames("#FF6363");

    expect(frames).toHaveLength(2);
    frames.forEach((svg) => {
      expect(svg).toContain("<svg");
      expect(svg).toContain('fill="#FF6363"');
      expect(svg).toContain('stroke="#FF6363"');
    });

    expect(frames[0]).toContain('r="6"');
    expect(frames[0]).toContain('opacity="0.45"');
    expect(frames[frames.length - 1]).toContain('r="7"');
    expect(frames[frames.length - 1]).toContain('opacity="0.00"');
  });

  it("defaults to a 16x16 rendered size", () => {
    const frames = buildPulseFrames("#FF6363");

    frames.forEach((svg) => {
      expect(svg).toContain('width="16"');
      expect(svg).toContain('height="16"');
    });
  });

  it("scales the rendered size without changing the underlying circle geometry", () => {
    const frames = buildPulseFrames("#FF6363", 24);

    frames.forEach((svg) => {
      expect(svg).toContain('width="24"');
      expect(svg).toContain('height="24"');
      expect(svg).toContain('viewBox="0 0 16 16"');
    });

    expect(frames[0]).toContain('r="6"');
    expect(frames[frames.length - 1]).toContain('r="7"');
  });
});
