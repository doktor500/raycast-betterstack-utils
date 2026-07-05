import { Color } from "@raycast/api";
import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, Color.Dynamic> = {
  [StatusPageState.OPERATIONAL]: { light: "#218358", dark: "#16C77A", adjustContrast: true },
  [StatusPageState.DEGRADED]: { light: "#CC4E00", dark: "#E7B84A", adjustContrast: true },
  [StatusPageState.DOWNTIME]: { light: "#CE2C31", dark: "#FF8738", adjustContrast: true },
  [StatusPageState.MAINTENANCE]: { light: "#0D74CE", dark: "#21A7FF", adjustContrast: true },
};
