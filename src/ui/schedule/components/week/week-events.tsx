import { getColor } from "@/common/colors";
import { OnCallEvent } from "@/domain/on-call-event";
import { WEEK } from "@/ui/schedule/components/week/constants";
import { EventSegment, type DaySegment } from "@/ui/schedule/components/week/event-segment";
import { formatUserName } from "@/domain/user";

export type { DaySegment } from "@/ui/schedule/components/week/event-segment";

interface WeekEventsProps {
  days: Date[];
  events: OnCallEvent[];
  gridTop: number;
}

export function WeekEvents({ days, events, gridTop }: WeekEventsProps) {
  return (
    <>
      {days.map((day, dayIndex) => {
        const segments = getDaySegments(events, day);
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

function getDaySegments(events: OnCallEvent[], dayStart: Date): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.startedAt).getTime();
    const eventEnd = new Date(event.endedAt).getTime();
    const segStart = Math.max(eventStart, dayStartMs);
    const segEnd = Math.min(eventEnd, dayEndMs);
    if (segEnd <= segStart) return [];

    const userName = formatUserName(event.user);
    const color = getColor(userName);

    return [
      {
        startFraction: (segStart - dayStartMs) / DAY_MS,
        endFraction: (segEnd - dayStartMs) / DAY_MS,
        label: userName,
        color,
      },
    ];
  });
}
