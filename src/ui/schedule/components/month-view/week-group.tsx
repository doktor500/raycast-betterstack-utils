import { type WeekSpanBar } from "@/ui/schedule/components/month-view/span-bars";
import { isSameDay, type CalendarMonth } from "@/common/utils/date-utils";
import { DayColumn } from "@/ui/schedule/components/month-view/day-column";
import { Grid } from "@/ui/schedule/components/month-view/grid";
import { SpanBar } from "@/ui/schedule/components/month-view/span-bar";
import { CurrentTimeMarker } from "@/ui/schedule/components/month-view/current-time-marker";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  currentCalendarMonth: CalendarMonth;
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
  showWeekendStripes: boolean;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  currentCalendarMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
  showWeekendStripes,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));
  const { year, month } = currentCalendarMonth;
  const isTodayInCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div tw={`flex relative w-full h-[${rowHeight}px]`}>
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          currentCalendarMonth={currentCalendarMonth}
          columnBg={columnBg}
          rowHeight={rowHeight}
          showWeekendStripes={showWeekendStripes}
        />
      ))}
      <Grid days={days} currentCalendarMonth={currentCalendarMonth} />
      {weekTimeline.map((bar, index) => (
        <SpanBar key={index} bar={bar} />
      ))}
      {showTodayMarker && todayIndex >= 0 && isTodayInCurrentMonth && (
        <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />
      )}
    </div>
  );
}
