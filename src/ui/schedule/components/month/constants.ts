export const MONTH = {
  WIDTH: 1160,
  BLOCK_GAP: 40,
  BLOCK_HEADER_HEIGHT: 44,
  DAY_WIDTH: 1160 / 7,
  DAY_HEADER_HEIGHT: 30,
  ROW_TOP: 40,
  ROW_HEIGHT: 42,
  BAR_GAP: 4,
  ROW_BOTTOM_PAD: 10,
  H_GAP: 3,
  DAY_MS: 24 * 3600 * 1000,
  SUMMARY_GAP: 12,
} as const;

export const SUMMARY = {
  MONTH_COL_WIDTH: 200,
  VERTICAL_ROW_HEIGHT: 36,
  VERTICAL_PADDING: 14,
} as const;

export function weekRowHeight(maxLanes: number): number {
  return MONTH.ROW_TOP + maxLanes * MONTH.ROW_HEIGHT + Math.max(0, maxLanes - 1) * MONTH.BAR_GAP + MONTH.ROW_BOTTOM_PAD;
}

export function summaryBlockHeight(entryCount: number): number {
  return entryCount * SUMMARY.VERTICAL_ROW_HEIGHT + SUMMARY.VERTICAL_PADDING * 2;
}

export function formatMonthLabel(currentMonth: { year: number; month: number }): string {
  return new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
