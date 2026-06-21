import { formatWeekday } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";

const WEEKEND_STRIPES_TW =
  "repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(45,55,76,0.5)_3px,rgba(45,55,76,0.5)_4px)";

const DAY_HEADER_HEIGHT = 30;

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;
  const weekendOpacity = inMonth ? 1 : 0.3;

  return (
    <div tw={`flex flex-1 relative h-[${rowHeight}px]`}>
      {columnBg !== "none" && (
        <div tw={`flex absolute inset-0 bg-[${columnBg}]`} />
      )}
      {isWeekend && (
        <div tw={`flex absolute inset-0 bg-[${WEEKEND_STRIPES_TW}] opacity-[${weekendOpacity}]`} />
      )}
      {inMonth && (
        <>
          <div tw={`flex absolute left-0 top-0 w-px h-[${rowHeight}px] bg-[${Colors.SLATE}]`} />
          <div tw={`flex absolute left-0 top-[${DAY_HEADER_HEIGHT}px] right-0 h-px bg-[${Colors.SLATE}]`} />
          <div tw={`flex items-center justify-end absolute left-0 top-[4px] w-[50%] pr-[3px] h-[${DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[13px] font-semibold text-[${Colors.DIM}]`}>
              {formatWeekday(day)}
            </span>
          </div>
          <div tw={`flex items-center absolute left-[50%] pl-[3px] top-[4px] h-[${DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[16px] font-semibold text-[${Colors.SUBTLE}]`}>
              {day.getDate()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
