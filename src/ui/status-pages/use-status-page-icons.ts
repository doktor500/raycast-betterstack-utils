import { useEffect, useState } from "react";
import { Icon, Image, environment } from "@raycast/api";
import { getPulseFrames } from "@/ui/status-pages/status-icon";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { StatusPageState } from "@/domain/status-page";

const ALL_STATES: StatusPageState[] = [
  StatusPageState.OPERATIONAL,
  StatusPageState.DEGRADED,
  StatusPageState.DOWNTIME,
  StatusPageState.MAINTENANCE,
];

const FRAME_INTERVAL_MS = 500;

function fallbackIcon(state: StatusPageState): Image.ImageLike {
  return { source: Icon.CircleFilled, tintColor: STATE_COLOR[state] };
}

export function useStatusPageIcons(): Record<StatusPageState, Image.ImageLike> {
  const [frames, setFrames] = useState<Partial<Record<StatusPageState, string[]>>>({});
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    ALL_STATES.forEach((state) => {
      void getPulseFrames(state, environment.appearance)
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
    [StatusPageState.OPERATIONAL]: iconFor(StatusPageState.OPERATIONAL),
    [StatusPageState.DEGRADED]: iconFor(StatusPageState.DEGRADED),
    [StatusPageState.DOWNTIME]: iconFor(StatusPageState.DOWNTIME),
    [StatusPageState.MAINTENANCE]: iconFor(StatusPageState.MAINTENANCE),
  };
}
