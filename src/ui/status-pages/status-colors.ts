import { Color } from "@raycast/api";
import { StatusPageState } from "@/domain/status-page";

export const STATE_COLOR: Record<StatusPageState, Color> = {
  [StatusPageState.Operational]: Color.Green,
  [StatusPageState.Degraded]: Color.Yellow,
  [StatusPageState.Downtime]: Color.Red,
  [StatusPageState.Maintenance]: Color.Blue,
};

export const STATE_HEX: Record<StatusPageState, string> = {
  [StatusPageState.Operational]: "#2ECC71",
  [StatusPageState.Degraded]: "#FFD60A",
  [StatusPageState.Downtime]: "#FF6363",
  [StatusPageState.Maintenance]: "#0A84FF",
};
