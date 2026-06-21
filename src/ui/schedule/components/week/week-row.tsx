import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { rangeOf } from "@/common/utils/collection-utils";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div tw={`flex relative w-[1160px] h-[${rowHeight}px]`}>
      {weekIndex > 0 && <div tw={`flex absolute top-0 left-0 w-[1160px] h-px bg-[${SKELETON_COLOR}]`} />}
      {rangeOf(7).map((dayIndex) => {
        const left = dayIndex * (1160 / 7);
        return (
          <div key={dayIndex} tw="flex">
            <div tw={`flex absolute left-[${left}px] top-0 w-px h-[${rowHeight}px] bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left}px] top-[30px] w-[${1160 / 7}px] h-px bg-[${SKELETON_COLOR}]`} />
            <div
              tw={`flex absolute left-[${left + 1160 / 7 / 2 - 20}px] top-[5px] w-[39px] h-[15px] bg-[${SKELETON_COLOR}] rounded-[2px]`}
            />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * (1160 / 7) + 3;
        const barWidth = (end - start) * (1160 / 7) - 6;
        return (
          <div
            key={index}
            tw={`flex absolute left-[${barLeft}px] top-[40px] w-[${barWidth}px] h-[42px] rounded-[6px] bg-[${SKELETON_COLOR}]`}
          />
        );
      })}
    </div>
  );
}
