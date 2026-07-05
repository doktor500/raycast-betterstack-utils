import { Color } from "@raycast/api";
import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, Color.Dynamic> = {
  [StatusPageState.OPERATIONAL]: { light: "#00796B", dark: "#4ADE80" },
  [StatusPageState.DEGRADED]: { light: "#B45309", dark: "#F5C86D" },
  [StatusPageState.DOWNTIME]: { light: "#DC2626", dark: "#F2867E" },
  [StatusPageState.MAINTENANCE]: { light: "#1D4ED8", dark: "#7EA6F2" },
};
