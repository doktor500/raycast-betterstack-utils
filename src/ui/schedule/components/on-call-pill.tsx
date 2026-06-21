import { getThemeColor } from "@/common/colors";

interface OnCallPillProps {
  name: string;
  color: string;
}

export function OnCallPill({ name, color }: OnCallPillProps) {
  const initial = name.charAt(0).toUpperCase();
  const themeColor = getThemeColor(color);

  return (
    <div tw="flex items-center h-[32px] pl-[12px] pt-[6px] gap-[13px]">
      <div tw={`flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[${color}]`}>
        <span tw={`text-[14px] font-bold text-[${themeColor}]`}>{initial}</span>
      </div>
      <span tw="text-[17px] font-medium text-white">{`${name} is on-call`}</span>
    </div>
  );
}
