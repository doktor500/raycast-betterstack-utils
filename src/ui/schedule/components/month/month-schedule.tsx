import { renderToStaticMarkup } from "react-dom/server";
import { Fragment } from "react";
import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { buildWeekSpanBars, summaryBlockHeight, weekRowHeight } from "@/ui/layout";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month/summary-block";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { MONTH } from "@/ui/schedule/components/month/constants";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";

type Props = {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
};

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

function CombinedScheduleSvg({ events, window, onCallUser }: Props) {
  const today = new Date();
  const backgroundColor = onCallUser ? "transparent" : Colors.DARK;
  const showTodayMarker = !!onCallUser;
  const { start, end } = window;
  const firstWeekStart = startOfWeek(start);
  const lastWeekStart = startOfWeek(end);
  const allWeeks: Date[][] = [];

  for (let weekStart = firstWeekStart; weekStart <= lastWeekStart; weekStart = addDays(weekStart, 7)) {
    allWeeks.push(Array.from({ length: 7 }, (_, dayOffset) => addDays(weekStart, dayOffset)));
  }

  const monthsSeen = new Set<string>();
  const monthList: Array<{ year: number; month: number }> = [];

  for (const week of allWeeks) {
    for (const day of week) {
      if (day >= start && day <= end) {
        const key = `${day.getFullYear()}-${day.getMonth()}`;
        if (!monthsSeen.has(key)) {
          monthsSeen.add(key);
          monthList.push({ year: day.getFullYear(), month: day.getMonth() });
        }
      }
    }
  }

  const monthGroups = monthList.map(({ year, month }) => ({
    year,
    month,
    weeks: allWeeks.filter((days) => days.some((day) => day.getFullYear() === year && day.getMonth() === month)),
  }));

  const weekTimelinesByMonth = monthGroups.map(({ year, month, weeks }) =>
    weeks.map((days) => buildWeekSpanBars(days, events, { year, month })),
  );

  const weekRowHeightsByMonth = weekTimelinesByMonth.map((weekTimelines) =>
    weekTimelines.map((weekTimeline) => {
      const maxLanes = Math.max(1, ...weekTimeline.map((bar) => bar.lane + 1));
      return weekRowHeight(maxLanes);
    }),
  );

  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((sum, height) => sum + height, 0);

  const summaries = monthGroups.map(({ year, month }) =>
    computeOnCallSummary({
      year: year,
      month: month,
      events: events,
    }),
  );

  const topBannerHeight = onCallUser ? ON_CALL_PILL_BANNER : 0;

  const monthTotalHeight = (monthIndex: number) => {
    return calendarHeight(monthIndex) + MONTH.SUMMARY_GAP + summaryBlockHeight(summaries[monthIndex].length);
  };

  const totalHeight =
    topBannerHeight +
    monthGroups.reduce((sum, _group, monthIndex) => sum + monthTotalHeight(monthIndex), 0) +
    (monthGroups.length - 1) * MONTH.BLOCK_GAP;

  const columnBg = backgroundColor ?? "none";

  let currentY = topBannerHeight;
  const monthOffsets = monthGroups.map((_, monthIndex) => {
    const offsetY = currentY;
    currentY += monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP;
    return offsetY;
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={MONTH.WIDTH}
      height={totalHeight}
      viewBox={`0 0 ${MONTH.WIDTH} ${totalHeight}`}
    >
      <defs>
        <pattern id="hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          {columnBg !== "none" && <rect width={8} height={8} fill={columnBg} />}
          <path d="M 0 0 L 0 8" stroke={Colors.DEEP_DARK} strokeWidth={1} opacity={0.5} />
        </pattern>
        <filter id="shadow" x="-10%" y="-30%" width="120%" height="170%">
          <feDropShadow dx={0} dy={2} stdDeviation={2} floodColor={Colors.DEEP_DARK} floodOpacity={0.3} />
        </filter>
      </defs>
      {backgroundColor && <rect width={MONTH.WIDTH} height={totalHeight} fill={backgroundColor} />}
      {onCallUser && (
        <OnCallPill cy={Math.round(topBannerHeight / 2)} name={onCallUser.name} color={onCallUser.color} />
      )}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            blockOffsetY={monthOffsets[monthIndex]}
            blockHeight={calendarHeight(monthIndex)}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
          />

          <SummaryBlock
            year={year}
            month={month}
            summary={summaries[monthIndex]}
            offsetY={monthOffsets[monthIndex] + calendarHeight(monthIndex) + MONTH.SUMMARY_GAP}
          />
          {monthIndex < monthGroups.length - 1 && (
            <line
              x1={0}
              y1={monthOffsets[monthIndex] + monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP / 2}
              x2={MONTH.WIDTH}
              y2={monthOffsets[monthIndex] + monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP / 2}
              stroke={Colors.SLATE}
              strokeWidth={2}
            />
          )}
        </Fragment>
      ))}
    </svg>
  );
}

export function buildMonthViewSvg(props: Props): string {
  return renderToStaticMarkup(<CombinedScheduleSvg {...props} />);
}
