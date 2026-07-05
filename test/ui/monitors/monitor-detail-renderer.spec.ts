import { vi } from "vitest";

vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(() => ({
    apiToken: "test-token",
  })),
}));

import { describe, expect, it } from "vitest";
import { buildMonitorDetailMarkdown } from "@/ui/monitors/monitor-detail-renderer";
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
  { label: "Today", sla: { availability: 100, totalDowntime: 0, numberOfIncidents: 0, longestIncident: 0, averageIncident: 0 } },
  { label: "Last 7 days", sla: { availability: 99.98, totalDowntime: 600, numberOfIncidents: 3, longestIncident: 300, averageIncident: 200 } },
];

describe("buildMonitorDetailMarkdown", () => {
  it("renders the header with status emoji and name", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, { periods, isLoading: false, isError: false });
    expect(markdown).toContain("## 🟢 Homepage");
  });

  it("renders the details table with formatted values", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, { periods, isLoading: false, isError: false });
    expect(markdown).toContain("### Details");
    expect(markdown).toContain("| URL | example.com |");
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
    const markdown = buildMonitorDetailMarkdown(bareMonitor, { periods, isLoading: false, isError: false });
    expect(markdown).not.toContain("| Type |");
    expect(markdown).not.toContain("| Method |");
    expect(markdown).not.toContain("| Regions |");
    expect(markdown).not.toContain("| Recovery period |");
    expect(markdown).not.toContain("| Last checked |");
    expect(markdown).toContain("| URL |");
  });

  it("renders the availability table with formatted values", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, { periods, isLoading: false, isError: false });
    expect(markdown).toContain("### Availability");
    expect(markdown).toContain("| Time Period | Availability | Downtime | Incidents | Longest incident | Avg. incident |");
    expect(markdown).toContain("| Today | 100% | 0s | 0 | 0s | 0s |");
    expect(markdown).toContain("| Last 7 days | 99.98% | 10m | 3 | 5m | 3m 20s |");
  });

  it("shows a loading note when availability is loading with no data", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, { periods: [], isLoading: true, isError: false });
    expect(markdown).toContain("_Loading availability…_");
    expect(markdown).not.toContain("| Time Period |");
  });

  it("shows an error note when availability failed to load", () => {
    const markdown = buildMonitorDetailMarkdown(monitor, { periods: [], isLoading: false, isError: true });
    expect(markdown).toContain("_Failed to load availability data._");
  });
});
