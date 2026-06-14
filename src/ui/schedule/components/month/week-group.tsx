import { type WeekSpanBar } from "@/ui/layout";
import { isSameDay } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { DayColumn } from "@/ui/schedule/components/month/day-column";
import { SpanBar } from "@/ui/schedule/components/month/span-bar";
import { CurrentTimeMarker } from "@/ui/schedule/components/month/current-time-marker";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  weekIndex: number;
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  weekIndex,
  currentMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <div style={{ position: "relative", width: MONTH.WIDTH, height: rowHeight }}>
      {weekIndex > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: MONTH.WIDTH,
            height: 1,
            backgroundColor: Colors.SLATE,
          }}
        />
      )}
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          index={index}
          currentMonth={currentMonth}
          columnBg={columnBg}
          rowHeight={rowHeight}
        />
      ))}
      {weekTimeline.map((bar, index) => (
        <SpanBar key={index} bar={bar} />
      ))}
      {showTodayMarker && todayIndex >= 0 && (
        <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />
      )}
    </div>
  );
}
