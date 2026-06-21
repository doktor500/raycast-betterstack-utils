import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

const TOTAL_WIDTH = 1160;
const DAY_WIDTH = TOTAL_WIDTH / 7;
const DAY_HEADER_HEIGHT = 30;
const ROW_TOP = 40;
const ROW_HEIGHT = 42;
const H_GAP = 3;

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${rowHeight}px]`}>
      {weekIndex > 0 && <div tw={`flex absolute top-0 left-0 w-[${TOTAL_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * DAY_WIDTH;
        return (
          <div key={dayIndex} tw="flex">
            <div tw={`flex absolute left-[${left}px] top-0 w-px h-[${rowHeight}px] bg-[${SKELETON_COLOR}]`} />
            <div
              tw={`flex absolute left-[${left}px] top-[${DAY_HEADER_HEIGHT}px] w-[${DAY_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`}
            />
            <div
              tw={`flex absolute left-[${left + DAY_WIDTH / 2 - 20}px] top-[5px] w-[39px] h-[15px] bg-[${SKELETON_COLOR}] rounded-[2px]`}
            />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * DAY_WIDTH + H_GAP;
        const barWidth = (end - start) * DAY_WIDTH - 2 * H_GAP;
        return (
          <div
            key={index}
            tw={`flex absolute left-[${barLeft}px] top-[${ROW_TOP}px] w-[${barWidth}px] h-[${ROW_HEIGHT}px] rounded-[6px] bg-[${SKELETON_COLOR}]`}
          />
        );
      })}
    </div>
  );
}
