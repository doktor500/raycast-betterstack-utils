import { Icon, List } from "@raycast/api";
import { StatusPage } from "@/domain/status-page";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { StatusPageActionPanel } from "@/ui/status-pages/action-panel/status-page-action-panel";
import { StatusPageDetail } from "@/ui/status-pages/components/status-page-detail";

interface StatusPageListItemProps {
  statusPage: StatusPage & { url: string };
  pulseMarkdown: string;
  onRefresh: () => void;
}

export function StatusPageListItem({ statusPage, pulseMarkdown, onRefresh }: StatusPageListItemProps) {
  return (
    <List.Item
      title={statusPage.name}
      icon={{ source: Icon.CircleFilled, tintColor: STATE_COLOR[statusPage.state] }}
      detail={<StatusPageDetail statusPage={statusPage} pulseMarkdown={pulseMarkdown} />}
      actions={<StatusPageActionPanel url={statusPage.url} onRefresh={onRefresh} />}
    />
  );
}
