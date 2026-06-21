import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { truncateLabel } from "@/common/utils/string-utils";
import { getThemeColor } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface SpanBarProps {
  bar: WeekSpanBar;
}

export function SpanBar({ bar }: SpanBarProps) {
  const leftX = bar.startDayIndex * MONTH.DAY_WIDTH + bar.startFraction * MONTH.DAY_WIDTH;
  const rightX = bar.endDayIndex * MONTH.DAY_WIDTH + bar.endFraction * MONTH.DAY_WIDTH;
  const barLeft = leftX + MONTH.H_GAP;
  const barWidth = Math.max(rightX - leftX - 2 * MONTH.H_GAP, 2);
  const barTop = MONTH.ROW_TOP + bar.lane * (MONTH.ROW_HEIGHT + MONTH.BAR_GAP);
  const themeColor = getThemeColor(bar.color);
  const borderRadius = Math.min(6, Math.floor(barWidth / 3));
  const textAvailWidth = barWidth - 22;
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, 16) : "";

  return (
    <div tw={`flex items-center absolute left-[${barLeft}px] top-[${barTop}px] w-[${barWidth}px] h-[${MONTH.ROW_HEIGHT}px] bg-[${bar.color}] rounded-[${borderRadius}px] shadow-[0_2px_4px_rgba(11,12,21,0.3)] overflow-hidden`}>
      {label && (
        <span tw={`pl-[12px] text-[16px] font-semibold text-[${themeColor}] whitespace-nowrap`}>
          {label}
        </span>
      )}
    </div>
  );
}
