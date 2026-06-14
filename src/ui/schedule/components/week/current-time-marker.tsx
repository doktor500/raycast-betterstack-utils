import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface CurrentTimeMarkerProps {
  todayIndex: number;
  markerY: number;
}

export function CurrentTimeMarker({ todayIndex, markerY }: CurrentTimeMarkerProps) {
  const left = WEEK.SIDEBAR_WIDTH + todayIndex * WEEK.DAY_WIDTH + 4;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: markerY - 2,
        width: WEEK.DAY_WIDTH - 6,
        height: 4,
        backgroundColor: Colors.WHITE,
        opacity: 0.85,
        borderRadius: 2,
      }}
    />
  );
}
