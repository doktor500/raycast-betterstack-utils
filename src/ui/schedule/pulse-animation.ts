import { Colors, getThemeColor } from "@/common/colors";
import { Optional } from "@/common/utils/optional-utils";

const PULSABLE_SIZES = [32, 24];

export function pulseAnimation(svg: string): string {
  for (const match of svg.matchAll(/<path ([^>]*?)\s*\/>/g)) {
    const attrs = match[1];
    const width = getAttr(attrs, "width");
    const height = getAttr(attrs, "height");
    const size = PULSABLE_SIZES.find((candidate) => width === `${candidate}` && height === `${candidate}`);

    if (size !== undefined) {
      const x = parseFloat(getAttr(attrs, "x") ?? "0");
      const y = parseFloat(getAttr(attrs, "y") ?? "0");
      const fill = getAttr(attrs, "fill") ?? Colors.WHITE;
      const textColor = getThemeColor(fill);
      const half = size / 2;
      const cx = x + half;
      const cy = y + half;

      const pulseRing =
        `<circle cx="${cx}" cy="${cy}" r="${half}" fill="none" stroke="${fill}" stroke-width="3">` +
        `<animate attributeName="r" values="${half};${half + 12}" dur="1.5s" repeatCount="indefinite" />` +
        `<animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />` +
        `</circle>`;

      const pulseRingBorder =
        `<circle cx="${cx}" cy="${cy}" r="${half + 2}" fill="none" stroke="${textColor}" stroke-width="1">` +
        `<animate attributeName="r" values="${half + 2};${half + 14}" dur="1.5s" repeatCount="indefinite" />` +
        `<animate attributeName="opacity" values="0.5;0" dur="1.5s" repeatCount="indefinite" />` +
        `</circle>`;

      const borderedAvatar = `<path ${attrs} stroke="${textColor}" stroke-width="1" stroke-opacity="0.5" />`;

      return (
        svg.slice(0, match.index) +
        pulseRing +
        pulseRingBorder +
        borderedAvatar +
        svg.slice(match.index + match[0].length)
      );
    }
  }

  return svg;
}

function getAttr(attrs: string, name: string): Optional<string> {
  const match = attrs.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match?.at(1);
}
