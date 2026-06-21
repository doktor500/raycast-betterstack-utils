import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourGridLines({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hg${hourIndex}`}
          tw={`flex absolute left-[${WEEK.SIDEBAR_WIDTH}px] top-[${gridTop + hourIndex * WEEK.HOUR_HEIGHT}px] w-[${WEEK.WIDTH - WEEK.SIDEBAR_WIDTH}px] h-px bg-[${Colors.SLATE}]`}
        />
      ))}
    </>
  );
}
