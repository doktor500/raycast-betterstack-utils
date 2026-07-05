import { Detail } from "@raycast/api";
import { DateTime } from "luxon";
import { Monitor } from "@/domain/monitor";
import { capitalize } from "@/common/utils/string-utils";
import { Optional } from "@/common/utils/optional-utils";
import { MONITOR_STATUS_COLOR, MONITOR_STATUS_LABEL } from "@/ui/monitors/monitor-status";
import { MonitorActionPanel } from "@/ui/monitors/action-panel/monitor-action-panel";

interface MonitorDetailProps {
  monitor: Monitor & { webUrl: string };
}

export function MonitorDetail({ monitor }: MonitorDetailProps) {
  return (
    <Detail
      navigationTitle={monitor.name}
      markdown={`# ${monitor.name}\n\n${monitor.url}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Status">
            <Detail.Metadata.TagList.Item
              text={MONITOR_STATUS_LABEL[monitor.status]}
              color={MONITOR_STATUS_COLOR[monitor.status]}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Link title="URL" target={monitor.url} text={monitor.url} />
          {monitor.monitorType && <Detail.Metadata.Label title="Type" text={capitalize(monitor.monitorType)} />}
          {monitor.httpMethod && <Detail.Metadata.Label title="Method" text={monitor.httpMethod.toUpperCase()} />}
          {monitor.checkFrequency !== undefined && (
            <Detail.Metadata.Label title="Check Frequency" text={formatSeconds(monitor.checkFrequency)} />
          )}
          {monitor.requestTimeout !== undefined && (
            <Detail.Metadata.Label title="Request Timeout" text={formatSeconds(monitor.requestTimeout)} />
          )}
          {monitor.recoveryPeriod !== undefined && (
            <Detail.Metadata.Label title="Recovery Period" text={formatSeconds(monitor.recoveryPeriod)} />
          )}
          <Detail.Metadata.Label title="Last Checked" text={formatLastChecked(monitor.lastCheckedAt)} />
          {monitor.regions.length > 0 && (
            <Detail.Metadata.TagList title="Regions">
              {monitor.regions.map((region) => (
                <Detail.Metadata.TagList.Item key={region} text={region.toUpperCase()} />
              ))}
            </Detail.Metadata.TagList>
          )}
          {monitor.sslExpiration !== undefined && (
            <Detail.Metadata.Label title="SSL Expiration" text={formatDays(monitor.sslExpiration)} />
          )}
          {monitor.domainExpiration !== undefined && (
            <Detail.Metadata.Label title="Domain Expiration" text={formatDays(monitor.domainExpiration)} />
          )}
        </Detail.Metadata>
      }
      actions={<MonitorActionPanel webUrl={monitor.webUrl} />}
    />
  );
}

function formatSeconds(seconds: number): string {
  return `${seconds}s`;
}

function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatLastChecked(lastCheckedAt: Optional<string>): string {
  if (!lastCheckedAt) return "Never";
  return DateTime.fromISO(lastCheckedAt).toLocaleString(DateTime.DATETIME_MED);
}
