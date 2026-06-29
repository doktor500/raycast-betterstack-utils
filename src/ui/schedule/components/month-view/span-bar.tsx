import { type WeekSpanBar } from "@/ui/schedule/components/month-view/span-bars";
import { Colors, toRgba } from "@/common/colors";

interface SpanBarProps {
  bar: WeekSpanBar;
}

const VIEWPORT_WIDTH = 1160;
const TEXT_PADDING_LEFT = 12;
const TEXT_PADDING_RIGHT = 8;

export function SpanBar({ bar }: SpanBarProps) {
  const startFrac = (bar.startDayIndex + bar.startFraction) / 7;
  const endFrac = (bar.endDayIndex + bar.endFraction) / 7;
  const barLeft = (startFrac + 3 / VIEWPORT_WIDTH) * 100;
  const barWidth = Math.max((endFrac - startFrac - 2 * (3 / VIEWPORT_WIDTH)) * 100, 0.2);
  const barTop = 30 + bar.lane * 46;
  const barPx = (barWidth / 100) * VIEWPORT_WIDTH;
  const textWidth = Math.max(barPx - TEXT_PADDING_LEFT - TEXT_PADDING_RIGHT, 0);
  const borderRadius = Math.min(6, Math.floor(barPx / 3));
  const showLabel = textWidth > 8;

  return (
    <div
      tw={`flex items-center absolute left-[${barLeft}%] top-[${barTop}px] w-[${barWidth}%] h-[42px] bg-[${bar.color}] rounded-[${borderRadius}px] overflow-hidden`}
      style={{ boxShadow: `0 2px 4px ${toRgba(Colors.DEEP_DARK, 0.3)}` }}
    >
      {showLabel && (
        <span
          tw={`pl-[${TEXT_PADDING_LEFT}px] text-[19px] font-semibold text-[${Colors.DARK}]`}
          style={{
            display: "block",
            width: `${textWidth}px`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {bar.label}
        </span>
      )}
    </div>
  );
}
