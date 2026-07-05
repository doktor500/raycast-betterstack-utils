import { ActionPanel } from "@raycast/api";
import { OpenStatusPageInBrowserAction } from "@/ui/status-pages/action-panel/actions/open-status-page-in-browser-action";
import { CopyStatusPageUrlAction } from "@/ui/status-pages/action-panel/actions/copy-status-page-url-action";
import { RefreshAction } from "@/ui/status-pages/action-panel/actions/refresh-action";

interface StatusPageActionPanelProps {
  url: string;
  onRefresh: () => void;
}

export function StatusPageActionPanel({ url, onRefresh }: StatusPageActionPanelProps) {
  return (
    <ActionPanel>
      <RefreshAction onRefresh={onRefresh} />
      <CopyStatusPageUrlAction url={url} />
      <OpenStatusPageInBrowserAction url={url} />
    </ActionPanel>
  );
}
