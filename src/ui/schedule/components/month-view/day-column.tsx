import { formatWeekday, type CalendarMonth } from "@/common/utils/date-utils";
import { Colors, toRgba } from "@/common/colors";
import { cn } from "@/lib/utils";

const WEEKEND_STRIPES_IMAGE = `repeating-linear-gradient(-45deg,${toRgba(Colors.DIM, 0.5)} 0,${toRgba(Colors.DIM, 0.5)} 1px,transparent 0,transparent 50%)`;
const WEEKEND_STRIPES_SIZE = "6px 6px";

interface DayColumnProps {
  day: Date;
  currentCalendarMonth: CalendarMonth;
  columnBg: string;
  rowHeight: number;
  showWeekendStripes: boolean;
}

export function DayColumn({ day, currentCalendarMonth, columnBg, rowHeight, showWeekendStripes }: DayColumnProps) {
  const { year, month } = currentCalendarMonth;
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const isInCurrentMonth = day.getFullYear() === year && day.getMonth() === month;
  const weekendOpacity = isInCurrentMonth ? 1 : 0.3;

  return (
    <div tw={`flex flex-col flex-1 relative h-[${rowHeight}px]`}>
      {columnBg && <div tw={cn("flex absolute inset-0", columnBg)} />}
      {isInCurrentMonth && isWeekend && showWeekendStripes && (
        <div
          tw="flex absolute inset-x-0 top-0 h-[30px]"
          style={{
            backgroundImage: WEEKEND_STRIPES_IMAGE,
            backgroundSize: WEEKEND_STRIPES_SIZE,
            opacity: weekendOpacity,
          }}
        />
      )}
      {isInCurrentMonth && (
        <>
          <div tw={`flex absolute left-0 top-0 w-px h-[${rowHeight}px] bg-slate`} />
          <div tw="flex absolute left-0 top-[30px] right-0 h-px bg-slate" />
          <div tw="flex items-center justify-center w-full h-[30px]">
            <span tw="text-[14px] font-semibold text-dim">{formatWeekday(day)}</span>
            <div tw="flex w-[8px]" />
            <span tw="text-[14px] font-semibold text-subtle">{day.getDate()}</span>
          </div>
        </>
      )}
    </div>
  );
}
