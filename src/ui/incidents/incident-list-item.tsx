import { Color, List } from "@raycast/api";
import { buildIncidentWebUrl, Incident, IncidentStatus } from "@/domain/incident";
import { IncidentActionPanel } from "@/ui/incidents/incident-action-panel";
import { Optional } from "@/common/utils/optional-utils";

interface IncidentListItemProps {
  incident: Incident;
  teamId: Optional<string>;
  onAcknowledge: (incident: Incident) => void;
  onResolve: (incident: Incident) => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<IncidentStatus, Color> = {
  Started: Color.Red,
  Acknowledged: Color.Yellow,
  Resolved: Color.Green,
};

export function IncidentListItem({ incident, teamId, onAcknowledge, onResolve, onRefresh }: IncidentListItemProps) {
  const webUrl = buildIncidentWebUrl(incident.id, teamId);

  return (
    <List.Item
      title={incident.summary ?? incident.name}
      subtitle={incident.cause}
      accessories={[
        { date: new Date(incident.startedAt), tooltip: "Started" },
        { tag: { value: incident.status, color: STATUS_COLOR[incident.status] } },
      ]}
      actions={
        <IncidentActionPanel
          incident={incident}
          webUrl={webUrl}
          onAcknowledge={() => onAcknowledge(incident)}
          onResolve={() => onResolve(incident)}
          onRefresh={onRefresh}
        />
      }
    />
  );
}
