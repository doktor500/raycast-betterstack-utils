import { Icon, List } from "@raycast/api";
import { Monitor } from "@/domain/monitor";
import { MONITOR_STATUS_COLOR, MONITOR_STATUS_LABEL } from "@/ui/monitors/monitor-status";
import { MonitorListActionPanel } from "@/ui/monitors/action-panel/monitor-list-action-panel";

interface MonitorListItemProps {
  monitor: Monitor & { webUrl: string };
  onRefresh: () => void;
}

export function MonitorListItem({ monitor, onRefresh }: MonitorListItemProps) {
  return (
    <List.Item
      title={monitor.name}
      subtitle={monitor.url}
      icon={{ source: Icon.CircleFilled, tintColor: MONITOR_STATUS_COLOR[monitor.status] }}
      accessories={[
        { tag: { value: MONITOR_STATUS_LABEL[monitor.status], color: MONITOR_STATUS_COLOR[monitor.status] } },
      ]}
      actions={<MonitorListActionPanel monitor={monitor} onRefresh={onRefresh} />}
    />
  );
}
