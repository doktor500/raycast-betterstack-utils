import { environment } from "@raycast/api";
import { toImageDataUri } from "@/common/utils/svg-utils";
import { StatusPageState } from "@/domain/status-page";
import { STATE_HEX } from "@/ui/status-pages/status-colors";

const FRAME_COUNT = 4;

const framesCache = new Map<StatusPageState, Promise<string[]>>();

export function buildPulseFrames(color: string): string[] {
  return Array.from({ length: FRAME_COUNT }, (_, frame) => {
    const radius = 6 + frame;
    const opacity = (0.45 * (1 - frame / (FRAME_COUNT - 1))).toFixed(2);

    return [
      '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">',
      `<circle cx="8" cy="8" r="${radius}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${opacity}" />`,
      `<circle cx="8" cy="8" r="3" fill="${color}" />`,
      "</svg>",
    ].join("");
  });
}

export function getPulseFrames(state: StatusPageState): Promise<string[]> {
  const cached = framesCache.get(state);
  if (cached) return cached;

  const frames = buildPulseFrames(STATE_HEX[state]);
  const images = Promise.all(
    frames.map((svg) => toImageDataUri(svg, environment.supportPath, environment.raycastVersion)),
  ).catch((error) => {
    framesCache.delete(state);
    throw error;
  });
  framesCache.set(state, images);
  return images;
}
