import { Action, Icon } from "@raycast/api";

type RefreshActionProps = {
  onRefresh: () => void;
};

export function RefreshAction({ onRefresh }: RefreshActionProps) {
  return (
    <Action
      title="Refresh"
      icon={Icon.ArrowClockwise}
      onAction={onRefresh}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
  );
}
