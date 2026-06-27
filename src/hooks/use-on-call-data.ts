import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRota, getOnCallEvents } from "@/api/betterstack-schedule-api";
import { OnCallEvent, resolveOverrideConflicts } from "@/domain/on-call-event";
import { Calendar } from "@/domain/calendar";
import { toList } from "@/common/utils/collection-utils";
import { toString } from "@/common/utils/string-utils";
import { Optional } from "@/common/utils/optional-utils";

const PRIMARY_SCHEDULE_NAME = "Primary";

interface OnCallData {
  onCallEvents: OnCallEvent[];
  scheduleName: string;
  onCallPageUrl: Optional<string>;
  isLoading: boolean;
  isEmpty: boolean;
  hasError: boolean;
}

type ScheduleData = Optional<{ scheduleName: string; onCallPageUrl: Optional<string>; events: OnCallEvent[] }>;

export function useOnCallData(): OnCallData {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["on-call-data"], queryFn: fetchScheduleData });

  useEffect(() => {
    if (isError) {
      const message = error instanceof Error ? error.message : String(error);
      void showToast({ style: Toast.Style.Failure, title: "Failed to load on-call schedule", message });
    }
  }, [isError, error]);

  return {
    onCallEvents: toList(data?.events),
    scheduleName: toString(data?.scheduleName),
    onCallPageUrl: data?.onCallPageUrl,
    isLoading,
    isEmpty: !isLoading && !isError && data === null,
    hasError: isError,
  };
}

async function fetchScheduleData(): Promise<ScheduleData> {
  const { calendars, teamMembers } = await getRota();
  const primaryCalendar = findPrimarySchedule(calendars);

  if (primaryCalendar) {
    const scheduleName = primaryCalendar.name ?? PRIMARY_SCHEDULE_NAME;
    const onCallPageUrl = buildOnCallPageUrl();
    const calendarEvents = await getOnCallEvents(primaryCalendar.id, teamMembers);
    const events = resolveOverrideConflicts(calendarEvents);

    return { scheduleName, onCallPageUrl, events };
  }
}

function buildOnCallPageUrl(): Optional<string> {
  const { teamId } = getPreferenceValues<Preferences>();
  const trimmedTeamId = teamId?.trim();

  return trimmedTeamId ? `https://uptime.betterstack.com/team/t${trimmedTeamId}/oncalls` : undefined;
}

function findPrimarySchedule(calendars: Calendar[]): Optional<Calendar> {
  return calendars.find((calendar) => calendar.name?.toLowerCase().includes(PRIMARY_SCHEDULE_NAME.toLowerCase()));
}
