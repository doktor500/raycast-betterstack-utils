import { getPreferenceValues, List } from "@raycast/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMonitors } from "@/hooks/use-monitors";
import { useMonitorStatusIcons } from "@/ui/monitors/use-monitor-status-icons";
import { MonitorListItem } from "@/ui/monitors/components/monitor-list-item";

const queryClient = new QueryClient();

function Monitors() {
  const { teamId } = getPreferenceValues<Preferences>();
  const { monitors, isLoading, refresh } = useMonitors({ teamId });
  const icons = useMonitorStatusIcons();

  return (
    <List isLoading={isLoading}>
      {monitors.map((monitor) => (
        <MonitorListItem key={monitor.id} monitor={monitor} icon={icons[monitor.status]} onRefresh={refresh} />
      ))}
    </List>
  );
}

export function MonitorList() {
  return (
    <QueryClientProvider client={queryClient}>
      <Monitors />
    </QueryClientProvider>
  );
}
