import { useEffect, useState } from "react";
import { getPulseImage } from "@/ui/status-pages/status-icon";
import { StatusPageState } from "@/domain/status-page";

const ALL_STATES: StatusPageState[] = [
  StatusPageState.Operational,
  StatusPageState.Degraded,
  StatusPageState.Downtime,
  StatusPageState.Maintenance,
];

const LOADING_MARKDOWN = "Loading…";

export function useStatusPagePulseImage(): Record<StatusPageState, string> {
  const [markdown, setMarkdown] = useState<Record<StatusPageState, string>>({
    [StatusPageState.Operational]: LOADING_MARKDOWN,
    [StatusPageState.Degraded]: LOADING_MARKDOWN,
    [StatusPageState.Downtime]: LOADING_MARKDOWN,
    [StatusPageState.Maintenance]: LOADING_MARKDOWN,
  });

  useEffect(() => {
    ALL_STATES.forEach((state) => {
      void getPulseImage(state)
        .then((dataUri) => setMarkdown((current) => ({ ...current, [state]: `![pulse](${dataUri})` })))
        .catch(() => {});
    });
  }, []);

  return markdown;
}
