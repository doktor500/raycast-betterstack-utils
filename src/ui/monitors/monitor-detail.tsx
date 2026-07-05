import { Detail } from "@raycast/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Monitor } from "@/domain/monitor";
import { useMonitorAvailability } from "@/hooks/use-monitor-availability";
import { buildMonitorDetailMarkdown } from "@/ui/monitors/monitor-detail-renderer";
import { MonitorActionPanel } from "@/ui/monitors/action-panel/monitor-action-panel";
import { MONITOR_STATUS_COLOR } from "@/ui/monitors/monitor-status";
import { usePulseFrame } from "@/ui/use-pulse-icons";

const queryClient = new QueryClient();

interface MonitorDetailProps {
  monitor: Monitor & { webUrl: string };
}

export function MonitorDetail({ monitor }: MonitorDetailProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MonitorDetailContent monitor={monitor} />
    </QueryClientProvider>
  );
}

function MonitorDetailContent({ monitor }: MonitorDetailProps) {
  const { periods, isLoading, isError, refresh } = useMonitorAvailability(monitor.id, monitor.createdAt);
  const statusIconUri = usePulseFrame(MONITOR_STATUS_COLOR[monitor.status]);
  const markdown = buildMonitorDetailMarkdown(monitor, { periods, isLoading, isError }, statusIconUri);

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={monitor.name}
      markdown={markdown}
      actions={<MonitorActionPanel webUrl={monitor.webUrl} onRefresh={refresh} />}
    />
  );
}
