import { environment } from "@raycast/api";
import type { ReactNode } from "react";
import { getSchedulePalette, SchedulePalette } from "@/common/colors";
import { MonitorAvailabilityPeriod } from "@/domain/monitor-sla";
import { formatDuration } from "@/common/utils/date-utils";
import { renderToSvg } from "@/ui/svg-renderer";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { title: "Time Period", width: 304 },
  { title: "Availability", width: 159 },
  { title: "Downtime", width: 148 },
  { title: "Incidents", width: 138 },
  { title: "Longest incident", width: 227 },
  { title: "Avg. incident", width: 184 },
];

const SKELETON_BAR_WIDTHS = [72, 56, 24, 64, 72];
const ROW_HEIGHT = 56;
const BORDER_WIDTH = 1;

/** Rendered height of a table with the given number of period rows, plus the header row. */
export function getMonitorAvailabilityTableHeight(rowCount: number): number {
  return ROW_HEIGHT * (rowCount + 1) + BORDER_WIDTH * 2;
}

export async function buildMonitorAvailabilityTableSvg(periods: MonitorAvailabilityPeriod[]): Promise<string> {
  return renderToSvg(<AvailabilityTable rows={periods.map(toCells)} />);
}

/**
 * Same frame as the loaded table, with the period labels already in place and bars where
 * the numbers will go, so nothing moves when the data arrives.
 */
export async function buildMonitorAvailabilitySkeletonSvg(labels: string[]): Promise<string> {
  const palette = getSchedulePalette(environment.appearance);
  const rows = labels.map((label) => [label, ...SKELETON_BAR_WIDTHS.map((width) => skeletonBar(width, palette))]);
  return renderToSvg(<AvailabilityTable rows={rows} />);
}

function AvailabilityTable({ rows }: { rows: ReactNode[][] }) {
  const palette = getSchedulePalette(environment.appearance);

  return (
    <div tw={`flex flex-col w-[1160px] border border-[${palette.gridLine}]`}>
      <TableRow cells={COLUMNS.map((column) => column.title)} palette={palette} isHeader />
      {rows.map((cells, rowIndex) => (
        <TableRow key={rowIndex} cells={cells} palette={palette} />
      ))}
    </div>
  );
}

function TableRow(props: { cells: ReactNode[]; palette: SchedulePalette; isHeader?: boolean }) {
  const { cells, palette, isHeader = false } = props;

  return (
    <div
      tw={cn(`flex h-[${ROW_HEIGHT}px]`, {
        [`bg-[${palette.skeletonOverlay}]`]: isHeader,
        [`border-t border-[${palette.gridLine}]`]: !isHeader,
      })}
    >
      {cells.map((cell, columnIndex) => (
        <div
          key={columnIndex}
          tw={cn(
            `flex items-center px-[16px] w-[${COLUMNS[columnIndex]?.width}px] text-[18px] text-[${palette.heading}]`,
            {
              [`border-l border-[${palette.gridLine}]`]: columnIndex > 0,
              "font-bold": isHeader,
            },
          )}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

function skeletonBar(width: number, palette: SchedulePalette) {
  return <div tw={`flex w-[${width}px] h-[16px] rounded-[4px] bg-[${palette.skeletonBar}]`} />;
}

function toCells({ label, sla }: MonitorAvailabilityPeriod): string[] {
  return [
    label,
    formatAvailability(sla.availability),
    formatDuration(sla.totalDowntime),
    `${sla.numberOfIncidents}`,
    formatDuration(sla.longestIncident),
    formatDuration(sla.averageIncident),
  ];
}

function formatAvailability(percentage: number): string {
  return `${parseFloat(percentage.toFixed(3))}%`;
}
