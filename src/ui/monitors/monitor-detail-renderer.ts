import { DateTime } from "luxon";
import { Monitor } from "@/domain/monitor";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";
import { capitalize } from "@/common/utils/string-utils";
import { stripProtocol } from "@/common/utils/url-utils";
import { Optional } from "@/common/utils/optional-utils";
import { formatDuration } from "@/common/utils/date-utils";
import { isNotEmpty } from "@/common/utils/collection-utils";
import { buildAvailabilityWindows } from "@/api/betterstack-monitor-sla-api";

export interface AvailabilityState {
  periods: MonitorAvailabilityPeriod[];
  isLoading: boolean;
  isError: boolean;
}

export function buildMonitorDetailMarkdown(
  monitor: Monitor,
  availability: AvailabilityState,
  headerMarkdown?: Optional<string>,
): string {
  const header = headerMarkdown ?? `## ${monitor.name}`;
  return [header, buildAvailabilitySection(monitor, availability), buildDetailsSection(monitor)].join("\n\n");
}

function buildDetailsSection(monitor: Monitor): string {
  const rows: string[] = ["| Field | Value |", "| --- | --- |"];

  rows.push(`| URL | ${stripProtocol(monitor.url)} |`);
  if (monitor.monitorType) rows.push(`| Type | ${capitalize(monitor.monitorType)} |`);
  if (monitor.httpMethod) rows.push(`| Method | ${monitor.httpMethod.toUpperCase()} |`);
  if (monitor.checkFrequency) rows.push(`| Check frequency | ${formatDuration(monitor.checkFrequency)} |`);
  if (monitor.requestTimeout) rows.push(`| Request timeout | ${formatDuration(monitor.requestTimeout)} |`);
  if (monitor.recoveryPeriod) rows.push(`| Recovery period | ${formatDuration(monitor.recoveryPeriod)} |`);
  if (monitor.lastCheckedAt) rows.push(`| Last checked | ${formatLastChecked(monitor.lastCheckedAt)} |`);
  if (isNotEmpty(monitor.regions)) rows.push(`| Regions | ${monitor.regions.join(", ").toUpperCase()} |`);
  if (monitor.sslExpiration) rows.push(`| SSL expiration | ${formatDays(monitor.sslExpiration)} |`);
  if (monitor.domainExpiration) rows.push(`| Domain expiration | ${formatDays(monitor.domainExpiration)} |`);

  return `### Details\n\n${rows.join("\n")}`;
}

function buildAvailabilitySection(monitor: Monitor, availability: AvailabilityState): string {
  const heading = "### Availability";

  if (availability.isError) return `${heading}\n\n_Failed to load availability data._`;
  if (availability.periods.length === 0) {
    return availability.isLoading
      ? `${heading}\n\n${buildPlaceholderAvailabilityTable(monitor)}`
      : `${heading}\n\n_No availability data._`;
  }

  const rows: string[] = [...AVAILABILITY_TABLE_HEADER];

  for (const period of availability.periods) {
    const { sla } = period;
    rows.push(
      `| ${period.label} | ${formatAvailability(sla.availability)} | ${formatDuration(sla.totalDowntime)} | ${sla.numberOfIncidents} | ${formatDuration(sla.longestIncident)} | ${formatDuration(sla.averageIncident)} |`,
    );
  }

  return `${heading}\n\n${rows.join("\n")}`;
}

/**
 * Renders the same rows the loaded table will have, so the details section below doesn't
 * jump down once the availability data arrives.
 */
function buildPlaceholderAvailabilityTable(monitor: Monitor): string {
  const windows = buildAvailabilityWindows(DateTime.now(), monitor.createdAt);
  const rows = windows.map((window) => `| ${window.label} | — | — | — | — | — |`);
  return [...AVAILABILITY_TABLE_HEADER, ...rows].join("\n");
}

const AVAILABILITY_TABLE_HEADER = [
  "| Time Period | Availability | Downtime | Incidents | Longest incident | Avg. incident |",
  "| ----------- | ------------ | -------- | --------- | ---------------- | ------------- |",
];

function formatAvailability(percentage: number): string {
  return `${parseFloat(percentage.toFixed(3))}%`;
}

function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatLastChecked(lastCheckedAt: Optional<string>): string {
  if (!lastCheckedAt) return "Never";
  return DateTime.fromISO(lastCheckedAt).toLocaleString(DateTime.DATETIME_MED);
}
