import { TimeRange } from "@/domain/time-range";
import { Action } from "@raycast/api";

type BackToCurrentActionProps = {
  currentTimeRange: TimeRange;
  offset: number;
  onOffsetChange: (offset: number) => void;
};

export function BackToCurrentAction({ currentTimeRange, offset, onOffsetChange }: BackToCurrentActionProps) {
  if (offset === 0) return null;
  const backLabel = currentTimeRange === TimeRange.MONTH ? "Back to Current Month" : "Back to Current Week";
  return <Action title={backLabel} shortcut={{ modifiers: [], key: "0" }} onAction={() => onOffsetChange(0)} />;
}
