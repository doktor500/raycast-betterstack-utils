// src/ui/schedule/components/on-call-pill.tsx
import { getThemeColor, Colors } from "@/common/colors";

export const ON_CALL_PILL_CIRC_R = 16;

interface OnCallPillProps {
  name: string;
  color: string;
}

export function OnCallPill({ name, color }: OnCallPillProps) {
  const initial = name.charAt(0).toUpperCase();
  const diameter = ON_CALL_PILL_CIRC_R * 2;

  return (
    <div
      tw="flex items-center"
      style={{ height: diameter, paddingLeft: 12, paddingTop: 6, gap: 13 }}
    >
      <div
        tw="flex items-center justify-center"
        style={{
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: getThemeColor(color) }}>{initial}</span>
      </div>
      <span style={{ fontSize: 17, fontWeight: 500, color: Colors.WHITE }}>
        {`${name} is on-call`}
      </span>
    </div>
  );
}
