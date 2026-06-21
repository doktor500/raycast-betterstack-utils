import { summaryBlockHeight, formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
import { Colors } from "@/common/colors";
import { OnCallSummary } from "@/domain/on-call-summary";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: OnCallSummary[];
}

function formatDaysHours(totalHours: number): string {
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days}d`;
  return `${hours}h`;
}

export function SummaryBlock({ year, month, summary }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonthLabel({ year, month });
  const height = summaryBlockHeight(summary.length);

  return (
    <div tw={`flex w-[1160px] h-[${height}px] rounded-[10px] border border-[${Colors.SLATE}] bg-[${Colors.DARK}] overflow-hidden`}>
      <div tw={`flex items-center w-[200px] pl-[24px] border-r border-[${Colors.SLATE}]`}>
        <span tw={`text-[18px] font-bold text-[${Colors.FROST}]`}>{monthLabel}</span>
      </div>
      <div tw={`flex flex-col justify-center flex-1 pt-[14px] pb-[14px]`}>
        {summary.map(({ teamMember, email, hours, color }, index) => (
          <div key={index} tw={`flex items-center h-[36px] pl-[20px]`}>
            <div tw={`flex w-[12px] h-[12px] rounded-full bg-[${color}] mr-[10px]`} />
            <span tw={`flex-1 text-[17px] font-semibold text-[${Colors.SUBTLE}]`}>
              {`${teamMember} - ${email}`}
            </span>
            <span tw={`text-[15px] text-[${Colors.DIM}] pr-[24px]`}>
              {formatDaysHours(hours)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
