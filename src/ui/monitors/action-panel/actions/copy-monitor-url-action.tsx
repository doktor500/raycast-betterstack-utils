import { Action, Icon, Keyboard } from "@raycast/api";

type CopyMonitorUrlActionProps = {
  url: string;
};

export function CopyMonitorUrlAction({ url }: CopyMonitorUrlActionProps) {
  return (
    <Action.CopyToClipboard
      title="Copy URL to Clipboard"
      content={url}
      icon={Icon.Clipboard}
      shortcut={Keyboard.Shortcut.Common.Copy}
    />
  );
}
