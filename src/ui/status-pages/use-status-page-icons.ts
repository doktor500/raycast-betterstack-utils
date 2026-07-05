import { useEffect, useState } from "react";
import { Icon, Image } from "@raycast/api";
import { getPulseFrames } from "@/ui/status-pages/status-icon";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { StatusPageState } from "@/domain/status-page";

const NON_OPERATIONAL_STATES: StatusPageState[] = [
  StatusPageState.Degraded,
  StatusPageState.Downtime,
  StatusPageState.Maintenance,
];

const FRAME_INTERVAL_MS = 250;

function fallbackIcon(state: StatusPageState): Image.ImageLike {
  return { source: Icon.CircleFilled, tintColor: STATE_COLOR[state] };
}

export function useStatusPageIcons(): Record<StatusPageState, Image.ImageLike> {
  const [frames, setFrames] = useState<Partial<Record<StatusPageState, string[]>>>({});
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    NON_OPERATIONAL_STATES.forEach((state) => {
      void getPulseFrames(state)
        .then((images) => setFrames((current) => ({ ...current, [state]: images })))
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setFrameIndex((index) => index + 1), FRAME_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const iconFor = (state: StatusPageState): Image.ImageLike => {
    const stateFrames = frames[state];
    return stateFrames ? stateFrames[frameIndex % stateFrames.length] : fallbackIcon(state);
  };

  return {
    [StatusPageState.Operational]: fallbackIcon(StatusPageState.Operational),
    [StatusPageState.Degraded]: iconFor(StatusPageState.Degraded),
    [StatusPageState.Downtime]: iconFor(StatusPageState.Downtime),
    [StatusPageState.Maintenance]: iconFor(StatusPageState.Maintenance),
  };
}
