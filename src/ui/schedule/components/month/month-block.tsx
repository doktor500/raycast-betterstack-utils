import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
import { WeekGroup } from "@/ui/schedule/components/month/week-group";

interface MonthBlockProps {
  weeks: Date[][];
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  today,
  weekTimelines,
  currentMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonthLabel(currentMonth);

  return (
    <div tw="flex flex-col relative w-[1160px] border border-slate overflow-hidden">
      <div tw="flex items-center justify-center h-[44px] border-b border-slate">
        <span tw="text-[17px] font-bold text-frost">{monthLabel}</span>
      </div>
      {weeks.map((days, localIndex) => (
        <WeekGroup
          key={localIndex}
          days={days}
          weekTimeline={weekTimelines[localIndex]}
          today={today}
          weekIndex={localIndex}
          currentMonth={currentMonth}
          showTodayMarker={showTodayMarker}
          columnBg={columnBg}
          rowHeight={weekRowHeights[localIndex]}
        />
      ))}
    </div>
  );
}
