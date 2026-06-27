import { Action } from "@raycast/api";

type OpenScheduleInBrowserActionProps = {
  url: string;
};

export function OpenScheduleInBrowserAction({ url }: OpenScheduleInBrowserActionProps) {
  return <Action.OpenInBrowser title="Open Schedule in Browser" url={url} shortcut={{ modifiers: ["cmd", "shift"], key: "o" }} />;
}
