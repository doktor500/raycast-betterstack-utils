import { getColor } from "@/common/colors";
import { rangeOf } from "@/common/utils/collection-utils";
import { formatWeekday } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { formatUserName } from "@/domain/user";
import { cn } from "@/lib/utils";
import { EventSegment, type DaySegment } from "@/ui/schedule/components/week-view/event-segment";
import { CurrentTimeMarker } from "@/ui/schedule/components/week-view/current-time-marker";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  events: OnCallEvent[];
  markerTime?: number;
}

export function DayColumn({ day, dayIndex, isToday, events, markerTime }: DayColumnProps) {
  const segments = getDaySegments(events, day);
  const weekdayOpacity = isToday ? 1 : 0.75;
  const dateOpacity = isToday ? 1 : 0.75;

  return (
    <div tw="flex flex-col flex-1 relative">
      {isToday && <div tw="flex absolute top-0 left-0 right-0 h-[44px] rounded-[6px] bg-deep-dark opacity-50" />}
      <div tw="flex items-center justify-center h-[44px] gap-[4px]">
        <span tw={`text-[14px] font-semibold text-white opacity-[${weekdayOpacity}]`}>{`${formatWeekday(day)} `}</span>
        <span tw={`text-[14px] pl-2 font-semibold text-white opacity-[${dateOpacity}]`}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
      <div tw={cn("flex relative h-[456px]", { "border-l border-slate": dayIndex > 0 })}>
        {rangeOf(24).map((hourIndex) => (
          <div key={`hour-${hourIndex}`} tw={`flex absolute left-0 right-0 top-[${hourIndex * 19}px] h-px bg-slate`} />
        ))}
        {segments.map((segment, segmentIndex) => (
          <EventSegment key={`ev${segmentIndex}`} segment={segment} />
        ))}
        {markerTime !== undefined && <CurrentTimeMarker markerTime={markerTime} />}
      </div>
    </div>
  );
}

function getDaySegments(events: OnCallEvent[], dayStart: Date): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.startedAt).getTime();
    const eventEnd = new Date(event.endedAt).getTime();
    const segmentStart = Math.max(eventStart, dayStartMs);
    const segmentEnd = Math.min(eventEnd, dayEndMs);
    if (segmentEnd <= segmentStart) return [];

    const userName = formatUserName(event.user);
    const color = getColor(userName);

    return [
      {
        startFraction: (segmentStart - dayStartMs) / DAY_MS,
        endFraction: (segmentEnd - dayStartMs) / DAY_MS,
        label: userName,
        color,
      },
    ];
  });
}
