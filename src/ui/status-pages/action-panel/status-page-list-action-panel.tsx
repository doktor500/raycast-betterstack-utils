import { ActionPanel } from "@raycast/api";
import { StatusPage } from "@/domain/status-page";
import { ViewStatusPageDetailAction } from "@/ui/status-pages/action-panel/actions/view-status-page-detail-action";
import { OpenStatusPageInBrowserAction } from "@/ui/status-pages/action-panel/actions/open-status-page-in-browser-action";
import { CopyStatusPageUrlAction } from "@/ui/status-pages/action-panel/actions/copy-status-page-url-action";
import { RefreshAction } from "@/ui/status-pages/action-panel/actions/refresh-action";

interface StatusPageListActionPanelProps {
  statusPage: StatusPage & { url: string };
  onRefresh: () => void;
}

export function StatusPageListActionPanel({ statusPage, onRefresh }: StatusPageListActionPanelProps) {
  return (
    <ActionPanel>
      <ViewStatusPageDetailAction statusPage={statusPage} />
      <OpenStatusPageInBrowserAction url={statusPage.url} />
      <CopyStatusPageUrlAction url={statusPage.url} />
      <RefreshAction onRefresh={onRefresh} />
    </ActionPanel>
  );
}
