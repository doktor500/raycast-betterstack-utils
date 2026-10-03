import { environment } from "@raycast/api";
import { DateTime } from "luxon";
import { Monitor } from "@/domain/monitor";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";
import { capitalize } from "@/common/utils/string-utils";
import { stripProtocol } from "@/common/utils/url-utils";
import { Optional } from "@/common/utils/optional-utils";
import { formatDuration } from "@/common/utils/date-utils";
import { isNotEmpty } from "@/common/utils/collection-utils";
import { buildAvailabilityWindows } from "@/api/betterstack-monitor-sla-api";
import { toImageDataUri } from "@/common/utils/svg-utils";
import {
  buildMonitorAvailabilitySkeletonSvg,
  buildMonitorAvailabilityTableSvg,
} from "@/ui/monitors/components/monitor-availability-table";

export interface AvailabilityState {
  periods: MonitorAvailabilityPeriod[];
  isLoading: boolean;
  isError: boolean;
}

export function buildMonitorDetailMarkdown(
  monitor: Monitor,
  availabilityMarkdown: string,
  headerMarkdown?: Optional<string>,
): string {
  const header = headerMarkdown ?? `## ${monitor.name}`;
  return [header, `### Availability\n\n${availabilityMarkdown}`, buildDetailsSection(monitor)].join("\n\n");
}

/**
 * Renders the availability table as an image rather than a markdown table: Raycast sizes
 * markdown columns by their content, so the columns would shift once the numbers load.
 */
export async function renderMonitorAvailability(monitor: Monitor, availability: AvailabilityState): Promise<string> {
  if (availability.isError) return "_Failed to load availability data._";

  if (availability.periods.length === 0) {
    if (!availability.isLoading) return "_No availability data._";

    const labels = buildAvailabilityWindows(DateTime.now(), monitor.createdAt).map((window) => window.label);
    return toAvailabilityImage(await buildMonitorAvailabilitySkeletonSvg(labels));
  }

  return toAvailabilityImage(await buildMonitorAvailabilityTableSvg(availability.periods));
}

async function toAvailabilityImage(svg: string): Promise<string> {
  return `![availability](${await toImageDataUri(svg, environment.supportPath, environment.raycastVersion)})`;
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

function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatLastChecked(lastCheckedAt: Optional<string>): string {
  if (!lastCheckedAt) return "Never";
  return DateTime.fromISO(lastCheckedAt).toLocaleString(DateTime.DATETIME_MED);
}
