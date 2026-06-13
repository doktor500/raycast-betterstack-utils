import { Fragment } from "react";
import { getTextColor, RotaColors } from "../../../../common/colors";
import { formatUserName, OnCallEvent } from "../../../../domain/on-call-event";
import { truncateLabel } from "../../../layout";
import { WEEK } from "./constants";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

export function getDaySegments(events: OnCallEvent[], dayStart: Date, colorMap: Map<string, string>): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.started_at).getTime();
    const eventEnd = new Date(event.ended_at).getTime();
    const segStart = Math.max(eventStart, dayStartMs);
    const segEnd = Math.min(eventEnd, dayEndMs);
    if (segEnd <= segStart) return [];
    const name = formatUserName(event.user);
    return [
      {
        startFraction: (segStart - dayStartMs) / DAY_MS,
        endFraction: (segEnd - dayStartMs) / DAY_MS,
        label: name,
        color: colorMap.get(name) ?? RotaColors.GREEN,
      },
    ];
  });
}

interface WeekEventsProps {
  days: Date[];
  events: OnCallEvent[];
  colorMap: Map<string, string>;
  gridTop: number;
}

export function WeekEvents({ days, events, colorMap, gridTop }: WeekEventsProps) {
  return (
    <>
      {days.map((day, dayIndex) => {
        const segments = getDaySegments(events, day, colorMap);
        const colX = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH + 2;
        const colWidth = WEEK.DAY_WIDTH - 4;
        return segments.map((segment, segmentIndex) => {
          const y = gridTop + segment.startFraction * WEEK.TIMELINE_HEIGHT;
          const height = Math.max(WEEK.MIN_EVENT_HEIGHT, (segment.endFraction - segment.startFraction) * WEEK.TIMELINE_HEIGHT);
          const textColor = getTextColor(segment.color);
          const showName = height >= WEEK.LABEL_MIN_HEIGHT;
          return (
            <Fragment key={`ev${dayIndex}-${segmentIndex}`}>
              <rect x={colX} y={y} width={colWidth} height={height} fill={segment.color} rx={3} />
              {showName && (
                <text x={colX + 12} y={y + 20} fontSize={16} fontWeight={600} fill={textColor} fontFamily={WEEK.FONT}>
                  {truncateLabel(segment.label, colWidth - 22, 16)}
                </text>
              )}
            </Fragment>
          );
        });
      })}
    </>
  );
}
