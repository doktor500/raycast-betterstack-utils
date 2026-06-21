import { getThemeColor } from "@/common/colors";
import { truncateLabel } from "@/common/utils/string-utils";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
}

const TEXT_AVAILABLE_WIDTH = 140; // approx day column width minus left padding and label inset

export function EventSegment({ segment }: EventSegmentProps) {
  const topPercent = segment.startFraction * 100;
  const height = Math.max(12, (segment.endFraction - segment.startFraction) * 480);
  const themeColor = getThemeColor(segment.color);
  const showName = height >= 24;

  return (
    <div
      tw={`flex absolute left-[2px] right-[2px] top-[${topPercent}%] h-[${height}px] bg-[${segment.color}] rounded-[3px] overflow-hidden`}
    >
      {showName && (
        <span tw={`absolute left-[12px] top-[4px] text-[14px] font-semibold text-[${themeColor}] whitespace-nowrap`}>
          {truncateLabel(segment.label, TEXT_AVAILABLE_WIDTH, 14)}
        </span>
      )}
    </div>
  );
}
