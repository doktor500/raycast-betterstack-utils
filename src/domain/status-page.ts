import { Optional } from "@/common/utils/optional-utils";

export const StatusPageState = {
  Operational: "operational",
  Degraded: "degraded",
  Downtime: "downtime",
  Maintenance: "maintenance",
} as const;

export type StatusPageState = (typeof StatusPageState)[keyof typeof StatusPageState];

export interface StatusPage {
  id: string;
  name: string;
  subdomain: string;
  customDomain: Optional<string>;
  state: StatusPageState;
}
