import React from "react";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

function ScheduleSkeletonRoot() {
  return (
    <div tw="flex flex-col w-[1160px]">
      <div tw="flex h-[32px]" />
      <div tw={`flex flex-col relative w-[1160px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw="flex h-[44px]">
          <div tw={`flex absolute left-[500px] top-[13px] w-[160px] h-[18px] bg-[${SKELETON_COLOR}] rounded-[4px]`} />
        </div>
        <div tw={`flex absolute top-[44px] left-0 w-[1160px] h-px bg-[${SKELETON_COLOR}]`} />
        {Array.from({ length: 5 }, (_, weekIndex) => (
          <WeekRow key={weekIndex} weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={92} />
        ))}
      </div>
      <div tw="flex h-[12px]" />
      <div tw={`flex w-[1160px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw={`flex items-center w-[200px] pl-[24px]`}>
          <div tw={`flex w-[90px] h-[14px] bg-[${SKELETON_COLOR}] rounded-[3px]`} />
        </div>
        <div tw={`flex w-px self-stretch bg-[${SKELETON_COLOR}]`} />
        <div tw="flex flex-col justify-center flex-1 pt-[14px] pb-[14px]">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} tw={`flex items-center h-[36px] pl-[20px]`}>
              <div tw={`flex flex-1 h-[12px] bg-[${SKELETON_COLOR}] rounded-[3px] mr-[24px]`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  return renderToSvg(<ScheduleSkeletonRoot />, 1160);
}
