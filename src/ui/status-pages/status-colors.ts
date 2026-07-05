import { Color } from "@raycast/api";
import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, Color.Dynamic> = {
  [StatusPageState.OPERATIONAL]: { light: "#16A34A", dark: "#4ADE80", adjustContrast: false },
  [StatusPageState.DEGRADED]: { light: "#B45309", dark: "#F5C86D", adjustContrast: false },
  [StatusPageState.DOWNTIME]: { light: "#DC2626", dark: "#F2867E", adjustContrast: false },
  [StatusPageState.MAINTENANCE]: { light: "#1D4ED8", dark: "#7EA6F2", adjustContrast: false },
};
