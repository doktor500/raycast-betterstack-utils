import { Action, Icon } from "@raycast/api";
import { IncidentForm } from "@/ui/incidents/incident-form";

export function CreateIncidentAction() {
  return (
    <Action.Push
      title="Create Incident"
      icon={Icon.Plus}
      target={<IncidentForm />}
      shortcut={{ modifiers: ["cmd"], key: "n" }}
    />
  );
}
