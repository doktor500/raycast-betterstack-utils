import { useEffect, useState } from "react";
import { Icon, Image } from "@raycast/api";
import { getPulseRingIcon } from "@/ui/status-pages/status-icon";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { StatusPageState } from "@/domain/status-page";

const NON_OPERATIONAL_STATES: StatusPageState[] = [
  StatusPageState.Degraded,
  StatusPageState.Downtime,
  StatusPageState.Maintenance,
];

function fallbackIcon(state: StatusPageState): Image.ImageLike {
  return { source: Icon.CircleFilled, tintColor: STATE_COLOR[state] };
}

export function useStatusPageIcons(): Record<StatusPageState, Image.ImageLike> {
  const [icons, setIcons] = useState<Record<StatusPageState, Image.ImageLike>>({
    [StatusPageState.Operational]: fallbackIcon(StatusPageState.Operational),
    [StatusPageState.Degraded]: fallbackIcon(StatusPageState.Degraded),
    [StatusPageState.Downtime]: fallbackIcon(StatusPageState.Downtime),
    [StatusPageState.Maintenance]: fallbackIcon(StatusPageState.Maintenance),
  });

  useEffect(() => {
    NON_OPERATIONAL_STATES.forEach((state) => {
      void getPulseRingIcon(state).then((dataUri) => {
        setIcons((current) => ({ ...current, [state]: dataUri }));
      });
    });
  }, []);

  return icons;
}
