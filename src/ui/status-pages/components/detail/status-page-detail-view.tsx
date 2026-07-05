import { environment } from "@raycast/api";
import { Appearance, getSchedulePalette } from "@/common/colors";
import { capitalize } from "@/common/utils/string-utils";
import { StatusPage } from "@/domain/status-page";
import { StatusPageSectionGroup } from "@/domain/status-page-resource";
import { renderToSvg } from "@/ui/svg-renderer";
import { STATE_COLOR } from "@/ui/status-pages/status-colors";
import { SectionBlock } from "@/ui/status-pages/components/detail/section-block";

interface StatusPageDetailViewProps {
  statusPage: StatusPage;
  sections: StatusPageSectionGroup[];
}

export async function buildStatusPageDetailSvg(props: StatusPageDetailViewProps): Promise<string> {
  return renderToSvg(<StatusPageDetailView {...props} />);
}

function StatusPageDetailView({ statusPage, sections }: StatusPageDetailViewProps) {
  const appearance: Appearance = environment.appearance;
  const palette = getSchedulePalette(appearance);
  const badgeColor = STATE_COLOR[statusPage.state][appearance];

  return (
    <div tw="flex flex-col bg-dark w-[1160px] p-[24px]" style={{ gap: "32px" }}>
      <div tw="flex items-center justify-between w-[1112px]">
        <span tw={`text-[24px] font-bold text-[${palette.heading}]`}>{statusPage.name}</span>
        <span tw={`text-[16px] font-semibold text-[${badgeColor}]`}>{capitalize(statusPage.state)}</span>
      </div>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} appearance={appearance} />
      ))}
    </div>
  );
}
