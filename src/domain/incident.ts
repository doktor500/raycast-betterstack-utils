import { Optional } from "@/common/utils/optional-utils";

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
