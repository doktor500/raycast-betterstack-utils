import { List } from "@raycast/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStatusPages } from "@/hooks/use-status-pages";
import { useStatusPagePulseImage } from "@/ui/status-pages/use-status-page-pulse-image";
import { StatusPageListItem } from "@/ui/status-pages/components/status-page-list-item";

const queryClient = new QueryClient();

function StatusPages() {
  const { statusPages, isLoading, refresh } = useStatusPages();
  const pulseImages = useStatusPagePulseImage();

  return (
    <List isLoading={isLoading} isShowingDetail>
      {statusPages.map((statusPage) => (
        <StatusPageListItem
          key={statusPage.id}
          statusPage={statusPage}
          pulseMarkdown={pulseImages[statusPage.state]}
          onRefresh={refresh}
        />
      ))}
    </List>
  );
}

export function StatusPageList() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusPages />
    </QueryClientProvider>
  );
}
