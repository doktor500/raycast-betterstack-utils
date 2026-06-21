import { formatWeekday } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

const WEEKEND_STRIPES_TW =
  "repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(45,55,76,0.5)_3px,rgba(45,55,76,0.5)_4px)";

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const left = index * MONTH.DAY_WIDTH;
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;
  const weekendOpacity = inMonth ? 1 : 0.3;

  return (
    <div tw={`flex absolute left-[${left}px] top-0 w-[${MONTH.DAY_WIDTH}px] h-[${rowHeight}px]`}>
      {columnBg !== "none" && (
        <div tw={`flex absolute inset-0 bg-[${columnBg}]`} />
      )}
      {isWeekend && (
        <div tw={`flex absolute inset-0 bg-[${WEEKEND_STRIPES_TW}] opacity-[${weekendOpacity}]`} />
      )}
      {inMonth && (
        <>
          <div tw={`flex absolute left-0 top-0 w-px h-[${rowHeight}px] bg-[${Colors.SLATE}]`} />
          <div tw={`flex absolute left-0 top-[${MONTH.DAY_HEADER_HEIGHT}px] w-[${MONTH.DAY_WIDTH}px] h-px bg-[${Colors.SLATE}]`} />
          <div tw={`flex items-center justify-end absolute left-0 top-[4px] w-[${MONTH.DAY_WIDTH / 2 - 3}px] h-[${MONTH.DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[13px] font-semibold text-[${Colors.DIM}]`}>
              {formatWeekday(day)}
            </span>
          </div>
          <div tw={`flex items-center absolute left-[${MONTH.DAY_WIDTH / 2 + 3}px] top-[4px] h-[${MONTH.DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[16px] font-semibold text-[${Colors.SUBTLE}]`}>
              {day.getDate()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
