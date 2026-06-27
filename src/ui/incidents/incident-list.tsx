import { getPreferenceValues, List } from "@raycast/api";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIncidents } from "@/hooks/use-incidents";
import { IncidentListItem } from "@/ui/incidents/incident-list-item";

const queryClient = new QueryClient();

type IncidentFilter = "active" | "all";

function Incidents() {
  const { teamId } = getPreferenceValues<Preferences>();
  const [filter, setFilter] = useState<IncidentFilter>("active");
  const { incidents, isLoading, acknowledge, resolve, refresh } = useIncidents({
    activeOnly: filter === "active",
    teamId,
  });

  return (
    <List
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter incidents"
          value={filter}
          onChange={(newValue) => {
            if (newValue === "active" || newValue === "all") setFilter(newValue);
          }}
        >
          <List.Dropdown.Item title="Active" value="active" />
          <List.Dropdown.Item title="All" value="all" />
        </List.Dropdown>
      }
    >
      {incidents.map((incident) => (
        <IncidentListItem
          key={incident.id}
          incident={incident}
          webUrl={incident.webUrl}
          onAcknowledge={acknowledge}
          onResolve={resolve}
          onRefresh={refresh}
        />
      ))}
    </List>
  );
}

export function IncidentList() {
  return (
    <QueryClientProvider client={queryClient}>
      <Incidents />
    </QueryClientProvider>
  );
}
