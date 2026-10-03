import { vi } from "vitest";

vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(() => ({
    apiToken: "test-token",
  })),
  environment: { supportPath: "/tmp", raycastVersion: "2.0.0", appearance: "dark" },
}));

vi.mock("@/common/utils/svg-utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/common/utils/svg-utils")>()),
  toImageDataUri: vi.fn(async (svg: string) => `data:${svg}`),
}));

vi.mock("@/ui/monitors/components/monitor-status-header", () => ({
  buildMonitorStatusHeaderSvg: vi.fn(async () => "header"),
}));

vi.mock("@/ui/monitors/components/monitor-availability-table", () => ({
  buildMonitorAvailabilityTableSvg: vi.fn(async () => "table"),
  buildMonitorAvailabilitySkeletonSvg: vi.fn(async () => "skeleton"),
  getMonitorAvailabilityTableHeight: vi.fn((rowCount: number) => rowCount * 100),
}));

import { describe, expect, it } from "vitest";
import {
  buildMonitorDetailMarkdown,
  prerenderMonitorDetailImages,
  renderMonitorAvailability,
} from "@/ui/monitors/monitor-detail-renderer";
import { buildMonitorStatusHeaderSvg } from "@/ui/monitors/components/monitor-status-header";
import {
  buildMonitorAvailabilitySkeletonSvg,
  buildMonitorAvailabilityTableSvg,
} from "@/ui/monitors/components/monitor-availability-table";
import { Monitor, MonitorStatus } from "@/domain/monitor";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";

const monitor: Monitor = {
  id: "1",
  name: "Homepage",
  url: "https://example.com",
  monitorType: "http",
  status: MonitorStatus.UP,
  checkFrequency: 180,
  lastCheckedAt: undefined,
  createdAt: undefined,
  httpMethod: "get",
  requestTimeout: 30,
  recoveryPeriod: 0,
  regions: ["us", "eu"],
  sslExpiration: 30,
  domainExpiration: 365,
};

const periods: MonitorAvailabilityPeriod[] = [
  {
    label: "Today",
    sla: { availability: 100, totalDowntime: 0, numberOfIncidents: 0, longestIncident: 0, averageIncident: 0 },
  },
  {
    label: "Last 7 days",
    sla: { availability: 99.98, totalDowntime: 600, numberOfIncidents: 3, longestIncident: 300, averageIncident: 200 },
  },
];

describe("buildMonitorDetailMarkdown", () => {
  it("shows the URL right under the header, before the availability table", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, "![status](data:header)", "![availability](data:table)");
    expect(markdown).toMatch(/^!\[status\]\(data:header\)\n\nexample\.com\n\n### Availability/);
    expect(markdown).not.toContain("| URL |");
  });

  it("does not repeat the URL when the monitor is named after it", () => {
    const unnamedMonitor: Monitor = { ...monitor, name: "https://example.com" };
    const markdown = buildMonitorDetailMarkdown(unnamedMonitor, "![status](data:header)", "availability");
    expect(markdown).not.toContain("example.com");
  });

  it("uses the given header markdown", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, "![status](data:image/png;base64,AAAA)", "availability");
    expect(markdown).toContain("![status](data:image/png;base64,AAAA)");
    expect(markdown).not.toContain("## Homepage");
  });

  it("renders the details table with formatted values", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, "header", "availability");
    expect(markdown).toContain("### Details");
    expect(markdown).toContain("| Type | Http |");
    expect(markdown).toContain("| Method | GET |");
    expect(markdown).toContain("| Check frequency | 3m |");
    expect(markdown).toContain("| Request timeout | 30s |");
    expect(markdown).toContain("| Regions | US, EU |");
    expect(markdown).toContain("| SSL expiration | 30 days |");
    expect(markdown).toContain("| Domain expiration | 365 days |");
  });

  it("omits detail rows for absent fields", () => {
    const bareMonitor: Monitor = {
      ...monitor,
      monitorType: undefined,
      httpMethod: undefined,
      checkFrequency: undefined,
      requestTimeout: undefined,
      recoveryPeriod: undefined,
      regions: [],
      sslExpiration: undefined,
      domainExpiration: undefined,
    };
    const markdown = buildMonitorDetailMarkdown(bareMonitor, "header", "availability");
    expect(markdown).not.toContain("| Type |");
    expect(markdown).not.toContain("| Method |");
    expect(markdown).not.toContain("| Regions |");
    expect(markdown).not.toContain("| Recovery period |");
    expect(markdown).not.toContain("| Last checked |");
  });

  it("omits the details section when no details are known", () => {
    const bareMonitor: Monitor = {
      ...monitor,
      monitorType: undefined,
      httpMethod: undefined,
      checkFrequency: undefined,
      requestTimeout: undefined,
      recoveryPeriod: undefined,
      regions: [],
      sslExpiration: undefined,
      domainExpiration: undefined,
    };
    const markdown = buildMonitorDetailMarkdown(bareMonitor, "header", "availability");
    expect(markdown).not.toContain("### Details");
  });

  it("places the availability markdown under its heading", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, "header", "![availability](data:table)");
    expect(markdown).toContain("### Availability\n\n![availability](data:table)");
  });
});

describe("renderMonitorAvailability", () => {
  it("renders the loaded table as an image", async () => {
    const markdown = await renderMonitorAvailability(monitor, { periods, isLoading: false, isError: false });
    expect(buildMonitorAvailabilityTableSvg).toHaveBeenCalledWith(periods);
    expect(markdown).toBe("![availability](data:table)");
  });

  it("renders a skeleton with every period label while loading", async () => {
    const markdown = await renderMonitorAvailability(monitor, { periods: [], isLoading: true, isError: false });
    expect(buildMonitorAvailabilitySkeletonSvg).toHaveBeenCalledWith([
      "Today",
      "Last 7 days",
      "Last 30 days",
      "Last 365 days",
      "All time",
    ]);
    expect(markdown).toBe("![availability](data:skeleton)");
  });

  it("shows a note when there is no availability data", async () => {
    const markdown = await renderMonitorAvailability(monitor, { periods: [], isLoading: false, isError: false });
    expect(markdown).toBe("_No availability data._");
  });

  it("shows an error note when availability failed to load", async () => {
    const markdown = await renderMonitorAvailability(monitor, { periods: [], isLoading: false, isError: true });
    expect(markdown).toBe("_Failed to load availability data._");
  });
});

describe("prerenderMonitorDetailImages", () => {
  it("renders the status header and the availability skeleton", async () => {
    const images = await prerenderMonitorDetailImages(monitor);
    expect(images).toEqual({
      headerMarkdown: "![status](data:header)",
      availabilitySkeletonMarkdown: "![availability](data:skeleton)",
    });
  });

  it("reuses the images rendered for the same monitor", async () => {
    const cachedMonitor: Monitor = { ...monitor, name: "Cached" };
    const callCountBefore = vi.mocked(buildMonitorStatusHeaderSvg).mock.calls.length;
    await prerenderMonitorDetailImages(cachedMonitor);
    await prerenderMonitorDetailImages(cachedMonitor);
    expect(vi.mocked(buildMonitorStatusHeaderSvg).mock.calls.length - callCountBefore).toBe(1);
  });

  it("falls back to a text header when the header fails to render", async () => {
    vi.mocked(buildMonitorStatusHeaderSvg).mockRejectedValueOnce(new Error("satori failed"));
    const images = await prerenderMonitorDetailImages({ ...monitor, name: "Broken" });
    expect(images.headerMarkdown).toBe("## Broken");
  });
});
