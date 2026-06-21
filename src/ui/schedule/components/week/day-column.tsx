import { Colors, getColor } from "@/common/colors";
import { formatWeekday } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { formatUserName } from "@/domain/user";
import { EventSegment, type DaySegment } from "@/ui/schedule/components/week/event-segment";
import { CurrentTimeMarker } from "@/ui/schedule/components/week/current-time-marker";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  events: OnCallEvent[];
  nowFraction?: number;
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

export function DayColumn({ day, dayIndex, isToday, events, nowFraction }: DayColumnProps) {
  const segments = getDaySegments(events, day);
  const weekdayOpacity = isToday ? 1 : 0.65;
  const dateOpacity = isToday ? 1 : 0.75;

  return (
    <div tw="flex flex-col flex-1 relative">
      {isToday && (
        <div tw={`flex absolute top-0 left-0 right-0 h-[44px] rounded-[6px] bg-[${Colors.DEEP_DARK}] opacity-50`} />
      )}
      <div tw="flex items-center justify-center h-[44px] gap-[4px]">
        <span tw={`text-[14px] font-semibold text-white opacity-[${weekdayOpacity}]`}>{`${formatWeekday(day)} `}</span>
        <span tw={`text-[14px] pl-2 font-semibold text-white opacity-[${dateOpacity}]`}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
      <div tw={`flex relative h-[480px] ${dayIndex > 0 ? `border-l border-[${Colors.SLATE}]` : ""}`}>
        {Array.from({ length: 24 }, (_, hourIndex) => (
          <div
            key={`hr${hourIndex}`}
            tw={`flex absolute left-0 right-0 top-[${hourIndex * 20}px] h-px bg-[${Colors.SLATE}]`}
          />
        ))}
        {segments.map((segment, segmentIndex) => (
          <EventSegment key={`ev${segmentIndex}`} segment={segment} />
        ))}
        {nowFraction !== undefined && <CurrentTimeMarker fraction={nowFraction} />}
      </div>
    </div>
  );
}
