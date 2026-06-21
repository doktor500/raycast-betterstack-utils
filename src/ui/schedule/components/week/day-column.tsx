import { Colors } from "@/common/colors";
import { formatWeekday } from "@/common/utils/date-utils";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  gridTop: number;
  headerTop: number;
  totalHeight: number;
}

export function DayColumn({ day, dayIndex, isToday, gridTop, headerTop, totalHeight }: DayColumnProps) {
  const colLeft = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH;
  const weekdayOpacity = isToday ? 1 : 0.65;
  const dateOpacity = isToday ? 1 : 0.75;

  return (
    <>
      <div tw={`flex absolute left-[${colLeft}px] top-[${gridTop}px] w-px h-[${totalHeight - gridTop}px] bg-[${Colors.SLATE}]`} />
      {isToday && (
        <div tw={`flex absolute left-[${colLeft}px] top-[${headerTop}px] w-[${WEEK.DAY_WIDTH}px] h-[${WEEK.HEADER_HEIGHT}px] rounded-[6px] bg-[${Colors.DEEP_DARK}] opacity-50`} />
      )}
      <div tw={`flex items-center justify-center absolute left-[${colLeft}px] top-[${headerTop}px] w-[${WEEK.DAY_WIDTH}px] h-[${WEEK.HEADER_HEIGHT}px] gap-[4px]`}>
        <span tw={`text-[13px] font-semibold text-white opacity-[${weekdayOpacity}]`}>
          {`${formatWeekday(day)} `}
        </span>
        <span tw={`text-[16px] font-semibold text-white opacity-[${dateOpacity}]`}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
    </>
  );
}
