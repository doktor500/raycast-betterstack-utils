import { TimeRange } from "@/domain/time-range";
import { ActionPanel } from "@raycast/api";
import { ToggleTimeRangeAction } from "@/ui/action-panel/actions/toggle-time-range-action";
import { PreviousPeriodAction } from "@/ui/action-panel/actions/previous-period-action";
import { NextPeriodAction } from "@/ui/action-panel/actions/next-period-action";
import { BackToCurrentAction } from "@/ui/action-panel/actions/back-to-current-action";
import { CopyScheduleAction } from "@/ui/action-panel/actions/copy-schedule-action";
import { FilterByUserSubmenu } from "@/ui/action-panel/filter-by-user-submenu";
import { ClearUserFilterAction } from "@/ui/action-panel/actions/clear-user-filter-action";

type ScheduleActionPanelProps = {
  currentTimeRange: TimeRange;
  offset: number;
  userNames: string[];
  selectedUser: string;
  onTimeRangeChange: (range: TimeRange) => void;
  onOffsetChange: (offset: number) => void;
  onUserSelect: (user: string) => void;
  onCopyAsPng: () => void;
};

export function ScheduleActionPanel(props: ScheduleActionPanelProps) {
  const { currentTimeRange, offset, userNames, selectedUser } = props;
  const { onTimeRangeChange, onOffsetChange, onUserSelect, onCopyAsPng } = props;

  return (
    <ActionPanel>
      <ToggleTimeRangeAction currentTimeRange={currentTimeRange} onTimeRangeChange={onTimeRangeChange} />
      <PreviousPeriodAction currentTimeRange={currentTimeRange} offset={offset} onOffsetChange={onOffsetChange} />
      <NextPeriodAction currentTimeRange={currentTimeRange} offset={offset} onOffsetChange={onOffsetChange} />
      <BackToCurrentAction offset={offset} onOffsetChange={onOffsetChange} />
      <CopyScheduleAction onCopyAsPng={onCopyAsPng} />
      <FilterByUserSubmenu userNames={userNames} selectedUser={selectedUser} onUserSelect={onUserSelect} />
      <ClearUserFilterAction selectedUser={selectedUser} onUserSelect={onUserSelect} />
    </ActionPanel>
  );
}
