interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

const DAY_HEADER_HEIGHT = 30;

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const leftPercent = ((index + fraction) / 7) * 100;

  return (
    <div
      tw={`flex absolute left-[${leftPercent}%] top-[${DAY_HEADER_HEIGHT}px] w-[4px] h-[${rowHeight - DAY_HEADER_HEIGHT}px] bg-white opacity-[0.85] rounded-[2px]`}
    />
  );
}
