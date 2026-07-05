import { vi } from "vitest";

vi.mock("@raycast/api", () => ({
  Color: { Green: "green", Yellow: "yellow", Red: "red", Blue: "blue" },
  environment: { supportPath: "/tmp", raycastVersion: "1.104.21" },
}));

import { describe, expect, it } from "vitest";
import { buildPulseRingSvg } from "@/ui/status-pages/status-icon";

describe("buildPulseRingSvg", () => {
  it("draws a filled dot and a ring in the given color", () => {
    const svg = buildPulseRingSvg("#FF6363");

    expect(svg).toContain("<svg");
    expect(svg.match(/#FF6363/g)).toHaveLength(2);
    expect(svg).toContain('fill="#FF6363"');
    expect(svg).toContain('stroke="#FF6363"');
  });
});
