import { environment } from "@raycast/api";
import { readFileSync } from "node:fs";
import path from "node:path";

export interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

let cachedFonts: SatoriFont[] | null = null;

export function loadFonts(): SatoriFont[] {
  if (cachedFonts) return cachedFonts;

  const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  const readFont = (filename: string): ArrayBuffer => {
    const fontPath = path.join(environment.assetsPath, "fonts", filename);
    try {
      return toArrayBuffer(readFileSync(fontPath));
    } catch {
      throw new Error(`Font file not found at ${fontPath}. Ensure ${filename} is present in assets/fonts/.`);
    }
  };

  cachedFonts = [
    { name: "Inter", data: readFont("Inter-Regular.ttf"), weight: 400, style: "normal" },
    { name: "JetBrainsMono", data: readFont("JetBrainsMono-Regular.ttf"), weight: 400, style: "normal" },
  ];

  return cachedFonts;
}
