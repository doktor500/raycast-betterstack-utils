interface CurrentTimeMarkerProps {
  fraction: number;
}

export function CurrentTimeMarker({ fraction }: CurrentTimeMarkerProps) {
  const topPercent = fraction * 100;

  return (
    <div tw={`flex absolute left-[4px] right-[4px] top-[${topPercent}%] h-[4px] bg-white opacity-[0.85] rounded-[2px]`} />
  );
}
