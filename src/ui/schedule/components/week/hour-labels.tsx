import { Colors } from "@/common/colors";

export function HourLabels() {
  return (
    <div tw="flex flex-col w-[25px]">
      <div tw="flex h-[44px]" />
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={`hl${i}`}
          tw={`flex items-center justify-end w-[23px] h-[20px] text-[10px] text-[${Colors.DIM}] font-mono`}
        >
          {i}
        </div>
      ))}
    </div>
  );
}
