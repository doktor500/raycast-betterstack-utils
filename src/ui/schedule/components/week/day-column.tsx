import { Colors } from "@/common/colors";
import { formatWeekday } from "@/common/utils/date-utils";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  gridTop: number;
  headerTop: number;
  totalHeight: number;
}

export function DayColumn({ day, dayIndex, isToday, gridTop, headerTop, totalHeight }: DayColumnProps) {
  const colLeft = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH;

  return (
    <>
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: colLeft,
          top: gridTop,
          width: 1,
          height: totalHeight - gridTop,
          backgroundColor: Colors.SLATE,
        }}
      />
      {isToday && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: colLeft,
            top: headerTop,
            width: WEEK.DAY_WIDTH,
            height: WEEK.HEADER_HEIGHT,
            borderRadius: 6,
            backgroundColor: Colors.DEEP_DARK,
            opacity: 0.5,
          }}
        />
      )}
      <div
        tw="flex items-center justify-center"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: colLeft,
          top: headerTop,
          width: WEEK.DAY_WIDTH,
          height: WEEK.HEADER_HEIGHT,
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: Colors.WHITE,
            opacity: isToday ? 1 : 0.65,
            fontFamily: "Inter",
          }}
        >
          {`${formatWeekday(day)} `}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: Colors.WHITE,
            opacity: isToday ? 1 : 0.75,
            fontFamily: "Inter",
          }}
        >
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
    </>
  );
}
