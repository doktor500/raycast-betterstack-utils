import { Action, Icon, Keyboard } from "@raycast/api";

type CopyStatusPageUrlActionProps = {
  url: string;
};

export function CopyStatusPageUrlAction({ url }: CopyStatusPageUrlActionProps) {
  return (
    <Action.CopyToClipboard
      title="Copy URL to Clipboard"
      content={url}
      icon={Icon.Clipboard}
      shortcut={Keyboard.Shortcut.Common.Copy}
    />
  );
}
