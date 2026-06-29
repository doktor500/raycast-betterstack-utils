import { Action, ActionPanel, Icon, Keyboard } from "@raycast/api";
import { Incident } from "@/domain/incident";
import { IncidentForm } from "@/ui/incidents/incident-form";

interface IncidentActionPanelProps {
  incident: Incident;
  webUrl: string;
  onAcknowledge: () => void;
  onResolve: () => void;
  onRefresh: () => void;
}

export function IncidentActionPanel({
  incident,
  webUrl,
  onAcknowledge,
  onResolve,
  onRefresh,
}: IncidentActionPanelProps) {
  return (
    <ActionPanel>
      {incident.status === "Started" && (
        <Action
          title="Acknowledge"
          icon={Icon.Checkmark}
          onAction={onAcknowledge}
          shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
        />
      )}
      {incident.status !== "Resolved" && (
        <Action
          title="Resolve"
          icon={Icon.CheckCircle}
          onAction={onResolve}
          shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
        />
      )}
      <Action.OpenInBrowser title="Open in Browser" url={webUrl} shortcut={Keyboard.Shortcut.Common.OpenWith} />
      <Action.Push
        title="Create Incident"
        icon={Icon.Plus}
        target={<IncidentForm />}
        shortcut={Keyboard.Shortcut.Common.New}
      />
      <Action
        title="Refresh"
        icon={Icon.ArrowClockwise}
        onAction={onRefresh}
        shortcut={Keyboard.Shortcut.Common.Refresh}
      />
    </ActionPanel>
  );
}
