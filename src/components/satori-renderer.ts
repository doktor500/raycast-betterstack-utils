import satori from "satori";
import type { ReactNode } from "react";
import { loadFonts } from "@/common/utils/font-loader";
import { Colors, RotaColors } from "@/common/colors";

const VIEWPORT_WIDTH = 1160;

export async function renderToSvg(element: ReactNode): Promise<string> {
  return satori(element, {
    width: VIEWPORT_WIDTH,
    fonts: loadFonts(),
    tailwindConfig: {
      theme: {
        extend: {
          fontFamily: {
            mono: "JetBrainsMono",
          },
          colors: {
            "deep-dark": Colors.DEEP_DARK,
            "dark": Colors.DARK,
            "slate": Colors.SLATE,
            "dim": Colors.DIM,
            "subtle": Colors.SUBTLE,
            "frost": Colors.FROST,
            "skeleton": Colors.SKELETON,
            "rota-blue": RotaColors.BLUE,
            "rota-green": RotaColors.GREEN,
            "rota-indigo": RotaColors.INDIGO,
            "rota-orange": RotaColors.ORANGE,
            "rota-purple": RotaColors.PURPLE,
            "rota-red": RotaColors.RED,
            "rota-yellow": RotaColors.YELLOW,
          },
        },
      },
    },
  });
}
