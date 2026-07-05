import { environment } from "@raycast/api";
import { toImageDataUri } from "@/common/utils/svg-utils";
import { StatusPageState } from "@/domain/status-page";
import { STATE_HEX } from "@/ui/status-pages/status-colors";

const iconCache = new Map<StatusPageState, Promise<string>>();

export function buildPulseRingSvg(color: string): string {
  return [
    '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">',
    `<circle cx="8" cy="8" r="6" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.45" />`,
    `<circle cx="8" cy="8" r="3" fill="${color}" />`,
    "</svg>",
  ].join("");
}

export function getPulseRingIcon(state: StatusPageState): Promise<string> {
  const cached = iconCache.get(state);
  if (cached) return cached;

  const svg = buildPulseRingSvg(STATE_HEX[state]);
  const icon = toImageDataUri(svg, environment.supportPath, environment.raycastVersion).catch((error) => {
    iconCache.delete(state);
    throw error;
  });
  iconCache.set(state, icon);
  return icon;
}
