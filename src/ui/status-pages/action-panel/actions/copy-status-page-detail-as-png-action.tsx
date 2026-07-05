import { Action, Icon } from "@raycast/api";

type CopyStatusPageDetailAsPngActionProps = {
  onCopyAsPng: () => void;
};

export function CopyStatusPageDetailAsPngAction({ onCopyAsPng }: CopyStatusPageDetailAsPngActionProps) {
  return <Action title="Copy as PNG" icon={Icon.Image} onAction={onCopyAsPng} />;
}
