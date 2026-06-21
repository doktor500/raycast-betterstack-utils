import { MONTH } from "@/ui/schedule/components/month/constants";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div tw={`flex relative w-[${MONTH.WIDTH}px] h-[${rowHeight}px]`}>
      {weekIndex > 0 && (
        <div tw={`flex absolute top-0 left-0 w-[${MONTH.WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />
      )}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * MONTH.DAY_WIDTH;
        return (
          <div key={dayIndex} tw="flex">
            <div tw={`flex absolute left-[${left}px] top-0 w-px h-[${rowHeight}px] bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left}px] top-[${MONTH.DAY_HEADER_HEIGHT}px] w-[${MONTH.DAY_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left + MONTH.DAY_WIDTH / 2 - 20}px] top-[5px] w-[39px] h-[15px] bg-[${SKELETON_COLOR}] rounded-[2px]`} />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * MONTH.DAY_WIDTH + MONTH.H_GAP;
        const barWidth = (end - start) * MONTH.DAY_WIDTH - 2 * MONTH.H_GAP;
        return (
          <div key={index} tw={`flex absolute left-[${barLeft}px] top-[${MONTH.ROW_TOP}px] w-[${barWidth}px] h-[${MONTH.ROW_HEIGHT}px] rounded-[6px] bg-[${SKELETON_COLOR}]`} />
        );
      })}
    </div>
  );
}
