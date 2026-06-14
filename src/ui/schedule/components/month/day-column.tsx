import { formatWeekday } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

const WEEKEND_STRIPES =
  "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(45,55,76,0.5) 3px, rgba(45,55,76,0.5) 4px)";

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const left = index * MONTH.DAY_WIDTH;
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;

  return (
    <div style={{ display: "flex", position: "absolute", left, top: 0, width: MONTH.DAY_WIDTH, height: rowHeight }}>
      {columnBg !== "none" && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: columnBg }} />
      )}
      {isWeekend && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: WEEKEND_STRIPES,
            opacity: inMonth ? 1 : 0.3,
          }}
        />
      )}
      {inMonth && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1,
              height: rowHeight,
              backgroundColor: Colors.SLATE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: MONTH.DAY_HEADER_HEIGHT,
              width: MONTH.DAY_WIDTH,
              height: 1,
              backgroundColor: Colors.SLATE,
            }}
          />
          <div
            tw="flex items-center justify-end"
            style={{
              position: "absolute",
              left: 0,
              top: 4,
              width: MONTH.DAY_WIDTH / 2 - 3,
              height: MONTH.DAY_HEADER_HEIGHT - 4,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: Colors.DIM, fontFamily: "Inter" }}>
              {formatWeekday(day)}
            </span>
          </div>
          <div
            tw="flex items-center"
            style={{
              position: "absolute",
              left: MONTH.DAY_WIDTH / 2 + 3,
              top: 4,
              height: MONTH.DAY_HEADER_HEIGHT - 4,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: Colors.SUBTLE, fontFamily: "Inter" }}>
              {day.getDate()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
