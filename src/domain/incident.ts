import { asOptional, Optional } from "@/common/utils/optional-utils";

export type IncidentStatus = "Started" | "Acknowledged" | "Resolved";

export interface Incident {
  id: string;
  name: string;
  summary: Optional<string>;
  cause: Optional<string>;
  status: IncidentStatus;
  startedAt: string;
  acknowledgedBy: Optional<string>;
  resolvedBy: Optional<string>;
}

export interface IncidentApiAttributes {
  name?: Optional<string>;
  summary?: Optional<string>;
  cause?: Optional<string>;
  status?: Optional<string>;
  started_at: string;
  acknowledged_by?: Optional<string>;
  resolved_by?: Optional<string>;
}

export interface IncidentApiData {
  id: string;
  type: "incident";
  attributes: IncidentApiAttributes;
}

const UNTITLED_INCIDENT = "Untitled incident";
const KNOWN_STATUSES: IncidentStatus[] = ["Started", "Acknowledged", "Resolved"];

export function toIncident(data: IncidentApiData): Incident {
  const { id, attributes } = data;

  return {
    id,
    name: attributes.name ?? UNTITLED_INCIDENT,
    summary: asOptional(attributes.summary),
    cause: asOptional(attributes.cause),
    status: toIncidentStatus(attributes.status),
    startedAt: attributes.started_at,
    acknowledgedBy: asOptional(attributes.acknowledged_by),
    resolvedBy: asOptional(attributes.resolved_by),
  };
}

function toIncidentStatus(status: Optional<string>): IncidentStatus {
  return KNOWN_STATUSES.find((knownStatus) => knownStatus === status) ?? "Started";
}

export function buildIncidentWebUrl(incidentId: string, teamId: Optional<string>): string {
  const trimmedTeamId = teamId?.trim();

  return trimmedTeamId
    ? `https://uptime.betterstack.com/team/t${trimmedTeamId}/incidents/${incidentId}`
    : `https://uptime.betterstack.com/incidents/${incidentId}`;
}
