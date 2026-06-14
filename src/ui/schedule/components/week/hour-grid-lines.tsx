import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourGridLines({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hg${hourIndex}`}
          style={{
            position: "absolute",
            left: WEEK.SIDEBAR_WIDTH,
            top: gridTop + hourIndex * WEEK.HOUR_HEIGHT,
            width: WEEK.WIDTH - WEEK.SIDEBAR_WIDTH,
            height: 1,
            backgroundColor: Colors.SLATE,
          }}
        />
      ))}
    </>
  );
}
