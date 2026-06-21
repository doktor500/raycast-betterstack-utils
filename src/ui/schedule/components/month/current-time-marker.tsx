import { MONTH } from "@/ui/schedule/components/month/constants";

interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const left = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH - 2;

  return (
    <div tw={`flex absolute left-[${left}px] top-[${MONTH.DAY_HEADER_HEIGHT}px] w-[4px] h-[${rowHeight - MONTH.DAY_HEADER_HEIGHT}px] bg-white opacity-[0.85] rounded-[2px]`} />
  );
}
