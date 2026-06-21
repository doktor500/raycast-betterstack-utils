# Design: Remove dimension constants and height pre-computation

**Date:** 2026-06-21

## Problem

The codebase maintains a parallel accounting of layout dimensions in two places:

1. **JSX/Tailwind** — components declare their own sizes via `tw="h-[44px]"` etc.
2. **Pre-computation** — `computeTotalHeight`, `weekRowHeight`, `summaryBlockHeight` re-derive those same sizes in pure math so `renderToSvg` gets an explicit canvas height.

This duplication means every layout change must be applied twice and the two can drift silently.

Additionally, named constants (`BLOCK_HEADER_HEIGHT`, `ROW_HEIGHT`, `ON_CALL_PILL_CIRC_R`, etc.) add indirection with no reuse benefit — each is used in one file, often in a single formula.

## Goal

Delete all height pre-computation and all local dimension constants. Components size themselves; Satori measures the result.

## Architecture change

Satori 0.26 accepts `{ width: number }` without `height` and infers the canvas height from rendered content. `renderToSvg` drops its `height` parameter:

```ts
// src/components/satori-renderer.ts
export async function renderToSvg(element: ReactNode, width: number): Promise<string> {
  return satori(element, { width, fonts: loadFonts(), tailwindConfig: { ... } });
}
```

All call sites (`buildMonthViewSvg`, `buildScheduleSkeletonSvg`) stop computing and passing height.

## Deletions

### Functions deleted

| Function | File | Why safe to delete |
|---|---|---|
| `computeTotalHeight` | `month-schedule.tsx` | Satori auto-sizes |
| `summaryBlockHeight` | `month-utils.ts` | SummaryBlock sizes from flex-col children |
| `weekRowHeight` | `month-utils.ts` | Formula inlined at call site (still needed for SpanBar container sizing, but not as a named export) |

`month-utils.ts` retains only `formatMonthLabel`.

### Constants deleted

| Constant | Value | File | Replacement |
|---|---|---|---|
| `BLOCK_HEADER_HEIGHT` | 44 | `skeleton/schedule.tsx` | Deleted — skeleton restructured to flex-col |
| `SUMMARY_GAP` | 12 | `skeleton/schedule.tsx` | Deleted — gap becomes a spacer div in flex flow |
| `SUMMARY_MONTH_COL_WIDTH` | 200 | `skeleton/schedule.tsx` | Deleted — no longer used for positioning |
| `TOTAL_WIDTH` | 1160 | `skeleton/schedule.tsx`, `week-row.tsx` | Inlined as `w-[1160px]` in tw strings |
| `ON_CALL_PILL_CIRC_R` | 16 | `on-call-pill.tsx` | Hardcode `w-[32px] h-[32px]` in component |
| `ON_CALL_PILL_BANNER` | 32 | `month-schedule.tsx`, `skeleton/schedule.tsx` | Deleted — no longer needed for height calc |
| `ROW_TOP` | 40 | `span-bar.tsx`, `week-row.tsx` | Inlined: `40 + bar.lane * 46` |
| `ROW_HEIGHT` | 42 | `span-bar.tsx`, `week-row.tsx` | Inlined in formulas and tw strings |
| `BAR_GAP` | 4 | `span-bar.tsx` | Inlined (42+4 = 46 per lane) |
| `H_GAP` | 3 | `week-row.tsx` | Inlined |
| `H_GAP_FRACTION` | 3/1160 | `span-bar.tsx` | Inlined as `3 / 1160` |
| `DAY_HEADER_HEIGHT` | 30 | `day-column.tsx`, `current-time-marker.tsx`, `week-row.tsx` | Inlined as `top-[30px]` / `h-[30px]` |
| `DAY_WIDTH` | 1160/7 | `week-row.tsx` | Inlined as expression |

## Component prop changes

### `MonthBlock`

- **Remove** `blockHeight: number` prop. Container becomes `flex flex-col` with no explicit height; header + WeekGroups stack naturally.
- **Keep** `weekRowHeights: number[]` prop — each WeekGroup still needs its individual `rowHeight` for SpanBar containment. The array continues to flow from `month-schedule.tsx` through MonthBlock into each WeekGroup.

### `SummaryBlock`

- **Remove** explicit `h-[${height}px]` from the outer container. Height flows from content (header + rows).
- No prop changes; the `summaryBlockHeight()` call inside the component is simply deleted.

### `WeekGroup` / `DayColumn` / `CurrentTimeMarker`

- `rowHeight: number` prop **stays**. SpanBars are absolutely positioned inside WeekGroup; the container must declare an explicit height. The value is computed inline at the call site in `month-schedule.tsx`:
  ```ts
  const rowHeight = 40 + maxLanes * 42 + Math.max(0, maxLanes - 1) * 4 + 10;
  ```

### `OnCallPill`

- `ON_CALL_PILL_CIRC_R` export removed. Diameter hardcoded to `32` inside the component.

## Skeleton restructure

`skeleton/schedule.tsx` currently absolutely positions WeekRow instances at computed vertical offsets. With auto-sizing, this restructures to a flex column:

- Calendar block: `flex flex-col` — header div followed by WeekRows in document order
- Summary block: flex alignment for vertical centering (replaces `top-[${summaryHeight/2-5}px]`)
- Column divider: `self-stretch` or `flex-1` (replaces `h-[${summaryHeight - 32}px]`)
- `WeekRow` still receives `rowHeight` (hardcoded to `92` in the skeleton since it always uses 1 lane)

## What does NOT change

- `SKELETON_COLOR` — color value, not a dimension, stays in `skeleton-colors.ts`
- `Colors` / `RotaColors` — color constants, out of scope
- SpanBar percentage math — inherently dynamic, values inlined but logic unchanged
- `formatMonthLabel` — stays in `month-utils.ts`
- All business logic (`buildWeekSpanBars`, `computeOnCallSummary`, etc.)

## Files touched

- `src/components/satori-renderer.ts`
- `src/ui/schedule/components/month/month-schedule.tsx`
- `src/ui/schedule/components/month/month-utils.ts`
- `src/ui/schedule/components/month/month-block.tsx`
- `src/ui/schedule/components/month/summary-block.tsx`
- `src/ui/schedule/components/month/week-group.tsx`
- `src/ui/schedule/components/month/span-bar.tsx`
- `src/ui/schedule/components/month/day-column.tsx`
- `src/ui/schedule/components/month/current-time-marker.tsx`
- `src/ui/schedule/components/on-call-pill.tsx`
- `src/ui/schedule/components/week/week-row.tsx`
- `src/ui/schedule/skeleton/schedule.tsx`
