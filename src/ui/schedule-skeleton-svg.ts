import { LAYOUT, SUMMARY, weekRowHeight, summaryBlockHeight } from "./layout";

export function buildScheduleSkeletonSvg(): string {
  const NUM_WEEKS = 5;
  const NUM_SUMMARY = 3;
  const rowH = weekRowHeight(1);
  const calHeight = LAYOUT.BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowH;
  const summHeight = summaryBlockHeight(NUM_SUMMARY);
  const totalHeight = calHeight + LAYOUT.SUMMARY_GAP + summHeight;

  const weekBarSpans = [
    [{ start: 0, end: 7 }],
    [{ start: 0, end: 4 }, { start: 4, end: 7 }],
    [{ start: 0, end: 7 }],
    [{ start: 0, end: 2 }, { start: 2, end: 7 }],
    [{ start: 0, end: 7 }],
  ];

  const weekRows = Array.from({ length: NUM_WEEKS }, (_, wi) => {
    const offsetY = LAYOUT.BLOCK_HEADER_HEIGHT + wi * rowH;
    const divider =
      wi > 0 ? `<line x1="0" y1="${offsetY}" x2="${LAYOUT.WIDTH}" y2="${offsetY}" stroke="#303A50"/>` : "";

    const dayColumns = Array.from({ length: 7 }, (_, di) => {
      const x = di * LAYOUT.DAY_WIDTH;
      const center = x + LAYOUT.DAY_WIDTH / 2;
      return `<line x1="${x}" y1="${offsetY}" x2="${x}" y2="${offsetY + rowH}" stroke="#2A3449"/>
    <line x1="${x}" y1="${offsetY + LAYOUT.DAY_HEADER_HEIGHT}" x2="${x + LAYOUT.DAY_WIDTH}" y2="${offsetY + LAYOUT.DAY_HEADER_HEIGHT}" stroke="#2D374C"/>
    <rect x="${center - 24}" y="${offsetY + 7}" width="20" height="11" fill="#252B3A" rx="2"/>
    <rect x="${center - 1}" y="${offsetY + 5}" width="16" height="15" fill="#2A3044" rx="2"/>`;
    }).join("\n    ");

    const bars = weekBarSpans[wi]
      .map(({ start, end }) => {
        const barX = start * LAYOUT.DAY_WIDTH + LAYOUT.H_GAP;
        const barWidth = (end - start) * LAYOUT.DAY_WIDTH - 2 * LAYOUT.H_GAP;
        const barY = offsetY + LAYOUT.ROW_TOP;
        return `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${LAYOUT.ROW_HEIGHT}" rx="6" fill="#28354E"/>`;
      })
      .join("\n    ");

    return `${divider}\n    ${dayColumns}\n    ${bars}`;
  }).join("\n  ");

  const summOffsetY = calHeight + LAYOUT.SUMMARY_GAP;
  const summMidY = summHeight / 2;
  const cellWidth = (LAYOUT.WIDTH - SUMMARY.MONTH_COL_WIDTH) / NUM_SUMMARY;
  const summaryItems = Array.from({ length: NUM_SUMMARY }, (_, i) => {
    const cx = SUMMARY.MONTH_COL_WIDTH + i * cellWidth + 20;
    const tx = cx + 14 + 10;
    return `<circle cx="${cx}" cy="${summMidY - 10}" r="7" fill="#252B3A"/>
    <rect x="${tx}" y="${summMidY - 19}" width="70" height="13" fill="#252B3A" rx="3"/>
    <rect x="${tx}" y="${summMidY + 4}" width="44" height="11" fill="#1E2433" rx="3"/>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LAYOUT.WIDTH}" height="${totalHeight}" viewBox="0 0 ${LAYOUT.WIDTH} ${totalHeight}">
  <rect width="${LAYOUT.WIDTH}" height="${calHeight}" rx="10" fill="#1F2433" fill-opacity="0.2"/>
  <rect x="0.5" y="0.5" width="${LAYOUT.WIDTH - 1}" height="${calHeight - 1}" rx="10" fill="none" stroke="#303A50"/>
  <rect x="${LAYOUT.WIDTH / 2 - 80}" y="13" width="160" height="18" fill="#252B3A" rx="4"/>
  <line x1="0" y1="${LAYOUT.BLOCK_HEADER_HEIGHT}" x2="${LAYOUT.WIDTH}" y2="${LAYOUT.BLOCK_HEADER_HEIGHT}" stroke="#303A50"/>
  ${weekRows}
  <g transform="translate(0, ${summOffsetY})">
    <rect width="${LAYOUT.WIDTH}" height="${summHeight}" rx="10" fill="#1F2433" fill-opacity="0.2"/>
    <rect x="0.5" y="0.5" width="${LAYOUT.WIDTH - 1}" height="${summHeight - 1}" rx="10" fill="none" stroke="#303A50"/>
    <rect x="24" y="${summMidY - 5}" width="90" height="14" fill="#252B3A" rx="3"/>
    <line x1="${SUMMARY.MONTH_COL_WIDTH}" y1="16" x2="${SUMMARY.MONTH_COL_WIDTH}" y2="${summHeight - 16}" stroke="#303A50"/>
    ${summaryItems}
  </g>
</svg>`;
}