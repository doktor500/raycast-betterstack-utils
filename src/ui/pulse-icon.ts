import { Color, environment } from "@raycast/api";
import { toImageDataUri } from "@/common/utils/svg-utils";
import { Appearance } from "@/common/colors";
import { rangeOf } from "@/common/utils/collection-utils";

const FRAME_COUNT = 2;

export function buildPulseFrames(color: string, size = 16): string[] {
  return rangeOf(FRAME_COUNT).map((frame) => {
    const radius = 6 + frame;
    const opacity = (0.45 * (1 - frame / (FRAME_COUNT - 1))).toFixed(2);

    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="${radius}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${opacity}" />
        <circle cx="8" cy="8" r="3" fill="${color}" />
      </svg>`;
  });
}

export function getPulseFrames(color: Color.Dynamic, appearance: Appearance, size?: number): Promise<string[]> {
  const hex = appearance === Appearance.LIGHT ? color.light : color.dark;
  const frames = buildPulseFrames(hex, size);

  return Promise.all(frames.map((svg) => toImageDataUri(svg, environment.supportPath, environment.raycastVersion)));
}
