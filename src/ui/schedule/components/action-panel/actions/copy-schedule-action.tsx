import { Action } from "@raycast/api";

type CopyScheduleActionProps = {
  onCopyAsPng: () => void;
};

export function CopyScheduleAction({ onCopyAsPng }: CopyScheduleActionProps) {
  return (
    <Action
      title="Copy Schedule to Clipboard"
      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
      onAction={onCopyAsPng}
    />
  );
}
