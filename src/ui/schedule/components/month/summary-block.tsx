import { SUMMARY, summaryBlockHeight, formatDaysHours, formatMonthLabel } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";
import { OnCallSummary } from "@/domain/on-call-summary";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: OnCallSummary[];
}

export function SummaryBlock({ year, month, summary }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonthLabel({ year, month });
  const height = summaryBlockHeight(summary.length);

  return (
    <div
      tw="flex"
      style={{
        display: "flex",
        width: MONTH.WIDTH,
        height,
        borderRadius: 10,
        border: `1px solid ${Colors.SLATE}`,
        backgroundColor: Colors.DARK,
        overflow: "hidden",
      }}
    >
      <div
        tw="flex items-center"
        style={{
          display: "flex",
          alignItems: "center",
          width: SUMMARY.MONTH_COL_WIDTH,
          paddingLeft: 24,
          borderRight: `1px solid ${Colors.SLATE}`,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: Colors.FROST, fontFamily: "Inter" }}>
          {monthLabel}
        </span>
      </div>
      <div
        tw="flex flex-col justify-center"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          paddingTop: SUMMARY.VERTICAL_PADDING,
          paddingBottom: SUMMARY.VERTICAL_PADDING,
        }}
      >
        {summary.map(({ teamMember, email, hours, color }, index) => (
          <div
            key={index}
            tw="flex items-center"
            style={{ display: "flex", alignItems: "center", height: SUMMARY.VERTICAL_ROW_HEIGHT, paddingLeft: 20 }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color,
                marginRight: 10,
              }}
            />
            <span
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: Colors.SUBTLE,
                flex: 1,
                fontFamily: "Inter",
              }}
            >
              {`${teamMember} - ${email}`}
            </span>
            <span style={{ fontSize: 15, color: Colors.DIM, paddingRight: 24, fontFamily: "Inter" }}>
              {formatDaysHours(hours)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
