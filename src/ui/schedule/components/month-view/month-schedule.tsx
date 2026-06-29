import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { rangeOf } from "@/common/utils/collection-utils";
import { buildWeekSpanBars } from "@/ui/schedule/components/month-view/span-bars";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month-view/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month-view/summary-block";
import { OnCallUserPill } from "@/ui/schedule/components/on-call-user-pill";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";
import { cn } from "@/lib/utils";
import { renderToSvg } from "@/ui/svg-renderer";

type MonthViewProps = {
  events: OnCallEvent[];
  timeWindow: TimeWindow;
  onCallUser?: OnCallUser;
  forExport?: boolean;
};

export async function buildMonthViewSvg(props: MonthViewProps): Promise<string> {
  return renderToSvg(<MonthScheduleView {...props} />);
}

function buildMonthData(events: OnCallEvent[], timeWindow: TimeWindow) {
  const { start, end } = timeWindow;
  const firstWeekStart = startOfWeek(start);
  const lastWeekStart = startOfWeek(end);
  const allWeeks: Date[][] = [];

  for (let weekStart = firstWeekStart; weekStart <= lastWeekStart; weekStart = addDays(weekStart, 7)) {
    allWeeks.push(rangeOf(7).map((dayOffset) => addDays(weekStart, dayOffset)));
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
    weekTimelines.map((timeline) => {
      const maxLanes = Math.max(1, ...timeline.map((bar) => bar.lane + 1));
      return 30 + maxLanes * 42 + Math.max(0, maxLanes - 1) * 4 + 21;
    }),
  );

  const summaries = monthGroups.map(({ year, month }) => computeOnCallSummary({ year, month, events }));

  return { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries };
}

function MonthScheduleView({ events, timeWindow, onCallUser, forExport = false }: MonthViewProps) {
  const today = new Date();
  const showTodayMarker = !!onCallUser;
  const columnBg = onCallUser ? "" : "bg-dark";
  const showWeekendStripes = !forExport;

  const { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries } = buildMonthData(events, timeWindow);

  return (
    <div tw={cn("flex flex-col w-[1160px]", { "bg-dark": !onCallUser })}>
      {onCallUser && <OnCallUserPill name={onCallUser.name} color={onCallUser.color} />}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <div key={monthIndex} tw="flex flex-col w-[1160px]">
          <MonthBlock
            weeks={weeks}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentCalendarMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
            showWeekendStripes={showWeekendStripes}
          />
          <div tw="flex h-[12px]" />
          <SummaryBlock year={year} month={month} summary={summaries[monthIndex]} bg={columnBg} />
          {monthIndex < monthGroups.length - 1 && (
            <div tw="flex flex-col w-[1160px]">
              <div tw="flex h-[20px]" />
              <div tw="flex w-[1160px] h-[2px] bg-slate" />
              <div tw="flex h-[20px]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
