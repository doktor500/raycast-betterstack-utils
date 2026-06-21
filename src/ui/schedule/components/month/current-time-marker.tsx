interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const leftPercent = ((index + fraction) / 7) * 100;

  return (
    <div
      tw={`flex absolute left-[${leftPercent}%] top-[30px] w-[4px] h-[${rowHeight - 30}px] bg-white opacity-[0.85] rounded-[2px]`}
    />
  );
}
