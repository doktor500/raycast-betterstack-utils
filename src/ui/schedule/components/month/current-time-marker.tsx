import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const x = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH;

  return (
    <g>
      <line
        x1={x}
        y1={MONTH.DAY_HEADER_HEIGHT}
        x2={x}
        y2={rowHeight}
        stroke={Colors.WHITE}
        strokeWidth={4}
        opacity={0.85}
      />
      <circle cx={x} cy={MONTH.DAY_HEADER_HEIGHT} r={3} fill={Colors.WHITE} />
    </g>
  );
}
