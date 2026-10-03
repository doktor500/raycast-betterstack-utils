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
import { buildBlankSvg, toImageDataUri, toSvgDataUri } from "@/common/utils/svg-utils";
import {
  buildMonitorAvailabilitySkeletonSvg,
  buildMonitorAvailabilityTableSvg,
  getMonitorAvailabilityTableHeight,
} from "@/ui/monitors/components/monitor-availability-table";
import { buildMonitorStatusHeaderSvg } from "@/ui/monitors/components/monitor-status-header";
import { VIEWPORT_WIDTH } from "@/ui/svg-renderer";

export interface AvailabilityState {
  periods: MonitorAvailabilityPeriod[];
  isLoading: boolean;
  isError: boolean;
}

/** The images the detail page needs on its first frame, rendered before it opens. */
export interface MonitorDetailImages {
  headerMarkdown: string;
  availabilitySkeletonMarkdown: string;
}

const renderedImages = new Map<string, Promise<string>>();

/**
 * Renders the status header and the availability skeleton ahead of time, so the detail page
 * opens with the pulse and the table frame already in place instead of fading them in. Results
 * are cached, so calling this when a monitor is selected makes opening its detail instant.
 */
export async function prerenderMonitorDetailImages(monitor: Monitor): Promise<MonitorDetailImages> {
  const [headerMarkdown, availabilitySkeletonMarkdown] = await Promise.all([
    renderMonitorHeader(monitor),
    renderMonitorAvailabilitySkeleton(monitor),
  ]);
  return { headerMarkdown, availabilitySkeletonMarkdown };
}

export function buildMonitorDetailMarkdown(
  monitor: Monitor,
  headerMarkdown: string,
  availabilityMarkdown: string,
): string {
  return [
    headerMarkdown,
    buildUrlLine(monitor),
    `### Availability\n\n${availabilityMarkdown}`,
    buildDetailsSection(monitor),
  ]
    .filter((section) => section !== undefined)
    .join("\n\n");
}

/**
 * Renders the availability table as an image rather than a markdown table: Raycast sizes
 * markdown columns by their content, so the columns would shift once the numbers load.
 */
export async function renderMonitorAvailability(monitor: Monitor, availability: AvailabilityState): Promise<string> {
  if (availability.isError) return "_Failed to load availability data._";

  if (availability.periods.length === 0) {
    if (!availability.isLoading) return "_No availability data._";

    return renderMonitorAvailabilitySkeleton(monitor);
  }

  return toImage("availability", await buildMonitorAvailabilityTableSvg(availability.periods));
}

function renderMonitorHeader(monitor: Monitor): Promise<string> {
  const cacheKey = ["header", environment.appearance, monitor.name, monitor.status].join(":");
  return renderOnce(cacheKey, async () => toImage("status", await buildMonitorStatusHeaderSvg(monitor))).catch(
    () => `## ${monitor.name}`,
  );
}

function renderMonitorAvailabilitySkeleton(monitor: Monitor): Promise<string> {
  const labels = getAvailabilityLabels(monitor);
  const cacheKey = ["skeleton", environment.appearance, ...labels].join(":");
  return renderOnce(cacheKey, async () =>
    toImage("availability", await buildMonitorAvailabilitySkeletonSvg(labels)),
  ).catch(() => toBlankImage("availability", getMonitorAvailabilityTableHeight(labels.length)));
}

/** Failed renders are dropped from the cache so the next call retries them. */
function renderOnce(cacheKey: string, render: () => Promise<string>): Promise<string> {
  const cached = renderedImages.get(cacheKey);
  if (cached) return cached;

  const rendering = render();
  renderedImages.set(cacheKey, rendering);
  rendering.catch(() => renderedImages.delete(cacheKey));
  return rendering;
}

async function toImage(altText: string, svg: string): Promise<string> {
  return `![${altText}](${await toImageDataUri(svg, environment.supportPath, environment.raycastVersion)})`;
}

function toBlankImage(altText: string, height: number): string {
  return `![${altText}](${toSvgDataUri(buildBlankSvg(VIEWPORT_WIDTH, height))})`;
}

/** Monitors without a display name are named after their URL, which the header already shows. */
function buildUrlLine(monitor: Monitor): Optional<string> {
  const url = stripProtocol(monitor.url);
  return url === stripProtocol(monitor.name) ? undefined : url;
}

function getAvailabilityLabels(monitor: Monitor): string[] {
  return buildAvailabilityWindows(DateTime.now(), monitor.createdAt).map((window) => window.label);
}

function buildDetailsSection(monitor: Monitor): Optional<string> {
  const rows: string[] = [];

  if (monitor.monitorType) rows.push(`| Type | ${capitalize(monitor.monitorType)} |`);
  if (monitor.httpMethod) rows.push(`| Method | ${monitor.httpMethod.toUpperCase()} |`);
  if (monitor.checkFrequency) rows.push(`| Check frequency | ${formatDuration(monitor.checkFrequency)} |`);
  if (monitor.requestTimeout) rows.push(`| Request timeout | ${formatDuration(monitor.requestTimeout)} |`);
  if (monitor.recoveryPeriod) rows.push(`| Recovery period | ${formatDuration(monitor.recoveryPeriod)} |`);
  if (monitor.lastCheckedAt) rows.push(`| Last checked | ${formatLastChecked(monitor.lastCheckedAt)} |`);
  if (isNotEmpty(monitor.regions)) rows.push(`| Regions | ${monitor.regions.join(", ").toUpperCase()} |`);
  if (monitor.sslExpiration) rows.push(`| SSL expiration | ${formatDays(monitor.sslExpiration)} |`);
  if (monitor.domainExpiration) rows.push(`| Domain expiration | ${formatDays(monitor.domainExpiration)} |`);

  if (rows.length === 0) return undefined;

  return `### Details\n\n${["| Field | Value |", "| --- | --- |", ...rows].join("\n")}`;
}

function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatLastChecked(lastCheckedAt: Optional<string>): string {
  if (!lastCheckedAt) return "Never";
  return DateTime.fromISO(lastCheckedAt).toLocaleString(DateTime.DATETIME_MED);
}
