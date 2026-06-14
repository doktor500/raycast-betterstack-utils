import { getThemeColor } from "@/common/colors";
import { truncateLabel } from "@/ui/layout";
import { WEEK } from "@/ui/schedule/components/week/constants";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
  colLeft: number;
  colWidth: number;
  gridTop: number;
}

export function EventSegment({ segment, colLeft, colWidth, gridTop }: EventSegmentProps) {
  const top = gridTop + segment.startFraction * WEEK.TIMELINE_HEIGHT;
  const height = Math.max(WEEK.MIN_EVENT_HEIGHT, (segment.endFraction - segment.startFraction) * WEEK.TIMELINE_HEIGHT);
  const themeColor = getThemeColor(segment.color);
  const showName = height >= WEEK.LABEL_MIN_HEIGHT;

  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        left: colLeft,
        top,
        width: colWidth,
        height,
        backgroundColor: segment.color,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {showName && (
        <span
          style={{
            position: "absolute",
            left: 12,
            top: 4,
            fontSize: 14,
            fontWeight: 600,
            color: themeColor,
            fontFamily: "Inter",
            whiteSpace: "nowrap",
          }}
        >
          {truncateLabel(segment.label, colWidth - 22, 14)}
        </span>
      )}
    </div>
  );
}
