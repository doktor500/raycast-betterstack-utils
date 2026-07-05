import { ActionPanel } from "@raycast/api";
import { OpenMonitorInBrowserAction } from "@/ui/monitors/action-panel/actions/open-monitor-in-browser-action";
import { CopyMonitorUrlAction } from "@/ui/monitors/action-panel/actions/copy-monitor-url-action";

interface MonitorActionPanelProps {
  webUrl: string;
}

export function MonitorActionPanel({ webUrl }: MonitorActionPanelProps) {
  return (
    <ActionPanel>
      <OpenMonitorInBrowserAction url={webUrl} />
      <CopyMonitorUrlAction url={webUrl} />
    </ActionPanel>
  );
}
