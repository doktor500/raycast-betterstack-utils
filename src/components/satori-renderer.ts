import satori from "satori";
import type { ReactNode } from "react";
import { loadFonts } from "@/common/utils/font-loader";

export async function renderToSvg(element: ReactNode, width: number): Promise<string> {
  return satori(element, {
    width,
    fonts: loadFonts(),
    tailwindConfig: {
      theme: {
        extend: {
          fontFamily: {
            mono: "JetBrainsMono",
          },
          colors: {
            "deep-dark": "#0B0C15",
            "dark": "#1F2433",
            "slate": "#2D374C",
            "dim": "#718096",
            "subtle": "#AEB8D3",
            "frost": "#F3F5FA",
            "skeleton": "#28354E",
            "rota-blue": "#21A7FF",
            "rota-green": "#16C77A",
            "rota-indigo": "#7F88FF",
            "rota-orange": "#FF8738",
            "rota-purple": "#D36BFF",
            "rota-red": "#FF5E7A",
            "rota-yellow": "#E7B84A",
          },
        },
      },
    },
  });
}
