import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { isSameDay } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { DayColumn } from "@/ui/schedule/components/month/day-column";
import { SpanBar } from "@/ui/schedule/components/month/span-bar";
import { CurrentTimeMarker } from "@/ui/schedule/components/month/current-time-marker";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  weekIndex: number;
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  weekIndex,
  currentMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <div tw={`flex relative w-full h-[${rowHeight}px]`}>
      {weekIndex > 0 && (
        <div tw={`flex absolute top-0 left-0 right-0 h-px bg-[${Colors.SLATE}]`} />
      )}
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          index={index}
          currentMonth={currentMonth}
          columnBg={columnBg}
          rowHeight={rowHeight}
        />
      ))}
      {weekTimeline.map((bar, index) => (
        <SpanBar key={index} bar={bar} />
      ))}
      {showTodayMarker && todayIndex >= 0 && (
        <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />
      )}
    </div>
  );
}
