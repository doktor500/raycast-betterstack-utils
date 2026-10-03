import { Detail, environment } from "@raycast/api";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Monitor } from "@/domain/monitor";
import { useMonitorAvailability } from "@/hooks/use-monitor-availability";
import { buildMonitorDetailMarkdown, renderMonitorAvailability } from "@/ui/monitors/monitor-detail-renderer";
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
  const [availabilityMarkdown, setAvailabilityMarkdown] = useState<Optional<string>>(undefined);

  useEffect(() => {
    buildMonitorStatusHeaderSvg(monitor)
      .then((svg) => toImageDataUri(svg, environment.supportPath, environment.raycastVersion))
      .then((uri) => setHeaderMarkdown(`![status](${uri})`))
      .catch(() => setHeaderMarkdown(`## ${monitor.name}`));
  }, [monitor]);

  useEffect(() => {
    renderMonitorAvailability(monitor, { periods, isLoading, isError })
      .then(setAvailabilityMarkdown)
      .catch(() => setAvailabilityMarkdown("_Failed to render availability data._"));
  }, [monitor, periods, isLoading, isError]);

  const isRendered = headerMarkdown !== undefined && availabilityMarkdown !== undefined;
  const markdown = buildMonitorDetailMarkdown(monitor, availabilityMarkdown, headerMarkdown);

  return (
    <Detail
      isLoading={isLoading || !isRendered}
      navigationTitle={monitor.name}
      markdown={markdown}
      actions={<MonitorActionPanel webUrl={monitor.webUrl} onRefresh={refresh} />}
    />
  );
}
