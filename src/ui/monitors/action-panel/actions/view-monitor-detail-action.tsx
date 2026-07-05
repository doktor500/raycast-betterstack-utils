import { Action, Icon } from "@raycast/api";
import { Monitor } from "@/domain/monitor";
import { MonitorDetail } from "@/ui/monitors/monitor-detail";

interface ViewMonitorDetailActionProps {
  monitor: Monitor & { webUrl: string };
}

export function ViewMonitorDetailAction({ monitor }: ViewMonitorDetailActionProps) {
  return <Action.Push title="View Details" icon={Icon.Eye} target={<MonitorDetail monitor={monitor} />} />;
}
