import { vi } from "vitest";

vi.mock("@raycast/api", () => ({
  Color: { Green: "green", Yellow: "yellow", Red: "red", Blue: "blue" },
  environment: { supportPath: "/tmp", raycastVersion: "1.104.21" },
}));

import { describe, expect, it } from "vitest";
import { buildPulseRingSvg, buildPulseSvg } from "@/ui/status-pages/status-icon";

describe("buildPulseRingSvg", () => {
  it("draws a filled dot and a ring in the given color", () => {
    const svg = buildPulseRingSvg("#FF6363");

    expect(svg).toContain("<svg");
    expect(svg.match(/#FF6363/g)).toHaveLength(2);
    expect(svg).toContain('fill="#FF6363"');
    expect(svg).toContain('stroke="#FF6363"');
  });
});

describe("buildPulseSvg", () => {
  it("draws an animated ring and a filled dot in the given color when animated", () => {
    const svg = buildPulseSvg("#FF6363", true);

    expect(svg).toContain("<svg");
    expect(svg.match(/<animate/g)).toHaveLength(2);
    expect(svg.match(/#FF6363/g)).toHaveLength(2);
    expect(svg).toContain('fill="#FF6363"');
    expect(svg).toContain('stroke="#FF6363"');
  });

  it("draws a static ring and a filled dot in the given color when not animated", () => {
    const svg = buildPulseSvg("#2ECC71", false);

    expect(svg).toContain("<svg");
    expect(svg).not.toContain("<animate");
    expect(svg.match(/#2ECC71/g)).toHaveLength(2);
    expect(svg).toContain('fill="#2ECC71"');
    expect(svg).toContain('stroke="#2ECC71"');
  });
});
