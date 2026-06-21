# Schedule Layout Tailwind Refactor

**Date:** 2026-06-21  
**Scope:** `src/ui/schedule/components/week/` and `src/ui/schedule/components/month/`  
**Goal:** Delete both `constants.ts` files. Replace pixel-coordinate constants with flex layout and inline Tailwind arbitrary values.

---

## Problem

Both constants files define dimensional values (widths, heights, gaps) that are interpolated into `tw={...}` strings as pixel coordinates. This creates fragile arithmetic spread across components and a single point of breakage when layout changes.

---

## Approach: Flex Columns + Percentage Absolute Positioning

Use CSS flex to make day columns self-sizing, eliminating the need to compute `DAY_WIDTH`. For time-based positions inside a day (events, current-time marker), use percentage-based absolute positioning relative to a container with a defined height. Fixed design dimensions (header heights, row heights) become inline Tailwind arbitrary values.

---

## Week View

### Layout structure

```
WeekViewRoot  (flex row, w=[1160px])
├── Sidebar                   (flex col, w-[25px])
│   └── 24 × HourLabel cell   (h-[20px] each)
└── 7 × DayColumn             (flex-1, flex col, relative)
    ├── DayHeader              (h-[44px])
    └── DayTimeline            (relative, h-[480px])
        ├── 24 × HourRow       (h-[20px], border-bottom for grid line)
        ├── EventSegment(s)    (absolute, top/height by %)
        └── CurrentTimeMarker  (absolute, top by %)
```

### Constants eliminated

| Old constant | Replacement |
|---|---|
| `WEEK.DAY_WIDTH` | `flex-1` on each `DayColumn` |
| `WEEK.SIDEBAR_WIDTH` | `w-[25px]` inline |
| `WEEK.HEADER_HEIGHT` | `h-[44px]` inline |
| `WEEK.HOUR_HEIGHT` | `h-[20px]` inline per hour row |
| `WEEK.HOURS` | `Array.from({ length: 24 }, ...)` inline |
| `WEEK.TIMELINE_HEIGHT` | container is `h-[480px]`; events use `top: ${fraction * 100}%` |
| `WEEK.TOTAL_HEIGHT` | auto-computed by flex children |
| `WEEK.MIN_EVENT_HEIGHT` | `Math.max(12, ...)` inlined in `event-segment.tsx` |
| `WEEK.LABEL_MIN_HEIGHT` | `height >= 24` inlined in `event-segment.tsx` |
| `WEEK.FONT` | already unused / inline from `@/common/fonts` |

### Component changes

- **`HourGridLines`** — deleted. Hour dividers become bottom borders on each `HourRow` cell inside each `DayColumn`.
- **`HourLabels`** — renders 24 × `h-[20px]` flex cells in the sidebar. No `top` calculation needed.
- **`DayColumn`** — becomes a `flex-1` flex column. Header and timeline are stacked children. Vertical separator is a `border-left` on the column, not a separate absolute div.
- **`WeekEvents` / `EventSegment`** — events rendered inside their `DayColumn`'s `DayTimeline`. `colLeft` parameter removed. `top` and `height` expressed as percentages of the `h-[480px]` container.
- **`CurrentTimeMarker`** — rendered inside the today `DayColumn`'s `DayTimeline`. `top` as percentage; no `todayIndex`-based left offset needed.
- **`WeekViewRoot`** — passes `onCallUser` banner as before; `gridTop`/`headerTop`/`totalHeight` props removed from children since layout is self-computed.

### `renderToSvg` call

```ts
renderToSvg(<WeekViewRoot {...props} />, 1160, totalHeight)
```

`totalHeight` is still computed as `bannerHeight + 44 + 480` (inlined arithmetic, no constant).

---

## Month View

### Layout structure

```
MonthScheduleRoot  (flex col, w=[1160px])
├── OnCallPill (optional)
└── per month:
    ├── MonthBlock          (flex col, w-[1160px])
    │   ├── MonthHeader     (h-[44px])
    │   └── per week:
    │       └── WeekGroup   (relative flex row, dynamic height)
    │           ├── 7 × DayCell  (flex-1)
    │           │   └── DayHeader (h-[30px])
    │           └── SpanBar(s)   (absolute, left/width by %)
    ├── gap div             (h-[12px])
    └── SummaryBlock
```

### Constants eliminated

