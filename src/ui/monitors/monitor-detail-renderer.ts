import { DateTime } from "luxon";
import { Monitor } from "@/domain/monitor";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";
import { capitalize } from "@/common/utils/string-utils";
import { Optional } from "@/common/utils/optional-utils";
import { formatDuration } from "@/common/utils/date-utils";
import { MONITOR_STATUS_EMOJI, MONITOR_STATUS_LABEL } from "@/ui/monitors/monitor-status";

export interface AvailabilityState {
  periods: MonitorAvailabilityPeriod[];
  isLoading: boolean;
  isError: boolean;
}

export function buildMonitorDetailMarkdown(monitor: Monitor, availability: AvailabilityState): string {
  return [buildHeader(monitor), buildDetailsSection(monitor), buildAvailabilitySection(availability)].join("\n\n");
}

function buildHeader(monitor: Monitor): string {
  const status = `${MONITOR_STATUS_EMOJI[monitor.status]} ${MONITOR_STATUS_LABEL[monitor.status]}`;
  return `## ${monitor.name}\n\n**Status:** ${status}`;
}

function buildDetailsSection(monitor: Monitor): string {
  const rows: string[] = ["| Field | Value |", "| --- | --- |"];

  rows.push(`| URL | [${monitor.url}](${monitor.url}) |`);
  if (monitor.monitorType) rows.push(`| Type | ${capitalize(monitor.monitorType)} |`);
  if (monitor.httpMethod) rows.push(`| Method | ${monitor.httpMethod.toUpperCase()} |`);
  if (monitor.checkFrequency !== undefined)
    rows.push(`| Check frequency | ${formatDuration(monitor.checkFrequency)} |`);
  if (monitor.requestTimeout !== undefined)
    rows.push(`| Request timeout | ${formatDuration(monitor.requestTimeout)} |`);
  if (monitor.recoveryPeriod !== undefined)
    rows.push(`| Recovery period | ${formatDuration(monitor.recoveryPeriod)} |`);
  rows.push(`| Last checked | ${formatLastChecked(monitor.lastCheckedAt)} |`);
  if (monitor.regions.length > 0) {
    rows.push(`| Regions | ${monitor.regions.map((region) => region.toUpperCase()).join(", ")} |`);
  }
  if (monitor.sslExpiration !== undefined) rows.push(`| SSL expiration | ${formatDays(monitor.sslExpiration)} |`);
  if (monitor.domainExpiration !== undefined)
    rows.push(`| Domain expiration | ${formatDays(monitor.domainExpiration)} |`);

  return `## Details\n\n${rows.join("\n")}`;
}

function buildAvailabilitySection(availability: AvailabilityState): string {
  const heading = "## Availability";

  if (availability.isError) return `${heading}\n\n_Failed to load availability data._`;
  if (availability.periods.length === 0) {
    return availability.isLoading ? `${heading}\n\n_Loading availability…_` : `${heading}\n\n_No availability data._`;
  }

  const rows: string[] = [
    "| Time Period | Availability | Downtime | Incidents | Longest incident | Avg. incident |",
    "| --- | --- | --- | --- | --- | --- |",
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
