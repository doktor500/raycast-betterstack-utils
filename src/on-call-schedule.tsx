import { Detail, environment, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import * as os from "node:os";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCurrentMonthWindow, getCurrentWeekWindow, TimeWindow } from "@/common/utils/date-utils";
import { buildMonthViewSvg } from "@/ui/schedule/components/month/month-schedule";
import { useOnCallData } from "@/hooks/use-on-call-data";
import { buildWeekViewSvg } from "@/ui/schedule/components/week/week-schedule";
import { exportSvgToClipboard } from "@/common/utils/svg-utils";
import { formatUserName } from "@/domain/user";
import { TimeRange } from "@/domain/time-range";
import { getOnCallUser, OnCallEvent } from "@/domain/on-call-event";
import { renderSchedule } from "@/components/schedule-renderer";
import { ScheduleActionPanel } from "@/components/action-panel/schedule-action-panel";

const { WEEK } = TimeRange;

const NO_PRIMARY_SCHEDULE_ERROR_MESSAGE = "## No 'Primary' on-call schedule found in your BetterStack account.";
const SCHEDULE_LOAD_ERROR_TITLE = "## Failed to load on-call schedule";
const SCHEDULE_LOAD_ERROR_MESSAGE = "Check your API token and network connection, then reopen the extension.";

const queryClient = new QueryClient();

function OnCallSchedule() {
  const { events, scheduleName, isLoading, isEmpty, hasError } = useOnCallData();
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.MONTH);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const [markdown, setMarkdown] = useState<string>("");

  const userNames = [...new Set(events.map((event) => formatUserName(event.user)))].toSorted();
  const filteredEvents = selectedUser ? events.filter((event) => formatUserName(event.user) === selectedUser) : events;
  const onCallUser = getOnCallUser(events);
  const window = timeRange === TimeRange.WEEK ? getCurrentWeekWindow(offset) : getCurrentMonthWindow(offset);

  useEffect(() => {
    renderSchedule({ events: filteredEvents, onCallUser, window, timeRange, isLoading }).then(setMarkdown);
  }, [filteredEvents, onCallUser, window, timeRange, isLoading]);

  function handleTimeRangeChange(range: TimeRange) {
    setTimeRange(range);
    setOffset(0);
  }

  if (hasError) {
    return <Detail markdown={[SCHEDULE_LOAD_ERROR_TITLE, SCHEDULE_LOAD_ERROR_MESSAGE].join(os.EOL)} />;
  }

  if (isEmpty) {
    return <Detail markdown={NO_PRIMARY_SCHEDULE_ERROR_MESSAGE} />;
  }

  return (
    <Detail
      isLoading={isLoading || markdown === ""}
      navigationTitle={selectedUser ? `${scheduleName} — ${selectedUser}` : scheduleName}
      markdown={markdown}
      actions={
        <ScheduleActionPanel
          currentTimeRange={timeRange}
          offset={offset}
          userNames={userNames}
          selectedUser={selectedUser}
          onTimeRangeChange={handleTimeRangeChange}
          onOffsetChange={setOffset}
          onUserSelect={setSelectedUser}
          onCopyAsPng={() => copyAsPng({ timeRange, events: filteredEvents, window })}
        />
      }
    />
  );
}

async function copyAsPng(props: { timeRange: TimeRange; events: OnCallEvent[]; window: TimeWindow }) {
  const { timeRange, events, window } = props;
  const toast = await showToast({ style: Toast.Style.Animated, title: "Copying to clipboard…" });
  const data = { events, window };

  try {
    const svg = timeRange === WEEK ? await buildWeekViewSvg(data) : await buildMonthViewSvg(data);
    await exportSvgToClipboard(svg, environment.supportPath);
    toast.style = Toast.Style.Success;
    toast.title = "Schedule copied";
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to copy schedule";
    toast.message = error instanceof Error ? error.message : String(error);
  }
}

export default function Command() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnCallSchedule />
    </QueryClientProvider>
  );
}
