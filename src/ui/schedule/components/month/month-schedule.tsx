import React, { Fragment } from "react";
import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { buildWeekSpanBars, summaryBlockHeight, weekRowHeight, LAYOUT } from "@/ui/layout";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month/summary-block";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { MONTH } from "@/ui/schedule/components/month/constants";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";
import { renderToSvg } from "@/ui/schedule/satori-renderer";

type Props = {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
};

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

function buildMonthData(events: OnCallEvent[], window: TimeWindow) {
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

  const monthGroups = monthList.map(({ year, month }) => {
    const weeks = allWeeks.filter((week) => week.some((d) => d.getFullYear() === year && d.getMonth() === month));
    return { year, month, weeks };
  });

  const weekTimelinesByMonth = monthGroups.map(({ year, month, weeks }) =>
    weeks.map((days) => buildWeekSpanBars(days, events, { year, month })),
  );

  const weekRowHeightsByMonth = weekTimelinesByMonth.map((weekTimelines) =>
    weekTimelines.map((timeline) => weekRowHeight(Math.max(1, ...timeline.map((bar) => bar.lane + 1)))),
  );

  const summaries = monthGroups.map(({ year, month }) => computeOnCallSummary({ year, month, events }));

  return { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries };
}

function computeTotalHeight(
  monthGroups: ReturnType<typeof buildMonthData>["monthGroups"],
  weekRowHeightsByMonth: ReturnType<typeof buildMonthData>["weekRowHeightsByMonth"],
  summaries: ReturnType<typeof buildMonthData>["summaries"],
  topBannerHeight: number,
): number {
  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  const monthTotalHeight = (monthIndex: number) =>
    calendarHeight(monthIndex) + MONTH.SUMMARY_GAP + summaryBlockHeight(summaries[monthIndex].length);

  return (
    topBannerHeight +
    monthGroups.reduce((acc, _, monthIndex) => acc + monthTotalHeight(monthIndex), 0) +
    (monthGroups.length - 1) * MONTH.BLOCK_GAP
  );
}

function CombinedScheduleRoot({ events, window, onCallUser }: Props) {
  const today = new Date();
  const showTodayMarker = !!onCallUser;
  const backgroundColor = onCallUser ? "transparent" : Colors.DARK;
  const columnBg = onCallUser ? Colors.DARK : "none";

  const { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries } = buildMonthData(events, window);

  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  return (
    <div
      tw="flex flex-col"
      style={{ display: "flex", flexDirection: "column", width: MONTH.WIDTH, backgroundColor }}
    >
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            blockHeight={calendarHeight(monthIndex)}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
          />
          <div style={{ display: "flex", height: MONTH.SUMMARY_GAP }} />
          <SummaryBlock year={year} month={month} summary={summaries[monthIndex]} />
          {monthIndex < monthGroups.length - 1 && (
            <>
              <div style={{ display: "flex", height: MONTH.BLOCK_GAP / 2 }} />
              <div style={{ display: "flex", width: MONTH.WIDTH, height: 2, backgroundColor: Colors.SLATE }} />
              <div style={{ display: "flex", height: MONTH.BLOCK_GAP / 2 }} />
            </>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export async function buildMonthViewSvg(props: Props): Promise<string> {
  const topBannerHeight = props.onCallUser ? ON_CALL_PILL_BANNER : 0;
  const { monthGroups, weekRowHeightsByMonth, summaries } = buildMonthData(props.events, props.window);
  const totalHeight = computeTotalHeight(monthGroups, weekRowHeightsByMonth, summaries, topBannerHeight);
  return renderToSvg(<CombinedScheduleRoot {...props} />, MONTH.WIDTH, totalHeight);
}
