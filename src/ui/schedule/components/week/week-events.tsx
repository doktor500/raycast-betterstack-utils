import { RotaColors } from "../../../../common/colors";
import { OnCallEvent } from "../../../../domain/on-call-event";
import { WEEK } from "./constants";
import { EventSegment, type DaySegment } from "./event-segment";
import { formatUserName } from "../../../../domain/user";

export type { DaySegment } from "./event-segment";

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
        return segments.map((segment, segmentIndex) => (
          <EventSegment
            key={`ev${dayIndex}-${segmentIndex}`}
            segment={segment}
            colX={colX}
            colWidth={colWidth}
            gridTop={gridTop}
          />
        ));
      })}
    </>
  );
}
