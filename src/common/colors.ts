export const RotaColors = {
  GREEN: "#16C77A",
  RED: "#FF5E7A",
  BLUE: "#21A7FF",
  PURPLE: "#D36BFF",
  ORANGE: "#FF8738",
  INDIGO: "#7F88FF",
  YELLOW: "#E7B84A",
};

export const Colors = {
  DEEP_DARK: "#0B0C15",
  DARK: "#1F2433",
  SLATE: "#2D374C",
  DIM: "#718096",
  SUBTLE: "#AEB8D3",
  FROST: "#F3F5FA",
  WHITE: "#FFFFFF",
};

const ROTA_SVG_PALETTE = [
  RotaColors.GREEN,
  RotaColors.RED,
  RotaColors.BLUE,
  RotaColors.PURPLE,
  RotaColors.ORANGE,
  RotaColors.INDIGO,
  RotaColors.YELLOW,
];

export function buildColorMap(names: string[]): Map<string, string> {
  return new Map(names.map((name, index) => [name, ROTA_SVG_PALETTE[index % ROTA_SVG_PALETTE.length]]));
}

export function getThemeColor(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.179 ? Colors.DARK : Colors.WHITE;
}

function relativeLuminance(hex: string): number {
  const r = linearize(parseInt(hex.slice(1, 3), 16) / 255);
  const g = linearize(parseInt(hex.slice(3, 5), 16) / 255);
  const b = linearize(parseInt(hex.slice(5, 7), 16) / 255);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
