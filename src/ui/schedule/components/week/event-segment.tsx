import { getThemeColor } from "../../../../common/colors";
import { truncateLabel } from "../../../layout";
import { WEEK } from "./constants";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
  colX: number;
  colWidth: number;
  gridTop: number;
}

export function EventSegment({ segment, colX, colWidth, gridTop }: EventSegmentProps) {
  const y = gridTop + segment.startFraction * WEEK.TIMELINE_HEIGHT;
  const height = Math.max(WEEK.MIN_EVENT_HEIGHT, (segment.endFraction - segment.startFraction) * WEEK.TIMELINE_HEIGHT);
  const themeColor = getThemeColor(segment.color);
  const showName = height >= WEEK.LABEL_MIN_HEIGHT;

  return (
    <g>
      <rect x={colX} y={y} width={colWidth} height={height} fill={segment.color} rx={3} />
      {showName && (
        <text x={colX + 12} y={y + 20} fontSize={16} fontWeight={600} fill={themeColor} fontFamily={WEEK.FONT}>
          {truncateLabel(segment.label, colWidth - 22, 16)}
        </text>
      )}
    </g>
  );
}
