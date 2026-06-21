import React from "react";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const ON_CALL_PILL_BANNER = 32;

const NUM_WEEKS = 5;
const NUM_SUMMARY = 3;
const BLOCK_HEADER_HEIGHT = 44;
const SUMMARY_GAP = 12;
const SUMMARY_MONTH_COL_WIDTH = 200;
const TOTAL_WIDTH = 1160;

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

const rowHeight = 92;
const calendarHeight = BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
const summaryHeight = NUM_SUMMARY * 36 + 28;

function ScheduleSkeletonRoot() {
  return (
    <div tw={`flex flex-col w-[${TOTAL_WIDTH}px]`}>
      <div tw={`flex h-[${ON_CALL_PILL_BANNER}px]`} />
      <div
        tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${calendarHeight}px] rounded-[10px] border border-[${SKELETON_COLOR}]`}
      >
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div
          tw={`flex absolute left-[${TOTAL_WIDTH / 2 - 80}px] top-[13px] w-[160px] h-[18px] bg-[${SKELETON_COLOR}] rounded-[4px]`}
        />
        <div
          tw={`flex absolute top-[${BLOCK_HEADER_HEIGHT}px] left-0 w-[${TOTAL_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`}
        />
        {Array.from({ length: NUM_WEEKS }, (_, weekIndex) => (
          <div key={weekIndex} tw={`flex absolute top-[${BLOCK_HEADER_HEIGHT + weekIndex * rowHeight}px] left-0`}>
            <WeekRow weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={rowHeight} />
          </div>
        ))}
      </div>
      <div tw={`flex h-[${SUMMARY_GAP}px]`} />
      <div
        tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${summaryHeight}px] rounded-[10px] border border-[${SKELETON_COLOR}]`}
      >
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div
          tw={`flex absolute left-[24px] top-[${summaryHeight / 2 - 5}px] w-[90px] h-[14px] bg-[${SKELETON_COLOR}] rounded-[3px]`}
        />
        <div
          tw={`flex absolute left-[${SUMMARY_MONTH_COL_WIDTH}px] top-[16px] w-px h-[${summaryHeight - 32}px] bg-[${SKELETON_COLOR}]`}
        />
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  return renderToSvg(<ScheduleSkeletonRoot />, TOTAL_WIDTH);
}
