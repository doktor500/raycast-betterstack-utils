import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourLabels({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hl${hourIndex}`}
          tw={`flex items-center justify-end absolute left-0 top-[${gridTop + hourIndex * WEEK.HOUR_HEIGHT}px] w-[${WEEK.SIDEBAR_WIDTH - 2}px] h-[${WEEK.HOUR_HEIGHT}px] text-[10px] text-[${Colors.DIM}] font-mono`}
        >
          {hourIndex}
        </div>
      ))}
    </>
  );
}
