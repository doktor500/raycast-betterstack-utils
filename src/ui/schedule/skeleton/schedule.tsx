import React from "react";
import { LAYOUT, SUMMARY, weekRowHeight, summaryBlockHeight } from "@/ui/layout";
import { ON_CALL_PILL_CIRC_R } from "@/ui/schedule/components/on-call-pill";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

const NUM_WEEKS = 5;
const NUM_SUMMARY = 3;

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

function ScheduleSkeletonRoot() {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = LAYOUT.BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);

  return (
    <div tw="flex flex-col" style={{ display: "flex", flexDirection: "column", width: LAYOUT.WIDTH }}>
      <div style={{ height: ON_CALL_PILL_BANNER }} />
      <div style={{ display: "flex", position: "relative", width: LAYOUT.WIDTH, height: calendarHeight, borderRadius: 10, border: `1px solid ${SKELETON_COLOR}` }}>
        <div style={{ display: "flex", position: "absolute", inset: 0, borderRadius: 10, backgroundColor: "rgba(40,53,78,0.2)" }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: LAYOUT.WIDTH / 2 - 80,
            top: 13,
            width: 160,
            height: 18,
            backgroundColor: SKELETON_COLOR,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: LAYOUT.BLOCK_HEADER_HEIGHT,
            left: 0,
            width: LAYOUT.WIDTH,
            height: 1,
            backgroundColor: SKELETON_COLOR,
          }}
        />
        {Array.from({ length: NUM_WEEKS }, (_, weekIndex) => (
          <div
            key={weekIndex}
            style={{
              display: "flex",
              position: "absolute",
              top: LAYOUT.BLOCK_HEADER_HEIGHT + weekIndex * rowHeight,
              left: 0,
            }}
          >
            <WeekRow weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={rowHeight} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", height: LAYOUT.SUMMARY_GAP }} />
      <div style={{ display: "flex", position: "relative", width: LAYOUT.WIDTH, height: summaryHeight, borderRadius: 10, border: `1px solid ${SKELETON_COLOR}` }}>
        <div style={{ display: "flex", position: "absolute", inset: 0, borderRadius: 10, backgroundColor: "rgba(40,53,78,0.2)" }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 24,
            top: summaryHeight / 2 - 5,
            width: 90,
            height: 14,
            backgroundColor: SKELETON_COLOR,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: SUMMARY.MONTH_COL_WIDTH,
            top: 16,
            width: 1,
            height: summaryHeight - 32,
            backgroundColor: SKELETON_COLOR,
          }}
        />
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = LAYOUT.BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);
  const totalHeight = ON_CALL_PILL_BANNER + calendarHeight + LAYOUT.SUMMARY_GAP + summaryHeight;
  return renderToSvg(<ScheduleSkeletonRoot />, LAYOUT.WIDTH, totalHeight);
}
