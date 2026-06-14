import { type WeekSpanBar, formatMonthLabel } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { WeekGroup } from "@/ui/schedule/components/month/week-group";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface MonthBlockProps {
  weeks: Date[][];
  blockHeight: number;
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  blockHeight,
  today,
  weekTimelines,
  currentMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonthLabel(currentMonth);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: MONTH.WIDTH,
        height: blockHeight,
        border: `1px solid ${Colors.SLATE}`,
        overflow: "hidden",
      }}
    >
      <div
        tw="flex items-center justify-center"
        style={{
          height: MONTH.BLOCK_HEADER_HEIGHT,
          borderBottom: `1px solid ${Colors.SLATE}`,
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700, color: Colors.FROST, fontFamily: "Inter" }}>
          {monthLabel}
        </span>
      </div>
      {weeks.map((days, localIndex) => (
        <WeekGroup
          key={localIndex}
          days={days}
          weekTimeline={weekTimelines[localIndex]}
          today={today}
          weekIndex={localIndex}
          currentMonth={currentMonth}
          showTodayMarker={showTodayMarker}
          columnBg={columnBg}
          rowHeight={weekRowHeights[localIndex]}
        />
      ))}
    </div>
  );
}
