import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, string> = {
  [StatusPageState.Operational]: "#4ADE80",
  [StatusPageState.Degraded]: "#F5C86D",
  [StatusPageState.Downtime]: "#F2867E",
  [StatusPageState.Maintenance]: "#7EA6F2",
};
