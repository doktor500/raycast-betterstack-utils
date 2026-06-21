export function weekRowHeight(maxLanes: number): number {
  return 40 + maxLanes * 42 + Math.max(0, maxLanes - 1) * 4 + 10;
}

export function summaryBlockHeight(entryCount: number): number {
  return entryCount * 36 + 28;
}

export function formatMonthLabel(currentMonth: { year: number; month: number }): string {
  return new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
