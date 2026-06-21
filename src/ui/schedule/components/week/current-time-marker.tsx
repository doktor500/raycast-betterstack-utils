import { WEEK } from "@/ui/schedule/components/week/constants";

interface CurrentTimeMarkerProps {
  todayIndex: number;
  markerY: number;
}

export function CurrentTimeMarker({ todayIndex, markerY }: CurrentTimeMarkerProps) {
  const left = WEEK.SIDEBAR_WIDTH + todayIndex * WEEK.DAY_WIDTH + 4;

  return (
    <div tw={`flex absolute left-[${left}px] top-[${markerY - 2}px] w-[${WEEK.DAY_WIDTH - 6}px] h-[4px] bg-white opacity-[0.85] rounded-[2px]`} />
  );
}
