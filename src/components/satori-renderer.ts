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
        },
      },
    },
  });
}
