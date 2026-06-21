import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { truncateLabel } from "@/common/utils/string-utils";
import { getThemeColor } from "@/common/colors";

interface SpanBarProps {
  bar: WeekSpanBar;
}

export function SpanBar({ bar }: SpanBarProps) {
  const startFrac = (bar.startDayIndex + bar.startFraction) / 7;
  const endFrac = (bar.endDayIndex + bar.endFraction) / 7;
  const barLeft = (startFrac + 3 / 1160) * 100;
  const barWidth = Math.max((endFrac - startFrac - 2 * (3 / 1160)) * 100, 0.2);
  const barTop = 40 + bar.lane * 46;
  const themeColor = getThemeColor(bar.color);
  const approxBarPx = barWidth * 11.6;
  const textAvailWidth = approxBarPx - 22;
  const borderRadius = Math.min(6, Math.floor(approxBarPx / 3));
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, 16) : "";

  return (
    <div
      tw={`flex items-center absolute left-[${barLeft}%] top-[${barTop}px] w-[${barWidth}%] h-[42px] bg-[${bar.color}] rounded-[${borderRadius}px] shadow-[0_2px_4px_rgba(11,12,21,0.3)] overflow-hidden`}
    >
      {label && <span tw={`pl-[12px] text-[16px] font-semibold text-[${themeColor}] whitespace-nowrap`}>{label}</span>}
    </div>
  );
}
