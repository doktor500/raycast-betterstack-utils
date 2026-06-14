import { Colors } from "@/common/colors";
import { formatWeekday } from "@/ui/layout";
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
  const colX = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH;
  const centerX = colX + WEEK.DAY_WIDTH / 2;
  return (
    <g>
      <line x1={colX} y1={gridTop} x2={colX} y2={totalHeight} stroke={Colors.SLATE} strokeWidth={1} />
      {isToday && (
        <rect
          x={colX}
          y={headerTop}
          width={WEEK.DAY_WIDTH}
          height={WEEK.HEADER_HEIGHT}
          rx={6}
          fill={Colors.DEEP_DARK}
          fillOpacity={0.5}
        />
      )}
      <text x={centerX} y={headerTop + 27} textAnchor="middle" fontFamily={WEEK.FONT} fill={Colors.WHITE}>
        <tspan fontSize={13} fontWeight={600} fillOpacity={isToday ? 1 : 0.65}>
          {`${formatWeekday(day)} `}
        </tspan>
        <tspan fontSize={16} fontWeight={600} fillOpacity={isToday ? 1 : 0.75}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </tspan>
      </text>
    </g>
  );
}
