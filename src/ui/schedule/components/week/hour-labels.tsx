import { Colors } from "@/common/colors";
import { rangeOf } from "@/common/utils/collection-utils";

export function HourLabels() {
  return (
    <div tw="flex flex-col w-[25px]">
      <div tw="flex h-[44px]" />
      {rangeOf(24).map((hourIndex) => (
        <div
          key={`hl${hourIndex}`}
          tw={`flex items-center justify-end w-[23px] h-[20px] text-[10px] text-[${Colors.DIM}] font-mono`}
        >
          {hourIndex}
        </div>
      ))}
    </div>
  );
}
