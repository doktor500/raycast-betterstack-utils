import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { TimeRange } from "@/domain/time-range";
import { toSvgDataUri } from "@/common/utils/svg-utils";
import { buildWeekViewSvg } from "@/ui/schedule/components/week/week-schedule";
import { buildMonthViewSvg } from "@/ui/schedule/components/month/month-schedule";
import { buildScheduleSkeletonSvg } from "@/ui/schedule/skeleton/schedule";
import { TimeWindow } from "@/common/utils/date-utils";

type ScheduleData = {
  events: OnCallEvent[];
  onCallUser: OnCallUser | undefined;
  window: TimeWindow;
  timeRange: TimeRange;
  isLoading: boolean;
};

export async function renderSchedule({
  events,
  onCallUser,
  window,
  timeRange,
  isLoading,
}: ScheduleData): Promise<string> {
  if (isLoading) return `![schedule](${toSvgDataUri(await buildScheduleSkeletonSvg())})`;

  const svg =
    timeRange === TimeRange.WEEK
      ? await buildWeekViewSvg({ events, window, onCallUser })
      : await buildMonthViewSvg({ events, window, onCallUser });

  return `![schedule](${toSvgDataUri(svg)})`;
}
