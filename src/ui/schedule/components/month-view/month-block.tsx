import { type WeekSpanBar } from "@/ui/schedule/components/month-view/span-bars";
import { type CalendarMonth } from "@/common/utils/date-utils";
import { formatMonth } from "@/common/utils/date-utils";
import { WeekGroup } from "@/ui/schedule/components/month-view/week-group";

interface MonthBlockProps {
  weeks: Date[][];
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentCalendarMonth: CalendarMonth;
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  today,
  weekTimelines,
  currentCalendarMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonth(currentCalendarMonth);

  return (
    <div tw="flex flex-col relative w-[1160px] overflow-hidden">
      <div tw="flex items-center justify-center h-[44px]">
        <span tw="text-[17px] font-bold text-frost">{monthLabel}</span>
      </div>
      {weeks.map((days, localIndex) => (
        <WeekGroup
          key={localIndex}
          days={days}
          weekTimeline={weekTimelines[localIndex]}
          today={today}
          currentCalendarMonth={currentCalendarMonth}
          showTodayMarker={showTodayMarker}
          columnBg={columnBg}
          rowHeight={weekRowHeights[localIndex]}
        />
      ))}
    </div>
  );
}
