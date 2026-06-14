import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const left = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH - 2;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: MONTH.DAY_HEADER_HEIGHT,
        width: 4,
        height: rowHeight - MONTH.DAY_HEADER_HEIGHT,
        backgroundColor: Colors.WHITE,
        opacity: 0.85,
        borderRadius: 2,
      }}
    />
  );
}
