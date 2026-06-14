// src/common/utils/font-loader.ts
import { environment } from "@raycast/api";
import { readFileSync } from "node:fs";
import path from "node:path";

interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

let cached: SatoriFont[] | null = null;

export function loadFonts(): SatoriFont[] {
  if (cached) return cached;

  const interBuffer = readFileSync(path.join(environment.assetsPath, "fonts", "Inter-Regular.ttf"));
  const monoBuffer = readFileSync(path.join(environment.assetsPath, "fonts", "JetBrainsMono-Regular.ttf"));

  const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  cached = [
    { name: "Inter", data: toArrayBuffer(interBuffer), weight: 400, style: "normal" },
    { name: "JetBrainsMono", data: toArrayBuffer(monoBuffer), weight: 400, style: "normal" },
  ];

  return cached;
}
