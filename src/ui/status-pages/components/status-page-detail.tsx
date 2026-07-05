import { List } from "@raycast/api";
import { StatusPage } from "@/domain/status-page";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { capitalize } from "@/common/utils/string-utils";

interface StatusPageDetailProps {
  statusPage: StatusPage & { url: string };
  pulseMarkdown: string;
}

export function StatusPageDetail({ statusPage, pulseMarkdown }: StatusPageDetailProps) {
  return (
    <List.Item.Detail
      markdown={pulseMarkdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.TagList title="Status">
            <List.Item.Detail.Metadata.TagList.Item
              text={capitalize(statusPage.state)}
              color={STATE_COLOR[statusPage.state]}
            />
          </List.Item.Detail.Metadata.TagList>
          <List.Item.Detail.Metadata.Label title="URL" text={statusPage.url} />
        </List.Item.Detail.Metadata>
      }
    />
  );
}
