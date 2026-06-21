import { MONTH } from "@/ui/schedule/components/month/constants";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div style={{ display: "flex", position: "relative", width: MONTH.WIDTH, height: rowHeight }}>
      {weekIndex > 0 && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: MONTH.WIDTH,
            height: 1,
            backgroundColor: SKELETON_COLOR,
          }}
        />
      )}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * MONTH.DAY_WIDTH;
        return (
          <div key={dayIndex} style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
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
                display: "flex",
                position: "absolute",
                left,
                top: MONTH.DAY_HEADER_HEIGHT,
                width: MONTH.DAY_WIDTH,
                height: 1,
                backgroundColor: SKELETON_COLOR,
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: left + MONTH.DAY_WIDTH / 2 - 20,
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
        const barLeft = start * MONTH.DAY_WIDTH + MONTH.H_GAP;
        const barWidth = (end - start) * MONTH.DAY_WIDTH - 2 * MONTH.H_GAP;
        return (
          <div
            key={index}
            style={{
              display: "flex",
              position: "absolute",
              left: barLeft,
              top: MONTH.ROW_TOP,
              width: barWidth,
              height: MONTH.ROW_HEIGHT,
              borderRadius: 6,
              backgroundColor: SKELETON_COLOR,
            }}
          />
        );
      })}
    </div>
  );
}
