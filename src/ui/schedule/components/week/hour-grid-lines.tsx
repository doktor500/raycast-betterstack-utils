import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourGridLines({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <line
          key={`hg${hourIndex}`}
          x1={WEEK.SIDEBAR_WIDTH}
          y1={gridTop + hourIndex * WEEK.HOUR_HEIGHT}
          x2={WEEK.WIDTH}
          y2={gridTop + hourIndex * WEEK.HOUR_HEIGHT}
          stroke={Colors.SLATE}
          strokeWidth={1}
        />
      ))}
    </>
  );
}
