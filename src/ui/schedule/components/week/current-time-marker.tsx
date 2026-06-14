import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface CurrentTimeMarkerProps {
  todayIndex: number;
  markerY: number;
}

export function CurrentTimeMarker({ todayIndex, markerY }: CurrentTimeMarkerProps) {
  return (
    <g>
      <circle cx={WEEK.SIDEBAR_WIDTH + todayIndex * WEEK.DAY_WIDTH + 4} cy={markerY} r={3} fill={Colors.WHITE} />
      <line
        x1={WEEK.SIDEBAR_WIDTH + todayIndex * WEEK.DAY_WIDTH + 4}
        y1={markerY}
        x2={WEEK.SIDEBAR_WIDTH + (todayIndex + 1) * WEEK.DAY_WIDTH - 2}
        y2={markerY}
        stroke={Colors.WHITE}
        strokeWidth={4}
        opacity={0.85}
      />
    </g>
  );
}
