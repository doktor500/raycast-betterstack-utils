import { Color } from "@raycast/api";
import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, Color.Dynamic> = {
  [StatusPageState.Operational]: { light: "#16A34A", dark: "#4ADE80", adjustContrast: false },
  [StatusPageState.Degraded]: { light: "#B45309", dark: "#F5C86D", adjustContrast: false },
  [StatusPageState.Downtime]: { light: "#DC2626", dark: "#F2867E", adjustContrast: false },
  [StatusPageState.Maintenance]: { light: "#1D4ED8", dark: "#7EA6F2", adjustContrast: false },
};
