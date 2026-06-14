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

export function renderSchedule({ events, onCallUser, window, timeRange, isLoading }: ScheduleData): string {
  if (isLoading) return `![schedule](${toSvgDataUri(buildScheduleSkeletonSvg())})`;

  return timeRange === TimeRange.WEEK
    ? `![schedule](${toSvgDataUri(buildWeekViewSvg({ events, window, onCallUser }))})`
    : `![schedule](${toSvgDataUri(buildMonthViewSvg({ events, window, onCallUser }))})`;
}
