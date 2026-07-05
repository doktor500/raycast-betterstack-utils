import { environment } from "@raycast/api";
import { toImageDataUri } from "@/common/utils/svg-utils";
import { Appearance } from "@/common/colors";
import { StatusPageState } from "@/domain/status-page";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { rangeOf } from "@/common/utils/collection-utils";

const FRAME_COUNT = 2;

export function buildPulseFrames(color: string): string[] {
  return rangeOf(FRAME_COUNT).map((frame) => {
    const radius = 6 + frame;
    const opacity = (0.5 * (1 - frame / (FRAME_COUNT - 1))).toFixed(2);

    return `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="${radius}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${opacity}" />
        <circle cx="8" cy="8" r="3" fill="${color}" />
      </svg>`;
  });
}

export function getPulseFrames(state: StatusPageState, appearance: Appearance): Promise<string[]> {
  const color = appearance === Appearance.LIGHT ? STATE_COLOR[state].light : STATE_COLOR[state].dark;
  const frames = buildPulseFrames(color);

  return Promise.all(frames.map((svg) => toImageDataUri(svg, environment.supportPath, environment.raycastVersion)));
}
