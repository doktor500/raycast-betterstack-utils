import React from "react";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { renderToSvg } from "@/components/satori-renderer";
import { rangeOf } from "@/common/utils/collection-utils";

const WEEK_SPANS = [{ start: 0, end: 7 }];

function ScheduleSkeletonRoot() {
  return (
    <div tw="flex flex-col w-[1160px]">
      <div tw="flex h-[32px]" />
      <div tw="flex flex-col relative w-[1160px] rounded-[10px] border border-skeleton">
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw="flex h-[44px]">
          <div tw="flex absolute left-[500px] top-[13px] w-[160px] h-[18px] bg-skeleton rounded-[4px]" />
        </div>
        <div tw="flex absolute top-[44px] left-0 w-[1160px] h-px bg-skeleton" />
        {rangeOf(5).map((weekIndex) => (
          <WeekRow key={weekIndex} weekIndex={weekIndex} spans={WEEK_SPANS} rowHeight={92} />
        ))}
      </div>
      <div tw="flex h-[12px]" />
      <div tw="flex relative w-[1160px] rounded-[10px] border border-skeleton">
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw="flex items-center w-[200px] pl-[24px]">
          <div tw="flex w-[90px] h-[14px] bg-skeleton rounded-[3px]" />
        </div>
        <div tw="flex w-px self-stretch bg-skeleton" />
        <div tw="flex flex-col justify-center flex-1 pt-[14px] pb-[14px]">
          {rangeOf(2).map((index) => (
            <div key={index} tw="flex items-center h-[36px] pl-[20px]">
              <div tw="flex flex-1 h-[12px] bg-skeleton rounded-[3px] mr-[24px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  return renderToSvg(<ScheduleSkeletonRoot />);
}
