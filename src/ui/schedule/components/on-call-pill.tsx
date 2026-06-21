import { getThemeColor } from "@/common/colors";

export const ON_CALL_PILL_CIRC_R = 16;

interface OnCallPillProps {
  name: string;
  color: string;
}

export function OnCallPill({ name, color }: OnCallPillProps) {
  const initial = name.charAt(0).toUpperCase();
  const diameter = ON_CALL_PILL_CIRC_R * 2;
  const themeColor = getThemeColor(color);

  return (
    <div tw={`flex items-center h-[${diameter}px] pl-[12px] pt-[6px] gap-[13px]`}>
      <div tw={`flex items-center justify-center w-[${diameter}px] h-[${diameter}px] rounded-full bg-[${color}]`}>
        <span tw={`text-[14px] font-bold text-[${themeColor}]`}>{initial}</span>
      </div>
      <span tw="text-[17px] font-medium text-white">{`${name} is on-call`}</span>
    </div>
  );
}
