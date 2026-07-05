import { Image, List } from "@raycast/api";
import { StatusPage } from "@/domain/status-page";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { capitalize } from "@/common/utils/string-utils";
import { StatusPageActionPanel } from "@/ui/status-pages/action-panel/status-page-action-panel";

interface StatusPageListItemProps {
  statusPage: StatusPage & { url: string };
  icon: Image.ImageLike;
  onRefresh: () => void;
}

export function StatusPageListItem({ statusPage, icon, onRefresh }: StatusPageListItemProps) {
  return (
    <List.Item
      title={statusPage.name}
      subtitle={statusPage.url}
      icon={icon}
      accessories={[{ tag: { value: capitalize(statusPage.state), color: STATE_COLOR[statusPage.state] } }]}
      actions={<StatusPageActionPanel url={statusPage.url} onRefresh={onRefresh} />}
    />
  );
}
