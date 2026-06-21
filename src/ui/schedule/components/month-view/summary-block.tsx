import { cn } from "@/lib/utils";
import { formatMonth } from "@/common/utils/date-utils";
import { OnCallSummary } from "@/domain/on-call-summary";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: OnCallSummary[];
  bg?: string;
}

function formatDaysHours(totalHours: number): string {
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days}d`;
  return `${hours}h`;
}

export function SummaryBlock({ year, month, summary, bg = "bg-dark" }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonth({ year, month });
  const [monthName, yearLabel] = monthLabel.split(" ");

  return (
    <div tw={cn("flex w-[1160px] rounded-[10px] border border-slate overflow-hidden", bg)}>
      <div tw="flex flex-1 items-start justify-center pt-[14px] pb-[14px]">
        <div tw="flex flex-col justify-center self-center w-[166px] border-r border-slate">
          <span tw="text-[18px] font-bold text-frost" style={{ alignSelf: "center" }}>
            {monthName}
          </span>
          <div tw="flex h-[6px]" />
          <span tw="text-[18px] font-bold text-frost" style={{ alignSelf: "center" }}>
            {yearLabel}
          </span>
        </div>
        <div tw="flex flex-col">
          {summary.map(({ teamMember, email, color }, index) => (
            <div key={index} tw="flex items-center h-[36px] pl-[20px]">
              <div tw={`flex w-[12px] h-[12px] rounded-full bg-[${color}] mr-[10px]`} />
              <span tw="text-[18px] font-semibold text-subtle">{`${teamMember} - ${email}`}</span>
            </div>
          ))}
        </div>
        <div tw="flex flex-col w-[80px]">
          {summary.map(({ hours }, index) => (
            <div key={index} tw="flex items-center justify-end h-[36px] pr-[24px]">
              <span tw="text-[18px] font-semibold text-subtle">{formatDaysHours(hours)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
