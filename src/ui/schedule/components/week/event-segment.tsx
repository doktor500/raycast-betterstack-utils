import { getThemeColor } from "@/common/colors";
import { truncateLabel } from "@/common/utils/string-utils";
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
    <div tw={`flex absolute left-[${colLeft}px] top-[${top}px] w-[${colWidth}px] h-[${height}px] bg-[${segment.color}] rounded-[3px] overflow-hidden`}>
      {showName && (
        <span tw={`absolute left-[12px] top-[4px] text-[14px] font-semibold text-[${themeColor}] whitespace-nowrap`}>
          {truncateLabel(segment.label, colWidth - 22, 14)}
        </span>
      )}
    </div>
  );
}
