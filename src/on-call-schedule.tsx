import { Action, ActionPanel, Detail, environment, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { getCurrentMonthWindow, getThreeMonthWindow } from "./common/dates";
import { buildCombinedScheduleSvg, exportSvgToClipboard, toSvgDataUri } from "./ui/schedule/schedule";
import { useOnCallData } from "./hooks/use-on-call-data";
import { formatUserName, getCurrentOnCallUser } from "./domain/on-call-event";
import { buildColorMap, Colors } from "./common/colors";
import { buildScheduleSkeletonSvg } from "./ui/schedule/skeleton/schedule";
import { buildWeekViewSvg } from "./ui/schedule/components/week-view";

type TimeRange = "current-week" | "current-month" | "3-months";

type ScheduleActionPanelProps = {
  nextTimeRange: TimeRange;
  userNames: string[];
  selectedUser: string;
  onTimeRangeChange: (range: TimeRange) => void;
  onCopyAsPng: () => void;
  onUserSelect: (user: string) => void;
};

const NEXT_TIME_RANGE: Record<TimeRange, TimeRange> = {
  "current-month": "current-week",
  "current-week": "3-months",
  "3-months": "current-month",
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "current-week": "current week",
  "current-month": "current month",
  "3-months": "3 month view",
};

export default function Command() {
  const { events, scheduleName, isLoading, noSchedule } = useOnCallData();
  const [timeRange, setTimeRange] = useState<TimeRange>("current-month");
  const [selectedUser, setSelectedUser] = useState<string>("");

  const today = new Date();

  if (noSchedule) {
    return <NoScheduleDetail />;
  }

  const userNames = [...new Set(events.map((e) => formatUserName(e.user)))].sort();
  const colorMap = buildColorMap(userNames);
  const filteredEvents = selectedUser ? events.filter((e) => formatUserName(e.user) === selectedUser) : events;

  async function copyAsPng() {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Copying to clipboard…" });
    try {
      const svg =
        timeRange === "current-week"
          ? buildWeekViewSvg({ events: filteredEvents, today, backgroundColor: Colors.DARK, allEvents: events })
          : buildCombinedScheduleSvg({
              events: filteredEvents,
              today: today,
              window: scheduleWindow,
              backgroundColor: Colors.DARK,
              showTodayMarker: false,
              allEvents: events,
            });
      await exportSvgToClipboard(svg, environment.supportPath);
      toast.style = Toast.Style.Success;
      toast.title = "Schedule copied";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to copy schedule";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  const nextTimeRange: TimeRange = NEXT_TIME_RANGE[timeRange];
  const scheduleWindow = timeRange === "3-months" ? getThreeMonthWindow() : getCurrentMonthWindow();

  const scheduleSvgProps = {
    events: filteredEvents,
    today: today,
    window: scheduleWindow,
    backgroundColor: undefined,
    showTodayMarker: true,
    showOnCallPill: true,
    allEvents: events,
  };

  function buildScheduleMarkdown(): string {
    if (isLoading) return `![schedule](${toSvgDataUri(buildScheduleSkeletonSvg())})`;
    if (timeRange === "current-week") {
      const currentOnCall = getCurrentOnCallUser(today, events);
      const onCallName = currentOnCall ? formatUserName(currentOnCall) : undefined;
      const onCallColor = onCallName ? (colorMap.get(onCallName) ?? Colors.GREEN) : undefined;
      return `![schedule](${toSvgDataUri(buildWeekViewSvg({ events: filteredEvents, today, allEvents: events, onCallName, onCallColor }))})`;
    }
    return `![schedule](${toSvgDataUri(buildCombinedScheduleSvg(scheduleSvgProps))})`;
  }

  const markdown = buildScheduleMarkdown();

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={selectedUser ? `${scheduleName} — ${selectedUser}` : scheduleName}
      markdown={markdown}
      actions={
        <ScheduleActionPanel
          nextTimeRange={nextTimeRange}
          userNames={userNames}
          selectedUser={selectedUser}
          onTimeRangeChange={setTimeRange}
          onCopyAsPng={copyAsPng}
          onUserSelect={setSelectedUser}
        />
      }
    />
  );
}

function NoScheduleDetail() {
  return <Detail markdown={"## No 'Primary' on-call schedule found in your BetterStack account."} />;
}

function ScheduleActionPanel({
  nextTimeRange,
  userNames,
  selectedUser,
  onTimeRangeChange,
  onCopyAsPng,
  onUserSelect,
}: ScheduleActionPanelProps) {
  return (
    <ActionPanel>
      <Action title={`Show ${TIME_RANGE_LABELS[nextTimeRange]}`} onAction={() => onTimeRangeChange(nextTimeRange)} />
      <Action
        title="Copy Schedule to Clipboard"
        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
        onAction={onCopyAsPng}
      />
      {userNames.length > 0 && (
        <ActionPanel.Submenu
          title={selectedUser ? `Filter: ${selectedUser}` : "Filter by User"}
          shortcut={{ modifiers: ["cmd"], key: "f" }}
        >
          <Action title="All Users" onAction={() => onUserSelect("")} />
          {userNames.map((name) => (
            <Action key={name} title={name} onAction={() => onUserSelect(name)} />
          ))}
        </ActionPanel.Submenu>
      )}
      {selectedUser && (
        <Action
          title="Clear User Filter"
          shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
          onAction={() => onUserSelect("")}
        />
      )}
    </ActionPanel>
  );
}

