import { Colors } from "../../../../common/colors";
import { MONO_FONT_FAMILY } from "../../../../common/fonts";
import { WEEK } from "./constants";

export function HourLabels({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <text
          key={`hl${hourIndex}`}
          x={WEEK.SIDEBAR_WIDTH - 4}
          y={gridTop + hourIndex * WEEK.HOUR_HEIGHT + WEEK.HOUR_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={10}
          fill={Colors.DIM}
          fontFamily={MONO_FONT_FAMILY}
        >
          {hourIndex}
        </text>
      ))}
    </>
  );
}
