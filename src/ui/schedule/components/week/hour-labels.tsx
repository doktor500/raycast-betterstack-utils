import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourLabels({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hl${hourIndex}`}
          tw="flex items-center justify-end"
          style={{
            position: "absolute",
            left: 0,
            top: gridTop + hourIndex * WEEK.HOUR_HEIGHT,
            width: WEEK.SIDEBAR_WIDTH - 2,
            height: WEEK.HOUR_HEIGHT,
            fontSize: 10,
            color: Colors.DIM,
            fontFamily: "JetBrainsMono",
          }}
        >
          {hourIndex}
        </div>
      ))}
    </>
  );
}
