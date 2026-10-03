import { Detail, environment } from "@raycast/api";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Monitor } from "@/domain/monitor";
import { useMonitorAvailability } from "@/hooks/use-monitor-availability";
import { buildMonitorDetailMarkdown } from "@/ui/monitors/monitor-detail-renderer";
import { buildMonitorStatusHeaderSvg } from "@/ui/monitors/components/monitor-status-header";
import { MonitorActionPanel } from "@/ui/monitors/action-panel/monitor-action-panel";
import { toImageDataUri } from "@/common/utils/svg-utils";
import { Optional } from "@/common/utils/optional-utils";

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
  const [headerMarkdown, setHeaderMarkdown] = useState<Optional<string>>(undefined);

  useEffect(() => {
    buildMonitorStatusHeaderSvg(monitor)
      .then((svg) => toImageDataUri(svg, environment.supportPath, environment.raycastVersion))
      .then((uri) => setHeaderMarkdown(`![status](${uri})`))
      .catch(() => setHeaderMarkdown(`## ${monitor.name}`));
  }, [monitor]);

  // Hold the content back until the header settles; swapping the text heading for the taller
  // image header afterwards would push everything below it down.
  const markdown =
    headerMarkdown === undefined
      ? ""
      : buildMonitorDetailMarkdown(monitor, { periods, isLoading, isError }, headerMarkdown);

  return (
    <Detail
      isLoading={isLoading || headerMarkdown === undefined}
      navigationTitle={monitor.name}
      markdown={markdown}
      actions={<MonitorActionPanel webUrl={monitor.webUrl} onRefresh={refresh} />}
    />
  );
}
