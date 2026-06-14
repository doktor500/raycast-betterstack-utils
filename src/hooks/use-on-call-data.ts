import { showToast, Toast } from "@raycast/api";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRota, getOnCallEvents } from "@/api/betterstack-api";
import { OnCallEvent, resolveOverrideConflicts } from "@/domain/on-call-event";
import { Calendar } from "@/domain/calendar";
import { toList } from "@/common/utils/collection-utils";
import { toString } from "@/common/utils/string-utils";

const PRIMARY_SCHEDULE_NAME = "Primary";

interface OnCallData {
  events: OnCallEvent[];
  scheduleName: string;
  isLoading: boolean;
  noSchedule: boolean;
  hasError: boolean;
}

type ScheduleData = { scheduleName: string; events: OnCallEvent[] } | undefined;

export function useOnCallData(): OnCallData {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["on-call-data"], queryFn: fetchScheduleData });

  useEffect(() => {
    if (isError) {
      const message = error instanceof Error ? error.message : String(error);
      void showToast({ style: Toast.Style.Failure, title: "Failed to load on-call schedule", message });
    }
  }, [isError, error]);

  return {
    events: toList(data?.events),
    scheduleName: toString(data?.scheduleName),
    isLoading,
    noSchedule: !isLoading && !isError && data === null,
    hasError: isError,
  };
}

async function fetchScheduleData(): Promise<ScheduleData> {
  const { calendars, teamMembers } = await getRota();
  const primaryCalendar = findPrimarySchedule(calendars);
  if (!primaryCalendar) return undefined;

  const scheduleName = primaryCalendar.name ?? PRIMARY_SCHEDULE_NAME;
  const calendarEvents = await getOnCallEvents(primaryCalendar.id, teamMembers);
  const events = resolveOverrideConflicts(calendarEvents);

  return { scheduleName, events };
}

function findPrimarySchedule(calendars: Calendar[]): Calendar | undefined {
  return calendars.find((calendar) => calendar.name?.toLowerCase().includes(PRIMARY_SCHEDULE_NAME.toLowerCase()));
}