| Old constant | Replacement |
|---|---|
| `MONTH.DAY_WIDTH` | `flex-1` on each `DayCell`; bars use `left: X%`, `width: Y%` |
| `MONTH.WIDTH` | `w-[1160px]` inline; hardcoded `1160` in `renderToSvg` call |
| `MONTH.BLOCK_HEADER_HEIGHT` | `h-[44px]` inline in `MonthBlock` |
| `MONTH.DAY_HEADER_HEIGHT` | `h-[30px]` inline in `DayCell` |
| `MONTH.BLOCK_GAP` | `h-[40px]` divider inline in `month-schedule.tsx` |
| `MONTH.SUMMARY_GAP` | `h-[12px]` divider inline |
| `MONTH.ROW_BOTTOM_PAD` | `pb-[10px]` inline on `WeekGroup` |
| `MONTH.H_GAP` | `3` inlined in `span-bar.tsx` (only consumer) |
| `MONTH.DAY_MS` | `24 * 3600 * 1000` inlined in `span-bars.ts` |
| `SUMMARY.MONTH_COL_WIDTH` | `w-[200px]` inline in `summary-block.tsx` |
| `SUMMARY.VERTICAL_ROW_HEIGHT` | `h-[36px]` inline in `summary-block.tsx` |
| `SUMMARY.VERTICAL_PADDING` | `py-[14px]` inline in `summary-block.tsx` |

### Span bar percentage positioning

`MONTH.DAY_WIDTH` is eliminated from `span-bar.tsx`. Positions become:

```ts
const startPercent = (bar.startDayIndex + bar.startFraction) / 7 * 100;
const endPercent   = (bar.endDayIndex   + bar.endFraction)   / 7 * 100;
const barLeft      = startPercent + (3 / (1160 / 7)) * 100;  // H_GAP as % of row
const barWidth     = Math.max(endPercent - startPercent - 2 * (3 / (1160 / 7)) * 100, 0.2);
```

Or more simply: keep `H_GAP: 3` as a plain inline `const H_GAP = 3` local to `span-bar.tsx` — no shared constant needed since it's only used here.

### Lane-stacking values remain

`ROW_TOP (40)`, `ROW_HEIGHT (42)`, `BAR_GAP (4)` cannot be derived from layout. They become local inline `const` values in `span-bar.tsx` and `week-group.tsx`:

```ts
const ROW_TOP = 40;
const ROW_HEIGHT = 42;
const BAR_GAP = 4;
```

### Helper functions

`weekRowHeight` and `summaryBlockHeight` remain in `month/constants.ts` initially but their bodies reference inline numbers. Once migration is complete, these functions move to the component files that call them and `constants.ts` is deleted.

---

## Files to delete

- `src/ui/schedule/components/week/constants.ts`
- `src/ui/schedule/components/week/hour-grid-lines.tsx`
- `src/ui/schedule/components/month/constants.ts`

---

## Files to create / heavily modify

| File | Change |
|---|---|
| `week/week-schedule.tsx` | Remove constant imports; inline `1160`, `44`, `480` |
| `week/day-column.tsx` | Becomes flex-1 col with header + timeline children |
| `week/hour-labels.tsx` | 24 × h-[20px] cells, no top calculation |
| `week/week-events.tsx` | Remove colLeft/colWidth; events render inside DayColumn |
| `week/event-segment.tsx` | percentage top/height, no WEEK constants |
| `week/current-time-marker.tsx` | percentage top, rendered inside DayColumn |
| `month/month-schedule.tsx` | Inline gaps; remove MONTH.WIDTH/BLOCK_GAP |
| `month/month-block.tsx` | Inline BLOCK_HEADER_HEIGHT |
| `month/week-group.tsx` | flex row with 7 flex-1 day cells |
| `month/day-column.tsx` | flex-1 day cell, inline DAY_HEADER_HEIGHT |
| `month/span-bar.tsx` | Percentage left/width; local ROW_TOP/ROW_HEIGHT/BAR_GAP consts |
| `month/current-time-marker.tsx` | Percentage positioning |
| `month/summary-block.tsx` | Inline SUMMARY constants |
| `month/span-bars.ts` | Inline DAY_MS |

---

## Risk

Satori's absolute positioning with percentage values requires the parent to have an explicit height. The week `DayTimeline` is `h-[480px]`, satisfying this. The month `WeekGroup` has a dynamically computed height passed as a prop — this must remain an explicit `h-[Npx]` value for percentage bar positioning to work.
