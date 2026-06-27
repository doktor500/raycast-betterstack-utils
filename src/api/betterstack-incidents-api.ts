import { request, V3_BASE } from "@/api/betterstack-client";
import { asOptional, Optional } from "@/common/utils/optional-utils";
import { Incident, IncidentApiData, toIncident } from "@/domain/incident";

export interface CreateIncidentInput {
  summary: string;
  description: Optional<string>;
  requesterEmail: Optional<string>;
  email: boolean;
  sms: boolean;
  call: boolean;
}

interface IncidentListResponse {
  data: IncidentApiData[];
  pagination?: { next?: string | null };
}

interface IncidentResponse {
  data: IncidentApiData;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const body = {
    summary: input.summary,
    description: input.description,
    requester_email: input.requesterEmail,
    email: input.email,
    sms: input.sms,
    call: input.call,
  };

  const response = await request<IncidentResponse>(`${V3_BASE}/incidents`, { method: "POST", body });

  return toIncident(response.data);
}

export async function listIncidents(options: { activeOnly: boolean }): Promise<Incident[]> {
  const params = new URLSearchParams({ per_page: "50" });
  if (options.activeOnly) params.set("resolved", "false");

  let url: Optional<string> = `${V3_BASE}/incidents?${params}`;
  const allIncidents: IncidentApiData[] = [];

  while (url) {
    const page: IncidentListResponse = await request<IncidentListResponse>(url);
    allIncidents.push(...page.data);
    url = asOptional(page.pagination?.next);
  }

  return allIncidents.map(toIncident);
}

export async function acknowledgeIncident(incidentId: string): Promise<void> {
  await request(`${V3_BASE}/incidents/${incidentId}/acknowledge`, { method: "POST" });
}

export async function resolveIncident(incidentId: string): Promise<void> {
  await request(`${V3_BASE}/incidents/${incidentId}/resolve`, { method: "POST" });
}
