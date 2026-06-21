# Tailwind Auto-Size Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all dimension constants and height pre-computation by switching to Satori's width-only auto-sizing mode, letting Satori infer the SVG canvas height from rendered content.

**Architecture:** Satori 0.26 accepts `{ width: number }` without `height` and measures content automatically. Components that currently receive an explicit height prop (`MonthBlock`, `SummaryBlock`) drop that prop and let flex layout size them. Components that need explicit height for absolute-positioned children (`WeekGroup`, `WeekRow`) keep a `rowHeight` prop whose value is inlined at the call site rather than computed by a named function.

**Tech Stack:** TypeScript, React (JSX for Satori), Satori 0.26, Tailwind (via Satori's `tw=` prop), Raycast extension build (`ray build`)

## Global Constraints

- Tailwind classes are passed via Satori's `tw=` prop, not browser CSS — all class values are valid Tailwind arbitrary syntax (e.g. `w-[1160px]`, `top-[30px]`)
- Dynamic values are interpolated: `tw={`h-[${rowHeight}px]`}` — this is correct and expected
- No test framework exists — verification is TypeScript compilation: `npx tsc --noEmit`
- Final build check: `npm run build`
- The spec: `docs/superpowers/specs/2026-06-21-tailwind-autosize-migration-design.md`

---

## File Map

| File | Change |
|---|---|
| `src/components/satori-renderer.ts` | Remove `height` parameter |
| `src/ui/schedule/components/month/month-schedule.tsx` | Remove `computeTotalHeight`, `calendarHeight` lambda, `blockHeight` prop pass, simplify `buildMonthViewSvg` |
| `src/ui/schedule/components/month/month-utils.ts` | Delete `weekRowHeight` and `summaryBlockHeight`; keep only `formatMonthLabel` |
| `src/ui/schedule/components/month/month-block.tsx` | Remove `blockHeight` prop and explicit height from container |
| `src/ui/schedule/components/month/summary-block.tsx` | Remove `summaryBlockHeight` call and explicit height from container |
| `src/ui/schedule/components/month/span-bar.tsx` | Inline `H_GAP_FRACTION`, `ROW_TOP`, `ROW_HEIGHT`, `BAR_GAP` |
| `src/ui/schedule/components/month/day-column.tsx` | Inline `DAY_HEADER_HEIGHT` |
| `src/ui/schedule/components/month/current-time-marker.tsx` | Inline `DAY_HEADER_HEIGHT` |
| `src/ui/schedule/components/on-call-pill.tsx` | Remove `ON_CALL_PILL_CIRC_R` export; hardcode `32` |
| `src/ui/schedule/components/week/week-row.tsx` | Inline `TOTAL_WIDTH`, `DAY_WIDTH`, `DAY_HEADER_HEIGHT`, `ROW_TOP`, `ROW_HEIGHT`, `H_GAP` |
| `src/ui/schedule/skeleton/schedule.tsx` | Delete all constants and height calculations; restructure to flex-col with auto-sizing |

---

### Task 1: Inline constants in `span-bar.tsx`

**Files:**
- Modify: `src/ui/schedule/components/month/span-bar.tsx`

**Interfaces:**
- Consumes: `WeekSpanBar` (unchanged)
- Produces: `SpanBar` component (unchanged interface)

- [ ] **Step 1: Replace the file content**

The four module-level constants (`H_GAP_FRACTION`, `ROW_TOP`, `ROW_HEIGHT`, `BAR_GAP`) are inlined into the formulas. `barTop` merges `ROW_HEIGHT + BAR_GAP = 46` per lane. The `h-[${ROW_HEIGHT}px]` in the `tw` string becomes `h-[42px]`.

```tsx
import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { truncateLabel } from "@/common/utils/string-utils";
import { getThemeColor } from "@/common/colors";

interface SpanBarProps {
  bar: WeekSpanBar;
}

export function SpanBar({ bar }: SpanBarProps) {
  const startFrac = (bar.startDayIndex + bar.startFraction) / 7;
  const endFrac = (bar.endDayIndex + bar.endFraction) / 7;
  const barLeft = (startFrac + 3 / 1160) * 100;
  const barWidth = Math.max((endFrac - startFrac - 2 * (3 / 1160)) * 100, 0.2);
  const barTop = 40 + bar.lane * 46;
  const themeColor = getThemeColor(bar.color);
  const approxBarPx = barWidth * 11.6;
  const textAvailWidth = approxBarPx - 22;
  const borderRadius = Math.min(6, Math.floor(approxBarPx / 3));
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, 16) : "";

  return (
    <div
      tw={`flex items-center absolute left-[${barLeft}%] top-[${barTop}px] w-[${barWidth}%] h-[42px] bg-[${bar.color}] rounded-[${borderRadius}px] shadow-[0_2px_4px_rgba(11,12,21,0.3)] overflow-hidden`}
    >
      {label && <span tw={`pl-[12px] text-[16px] font-semibold text-[${themeColor}] whitespace-nowrap`}>{label}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/month/span-bar.tsx
git commit -m "refactor: inline span-bar dimension constants"
```

---

### Task 2: Inline `DAY_HEADER_HEIGHT` in `day-column.tsx` and `current-time-marker.tsx`

**Files:**
- Modify: `src/ui/schedule/components/month/day-column.tsx`
- Modify: `src/ui/schedule/components/month/current-time-marker.tsx`

**Interfaces:**
- Both components: props unchanged

- [ ] **Step 1: Update `day-column.tsx`**

Remove the `DAY_HEADER_HEIGHT = 30` constant and inline `30` directly in the two `tw` strings that reference it.

```tsx
import { formatWeekday } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";

const WEEKEND_STRIPES_TW =
  "repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(45,55,76,0.5)_3px,rgba(45,55,76,0.5)_4px)";

interface DayColumnProps {
  day: Date;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;
  const weekendOpacity = inMonth ? 1 : 0.3;

  return (
    <div tw={`flex flex-col flex-1 relative h-[${rowHeight}px]`}>
      {columnBg !== "none" && <div tw={`flex absolute inset-0 bg-[${columnBg}]`} />}
      {isWeekend && <div tw={`flex absolute inset-0 bg-[${WEEKEND_STRIPES_TW}] opacity-[${weekendOpacity}]`} />}
      {inMonth && (
        <>
          <div tw={`flex absolute left-0 top-0 w-px h-[${rowHeight}px] bg-[${Colors.SLATE}]`} />
          <div tw={`flex absolute left-0 top-[30px] right-0 h-px bg-[${Colors.SLATE}]`} />
          <div tw={`flex items-center justify-center w-full h-[30px]`}>
            <span tw={`text-[14px] font-semibold text-[${Colors.DIM}]`}>{formatWeekday(day)}</span>
            <div tw="flex w-[8px]" />
            <span tw={`text-[14px] font-semibold text-[${Colors.SUBTLE}]`}>{day.getDate()}</span>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `current-time-marker.tsx`**

Remove `DAY_HEADER_HEIGHT = 30` and inline `30` in the `tw` string.

```tsx
interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const leftPercent = ((index + fraction) / 7) * 100;

  return (
    <div
      tw={`flex absolute left-[${leftPercent}%] top-[30px] w-[4px] h-[${rowHeight - 30}px] bg-white opacity-[0.85] rounded-[2px]`}
    />
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/month/day-column.tsx src/ui/schedule/components/month/current-time-marker.tsx
git commit -m "refactor: inline DAY_HEADER_HEIGHT constant"
```

---

### Task 3: Inline constants in `week-row.tsx`

**Files:**
- Modify: `src/ui/schedule/components/week/week-row.tsx`

**Interfaces:**
- `WeekRowProps`: unchanged

- [ ] **Step 1: Replace the file content**

Remove `TOTAL_WIDTH`, `DAY_WIDTH`, `DAY_HEADER_HEIGHT`, `ROW_TOP`, `ROW_HEIGHT`, `H_GAP`. Inline all values: `1160` for total width, `1160 / 7` for day width (computed inline each time), `30` for day header height, `40` for row top, `42` for row height, `3` for horizontal gap.

```tsx
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div tw={`flex relative w-[1160px] h-[${rowHeight}px]`}>
      {weekIndex > 0 && <div tw={`flex absolute top-0 left-0 w-[1160px] h-px bg-[${SKELETON_COLOR}]`} />}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * (1160 / 7);
        return (
          <div key={dayIndex} tw="flex">
            <div tw={`flex absolute left-[${left}px] top-0 w-px h-[${rowHeight}px] bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left}px] top-[30px] w-[${1160 / 7}px] h-px bg-[${SKELETON_COLOR}]`} />
            <div
              tw={`flex absolute left-[${left + 1160 / 7 / 2 - 20}px] top-[5px] w-[39px] h-[15px] bg-[${SKELETON_COLOR}] rounded-[2px]`}
            />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * (1160 / 7) + 3;
        const barWidth = (end - start) * (1160 / 7) - 6;
        return (
          <div
            key={index}
            tw={`flex absolute left-[${barLeft}px] top-[40px] w-[${barWidth}px] h-[42px] rounded-[6px] bg-[${SKELETON_COLOR}]`}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/week/week-row.tsx
git commit -m "refactor: inline week-row dimension constants"
```

---

### Task 4: Remove `ON_CALL_PILL_CIRC_R` export

**Files:**
- Modify: `src/ui/schedule/components/on-call-pill.tsx`
- Modify: `src/ui/schedule/components/month/month-schedule.tsx`
- Modify: `src/ui/schedule/skeleton/schedule.tsx`

**Interfaces:**
- `OnCallPill`: props unchanged; `ON_CALL_PILL_CIRC_R` no longer exported

- [ ] **Step 1: Update `on-call-pill.tsx`**

Remove the exported constant. Hardcode the diameter `32` directly in the `tw` strings.

```tsx
import { getThemeColor } from "@/common/colors";

interface OnCallPillProps {
  name: string;
  color: string;
}

export function OnCallPill({ name, color }: OnCallPillProps) {
  const initial = name.charAt(0).toUpperCase();
  const themeColor = getThemeColor(color);

  return (
    <div tw="flex items-center h-[32px] pl-[12px] pt-[6px] gap-[13px]">
      <div tw={`flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[${color}]`}>
        <span tw={`text-[14px] font-bold text-[${themeColor}]`}>{initial}</span>
      </div>
      <span tw="text-[17px] font-medium text-white">{`${name} is on-call`}</span>
    </div>
  );
}
```

- [ ] **Step 2: Update `month-schedule.tsx`**

Remove the `ON_CALL_PILL_CIRC_R` import and replace `ON_CALL_PILL_BANNER` with a `topBannerHeight` constant using the literal `32`.

Find and replace these lines at the top of the file:

```ts
// Remove this import (keep OnCallPill import):
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";

// Remove this derived constant:
const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;
```

Replace with:

```ts
import { OnCallPill } from "@/ui/schedule/components/on-call-pill";
```

In `buildMonthViewSvg`, change:

```ts
// Before:
const topBannerHeight = props.onCallUser ? ON_CALL_PILL_BANNER : 0;

// After:
const topBannerHeight = props.onCallUser ? 32 : 0;
```

- [ ] **Step 3: Update `skeleton/schedule.tsx`**

Remove the `ON_CALL_PILL_CIRC_R` import and replace the derived `ON_CALL_PILL_BANNER` constant with the literal value.

```ts
// Remove this import entirely:
import { ON_CALL_PILL_CIRC_R } from "@/ui/schedule/components/on-call-pill";

// Replace:
const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;
// With:
const ON_CALL_PILL_BANNER = 32;
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/ui/schedule/components/on-call-pill.tsx \
        src/ui/schedule/components/month/month-schedule.tsx \
        src/ui/schedule/skeleton/schedule.tsx
git commit -m "refactor: remove ON_CALL_PILL_CIRC_R export, inline diameter 32"
```

---

### Task 5: Drop height pre-computation — delete compute functions, update `renderToSvg`, clean up component props

This task makes the biggest structural changes. All five files must be updated together before the build passes.

**Files:**
- Modify: `src/components/satori-renderer.ts`
- Modify: `src/ui/schedule/components/month/month-schedule.tsx`
- Modify: `src/ui/schedule/components/month/month-utils.ts`
- Modify: `src/ui/schedule/components/month/month-block.tsx`
- Modify: `src/ui/schedule/components/month/summary-block.tsx`

**Interfaces:**
- `renderToSvg(element, width)` — height parameter removed
- `MonthBlockProps` — `blockHeight: number` removed
- `SummaryBlock` — no prop change; internal height computation removed

- [ ] **Step 1: Update `satori-renderer.ts`**

Remove the `height` parameter from the function signature and from the `satori()` call.

```ts
import satori from "satori";
import type { ReactNode } from "react";
import { loadFonts } from "@/common/utils/font-loader";

export async function renderToSvg(element: ReactNode, width: number): Promise<string> {
  return satori(element, {
    width,
    fonts: loadFonts(),
    tailwindConfig: {
      theme: {
        extend: {
          fontFamily: {
            mono: "JetBrainsMono",
          },
        },
      },
    },
  });
}
```

- [ ] **Step 2: Trim `month-utils.ts` to only `formatMonthLabel`**

Delete `weekRowHeight` and `summaryBlockHeight`. The file becomes:

```ts
export function formatMonthLabel(currentMonth: { year: number; month: number }): string {
  return new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
```

- [ ] **Step 3: Update `month-block.tsx` — remove `blockHeight` prop**

Remove `blockHeight` from the interface and from the container's `tw` string. The container becomes `flex flex-col` without an explicit height; Satori sizes it from its children (44px header + sum of WeekGroup heights).

```tsx
import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
import { Colors } from "@/common/colors";
import { WeekGroup } from "@/ui/schedule/components/month/week-group";

interface MonthBlockProps {
  weeks: Date[][];
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  today,
  weekTimelines,
  currentMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonthLabel(currentMonth);

  return (
    <div tw={`flex flex-col relative w-[1160px] border border-[${Colors.SLATE}] overflow-hidden`}>
      <div tw={`flex items-center justify-center h-[44px] border-b border-[${Colors.SLATE}]`}>
        <span tw={`text-[17px] font-bold text-[${Colors.FROST}]`}>{monthLabel}</span>
      </div>
      {weeks.map((days, localIndex) => (
        <WeekGroup
          key={localIndex}
          days={days}
          weekTimeline={weekTimelines[localIndex]}
          today={today}
          weekIndex={localIndex}
          currentMonth={currentMonth}
          showTodayMarker={showTodayMarker}
          columnBg={columnBg}
          rowHeight={weekRowHeights[localIndex]}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Update `summary-block.tsx` — remove explicit height**

Remove the `summaryBlockHeight` import and call. Remove `h-[${height}px]` from the outer container. Satori sizes it from the flex-col children (14px top pad + N×36px rows + 14px bottom pad + border).

```tsx
import { formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
import { Colors } from "@/common/colors";
import { OnCallSummary } from "@/domain/on-call-summary";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: OnCallSummary[];
}

function formatDaysHours(totalHours: number): string {
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days}d`;
  return `${hours}h`;
}

export function SummaryBlock({ year, month, summary }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonthLabel({ year, month });

  return (
    <div tw={`flex w-[1160px] rounded-[10px] border border-[${Colors.SLATE}] bg-[${Colors.DARK}] overflow-hidden`}>
      <div tw={`flex items-center w-[200px] pl-[24px] border-r border-[${Colors.SLATE}]`}>
        <span tw={`text-[18px] font-bold text-[${Colors.FROST}]`}>{monthLabel}</span>
      </div>
      <div tw={`flex flex-col justify-center flex-1 pt-[14px] pb-[14px]`}>
        {summary.map(({ teamMember, email, hours, color }, index) => (
          <div key={index} tw={`flex items-center h-[36px] pl-[20px]`}>
            <div tw={`flex w-[12px] h-[12px] rounded-full bg-[${color}] mr-[10px]`} />
            <span tw={`flex-1 text-[17px] font-semibold text-[${Colors.SUBTLE}]`}>{`${teamMember} - ${email}`}</span>
            <span tw={`text-[15px] text-[${Colors.DIM}] pr-[24px]`}>{formatDaysHours(hours)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update `month-schedule.tsx`**

Three changes:
1. Remove the `weekRowHeight` import from `month-utils`
2. Inline the `weekRowHeight` formula where `weekRowHeightsByMonth` is built
3. Delete `computeTotalHeight` and the `calendarHeight` lambda in `CombinedScheduleRoot`
4. Stop passing `blockHeight` to `MonthBlock`
5. Simplify `buildMonthViewSvg` to pass only width

The complete new file:

```tsx
import React, { Fragment } from "react";
import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { buildWeekSpanBars } from "@/ui/schedule/components/month/span-bars";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month/summary-block";
import { OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";
import { renderToSvg } from "@/components/satori-renderer";

type Props = {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
};

function buildMonthData(events: OnCallEvent[], window: TimeWindow) {
  const { start, end } = window;
  const firstWeekStart = startOfWeek(start);
  const lastWeekStart = startOfWeek(end);
  const allWeeks: Date[][] = [];

  for (let weekStart = firstWeekStart; weekStart <= lastWeekStart; weekStart = addDays(weekStart, 7)) {
    allWeeks.push(Array.from({ length: 7 }, (_, dayOffset) => addDays(weekStart, dayOffset)));
  }

  const monthsSeen = new Set<string>();
  const monthList: Array<{ year: number; month: number }> = [];

  for (const week of allWeeks) {
    for (const day of week) {
      if (day >= start && day <= end) {
        const key = `${day.getFullYear()}-${day.getMonth()}`;
        if (!monthsSeen.has(key)) {
          monthsSeen.add(key);
          monthList.push({ year: day.getFullYear(), month: day.getMonth() });
        }
      }
    }
  }

  const monthGroups = monthList.map(({ year, month }) => {
    const weeks = allWeeks.filter((week) => week.some((d) => d.getFullYear() === year && d.getMonth() === month));
    return { year, month, weeks };
  });

  const weekTimelinesByMonth = monthGroups.map(({ year, month, weeks }) =>
    weeks.map((days) => buildWeekSpanBars(days, events, { year, month })),
  );

  const weekRowHeightsByMonth = weekTimelinesByMonth.map((weekTimelines) =>
    weekTimelines.map((timeline) => {
      const maxLanes = Math.max(1, ...timeline.map((bar) => bar.lane + 1));
      return 40 + maxLanes * 42 + Math.max(0, maxLanes - 1) * 4 + 10;
    }),
  );

  const summaries = monthGroups.map(({ year, month }) => computeOnCallSummary({ year, month, events }));

  return { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries };
}

function CombinedScheduleRoot({ events, window, onCallUser }: Props) {
  const today = new Date();
  const showTodayMarker = !!onCallUser;
  const backgroundColor = onCallUser ? "transparent" : Colors.DARK;
  const columnBg = onCallUser ? Colors.DARK : "none";

  const { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries } = buildMonthData(events, window);

  return (
    <div tw={`flex flex-col w-[1160px] bg-[${backgroundColor}]`}>
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
          />
          <div tw="flex h-[12px]" />
          <SummaryBlock year={year} month={month} summary={summaries[monthIndex]} />
          {monthIndex < monthGroups.length - 1 && (
            <>
              <div tw="flex h-[20px]" />
              <div tw={`flex w-[1160px] h-[2px] bg-[${Colors.SLATE}]`} />
              <div tw="flex h-[20px]" />
            </>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export async function buildMonthViewSvg(props: Props): Promise<string> {
  return renderToSvg(<CombinedScheduleRoot {...props} />, 1160);
}
```

- [ ] **Step 6: Fix `skeleton/schedule.tsx` imports** (compilation bridge)

`skeleton/schedule.tsx` still imports `weekRowHeight` and `summaryBlockHeight` which were just deleted. Inline their hardcoded results so the build passes. Task 6 will rewrite this file entirely.

Replace the two imports and their usages at the top of `skeleton/schedule.tsx`:

```ts
// Remove this import:
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/month-utils";

// Also remove this import (no longer needed after Task 4):
// import { ON_CALL_PILL_CIRC_R } from "@/ui/schedule/components/on-call-pill";

// Replace the three derived constants with hardcoded values:
// const rowHeight = weekRowHeight(1);          → const rowHeight = 92;
// const calendarHeight = ...                   → const calendarHeight = 44 + 5 * 92;
// const summaryHeight = summaryBlockHeight(3); → const summaryHeight = 136;
```

The skeleton top-of-file section becomes:

```ts
import React from "react";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const ON_CALL_PILL_BANNER = 32;

const NUM_WEEKS = 5;
const NUM_SUMMARY = 3;
const BLOCK_HEADER_HEIGHT = 44;
const SUMMARY_GAP = 12;
const SUMMARY_MONTH_COL_WIDTH = 200;
const TOTAL_WIDTH = 1160;

const rowHeight = 92;
const calendarHeight = BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
const summaryHeight = NUM_SUMMARY * 36 + 28;
```

The rest of `skeleton/schedule.tsx` is unchanged — just the import section and constant declarations at the top change.

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/satori-renderer.ts \
        src/ui/schedule/components/month/month-schedule.tsx \
        src/ui/schedule/components/month/month-utils.ts \
        src/ui/schedule/components/month/month-block.tsx \
        src/ui/schedule/components/month/summary-block.tsx \
        src/ui/schedule/skeleton/schedule.tsx
git commit -m "refactor: drop height pre-computation, switch to Satori auto-sizing"
```

---

### Task 6: Restructure skeleton to flex-col

The skeleton currently absolutely positions WeekRows at computed vertical offsets inside a container with explicit height. This task restructures it to flex-col so Satori auto-sizes both blocks. All dimension constants (`BLOCK_HEADER_HEIGHT`, `SUMMARY_GAP`, `SUMMARY_MONTH_COL_WIDTH`, `TOTAL_WIDTH`, `ON_CALL_PILL_BANNER`) and all height variables (`rowHeight`, `calendarHeight`, `summaryHeight`, `totalHeight`) are deleted.

**Files:**
- Modify: `src/ui/schedule/skeleton/schedule.tsx`

**Interfaces:**
- `buildScheduleSkeletonSvg()` — return type unchanged

- [ ] **Step 1: Replace `skeleton/schedule.tsx`**

Key structural changes:
- Calendar block becomes `flex flex-col relative` — no explicit height. A 44px spacer div replaces the header. The separator line at `top-[44px]` is still absolute but relative to the outer container. WeekRows flow in document order (no longer absolute).
- Summary block becomes a flex row — left column uses `items-center` for vertical centering, divider uses `self-stretch` instead of explicit height.
- `buildScheduleSkeletonSvg` passes only width `1160` to `renderToSvg`.

```tsx
import React from "react";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

function ScheduleSkeletonRoot() {
  return (
    <div tw="flex flex-col w-[1160px]">
      <div tw="flex h-[32px]" />
      <div tw={`flex flex-col relative w-[1160px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw="flex h-[44px]">
          <div tw={`flex absolute left-[500px] top-[13px] w-[160px] h-[18px] bg-[${SKELETON_COLOR}] rounded-[4px]`} />
        </div>
        <div tw={`flex absolute top-[44px] left-0 w-[1160px] h-px bg-[${SKELETON_COLOR}]`} />
        {Array.from({ length: 5 }, (_, weekIndex) => (
          <WeekRow key={weekIndex} weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={92} />
        ))}
      </div>
      <div tw="flex h-[12px]" />
      <div tw={`flex w-[1160px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw={`flex items-center w-[200px] pl-[24px]`}>
          <div tw={`flex w-[90px] h-[14px] bg-[${SKELETON_COLOR}] rounded-[3px]`} />
        </div>
        <div tw={`flex w-px self-stretch bg-[${SKELETON_COLOR}]`} />
        <div tw="flex flex-col justify-center flex-1 pt-[14px] pb-[14px]">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} tw={`flex items-center h-[36px] pl-[20px]`}>
              <div tw={`flex flex-1 h-[12px] bg-[${SKELETON_COLOR}] rounded-[3px] mr-[24px]`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  return renderToSvg(<ScheduleSkeletonRoot />, 1160);
}
```

Note on `rowHeight={92}`: `weekRowHeight(1)` = `40 + 1*42 + 0 + 10 = 92`. The skeleton always uses 1 lane, so this is a stable constant.

Note on `left-[500px]`: original formula was `TOTAL_WIDTH / 2 - 80 = 1160/2 - 80 = 500`. Hardcoded directly.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Full build**

```bash
npm run build
```

Expected: builds successfully with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/skeleton/schedule.tsx
git commit -m "refactor: restructure skeleton to flex-col, remove all dimension constants"
```
