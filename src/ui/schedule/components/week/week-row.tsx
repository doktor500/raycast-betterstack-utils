import { LAYOUT } from "@/ui/layout";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div style={{ position: "relative", width: LAYOUT.WIDTH, height: rowHeight }}>
      {weekIndex > 0 && (
        <div style={{ position: "absolute", top: 0, left: 0, width: LAYOUT.WIDTH, height: 1, backgroundColor: SKELETON_COLOR }} />
      )}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * LAYOUT.DAY_WIDTH;
        return (
          <div key={dayIndex}>
            <div
              style={{
                position: "absolute",
                left,
                top: 0,
                width: 1,
                height: rowHeight,
                backgroundColor: SKELETON_COLOR,
              }}
            />
            <div
              style={{
                position: "absolute",
                left,
                top: LAYOUT.DAY_HEADER_HEIGHT,
                width: LAYOUT.DAY_WIDTH,
                height: 1,
                backgroundColor: SKELETON_COLOR,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: left + LAYOUT.DAY_WIDTH / 2 - 20,
                top: 5,
                width: 39,
                height: 15,
                backgroundColor: SKELETON_COLOR,
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * LAYOUT.DAY_WIDTH + LAYOUT.H_GAP;
        const barWidth = (end - start) * LAYOUT.DAY_WIDTH - 2 * LAYOUT.H_GAP;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: barLeft,
              top: LAYOUT.ROW_TOP,
              width: barWidth,
              height: LAYOUT.ROW_HEIGHT,
              borderRadius: 6,
              backgroundColor: SKELETON_COLOR,
            }}
          />
        );
      })}
    </div>
  );
}
