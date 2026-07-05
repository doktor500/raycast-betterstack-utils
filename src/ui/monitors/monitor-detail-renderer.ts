import { DateTime } from "luxon";
import { Monitor } from "@/domain/monitor";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";
import { capitalize } from "@/common/utils/string-utils";
import { stripProtocol } from "@/common/utils/url-utils";
import { Optional } from "@/common/utils/optional-utils";
import { formatDuration } from "@/common/utils/date-utils";
import { MONITOR_STATUS_EMOJI } from "@/ui/monitors/monitor-status";
import { isNotEmpty } from "@/common/utils/collection-utils";

export interface AvailabilityState {
  periods: MonitorAvailabilityPeriod[];
  isLoading: boolean;
  isError: boolean;
}

export function buildMonitorDetailMarkdown(
  monitor: Monitor,
  availability: AvailabilityState,
  statusIconUri?: Optional<string>,
): string {
  return [buildHeader(monitor, statusIconUri), buildAvailabilitySection(availability), buildDetailsSection(monitor)].join(
    "\n\n",
  );
}

function buildHeader(monitor: Monitor, statusIconUri: Optional<string>): string {
  const icon = statusIconUri ? `![status](${statusIconUri})` : MONITOR_STATUS_EMOJI[monitor.status];
  return `## ${icon} ${monitor.name}`;
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

function buildAvailabilitySection(availability: AvailabilityState): string {
  const heading = "### Availability";

  if (availability.isError) return `${heading}\n\n_Failed to load availability data._`;
  if (availability.periods.length === 0) {
    return availability.isLoading ? `${heading}\n\n_Loading availability…_` : `${heading}\n\n_No availability data._`;
  }

  const rows: string[] = [
    "| Time Period | Availability | Downtime | Incidents | Longest incident | Avg. incident |",
    "| ----------- | ------------ | -------- | --------- | ---------------- | ------------- |",
  ];

  for (const period of availability.periods) {
    const { sla } = period;
    rows.push(
      `| ${period.label} | ${formatAvailability(sla.availability)} | ${formatDuration(sla.totalDowntime)} | ${sla.numberOfIncidents} | ${formatDuration(sla.longestIncident)} | ${formatDuration(sla.averageIncident)} |`,
    );
  }

  return `${heading}\n\n${rows.join("\n")}`;
}

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
