// src/ui/schedule/satori-renderer.ts
import satori from "satori";
import type { ReactNode } from "react";
import { loadFonts } from "@/common/utils/font-loader";

export async function renderToSvg(element: ReactNode, width: number, height: number): Promise<string> {
  return satori(element, { width, height, fonts: loadFonts(), tailwindConfig: {} });
}
