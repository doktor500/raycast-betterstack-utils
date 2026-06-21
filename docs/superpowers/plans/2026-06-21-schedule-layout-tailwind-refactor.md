# Schedule Layout Tailwind Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete both `constants.ts` files from the week and month schedule components, replacing shared dimensional constants with flex layout self-sizing and inline Tailwind arbitrary values.

**Architecture:** Restructure day columns as `flex-1` children so widths are self-computed. Time-based positions (events, current-time markers) use percentage-based absolute positioning relative to containers with defined heights. Fixed design dimensions become inline Tailwind arbitrary values at point of use.

**Tech Stack:** React, Satori (SVG renderer), Tailwind (via `tw` prop)

## Global Constraints

- All components render via Satori using the `tw` prop — no CSS-in-JS, no `className`
- `position: absolute` elements with `top: X%` require the parent to have an explicit height defined (e.g., `h-[480px]`)
- Do not use `style` prop unless mixing `%` and `px` in the same property (calc)
- No new dependencies
- TypeScript must pass: `npm run ts:check`
- Build must pass: `npm run build`

---

## File Map

**Create:**
- `src/ui/schedule/components/month/month-utils.ts` — extracted helper functions (weekRowHeight, summaryBlockHeight, formatMonthLabel)

**Delete:**
- `src/ui/schedule/components/week/constants.ts`
- `src/ui/schedule/components/week/hour-grid-lines.tsx`
- `src/ui/schedule/components/week/week-events.tsx`
- `src/ui/schedule/components/month/constants.ts`

**Modify:**
- `week/event-segment.tsx` — remove colLeft/colWidth/gridTop props; use `%` top + `px` height
- `week/current-time-marker.tsx` — change props to `{ fraction: number }`; render inside DayColumn
- `week/day-column.tsx` — flex-1 column; absorb getDaySegments from WeekEvents; render events + marker
- `week/hour-labels.tsx` — 24 stacked `h-[20px]` cells with 44px top spacer
- `week/week-schedule.tsx` — flex-row root; sidebar + 7 DayColumns; pass events/nowFraction
- `month/span-bars.ts` — inline `DAY_MS`
- `month/span-bar.tsx` — percentage left/width; local ROW_TOP/ROW_HEIGHT/BAR_GAP consts
- `month/current-time-marker.tsx` — percentage left positioning
- `month/day-column.tsx` — flex-1 cell; flex header; no left/width calc
- `month/week-group.tsx` — remove MONTH.WIDTH; use w-full
- `month/month-block.tsx` — inline BLOCK_HEADER_HEIGHT; import formatMonthLabel from month-utils
- `month/summary-block.tsx` — inline SUMMARY consts; import helpers from month-utils
- `month/month-schedule.tsx` — inline MONTH.WIDTH/BLOCK_GAP/SUMMARY_GAP; import helpers from month-utils
- `week/week-row.tsx` — local inline constants replacing MONTH.* imports
- `skeleton/schedule.tsx` — inline MONTH.WIDTH/BLOCK_HEADER_HEIGHT/SUMMARY_GAP; import helpers from month-utils

---

## Task 1: Create month/month-utils.ts and update its importers

**Files:**
- Create: `src/ui/schedule/components/month/month-utils.ts`
- Modify: `src/ui/schedule/components/month/summary-block.tsx` (import)
- Modify: `src/ui/schedule/components/month/month-block.tsx` (import)
- Modify: `src/ui/schedule/components/month/month-schedule.tsx` (import)
- Modify: `src/ui/schedule/skeleton/schedule.tsx` (import)

**Interfaces:**
- Produces: `weekRowHeight(maxLanes: number): number`, `summaryBlockHeight(entryCount: number): number`, `formatMonthLabel(currentMonth: { year: number; month: number }): string`

- [ ] **Step 1: Create month-utils.ts with inlined values**

```ts
// src/ui/schedule/components/month/month-utils.ts
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
```

- [ ] **Step 2: Update importers to use month-utils**

In `src/ui/schedule/components/month/summary-block.tsx`, change the import line:
```ts
// Before:
import { MONTH, SUMMARY, summaryBlockHeight, formatMonthLabel } from "@/ui/schedule/components/month/constants";
// After:
import { summaryBlockHeight, formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
```

In `src/ui/schedule/components/month/month-block.tsx`, change:
```ts
// Before:
import { formatMonthLabel } from "@/ui/schedule/components/month/constants";
// After:
import { formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
```

In `src/ui/schedule/components/month/month-schedule.tsx`, change:
```ts
// Before:
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/constants";
// After:
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/month-utils";
```

In `src/ui/schedule/skeleton/schedule.tsx`, change:
```ts
// Before:
import { MONTH, SUMMARY, weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/constants";
// After:
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/month-utils";
```

- [ ] **Step 3: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/month/month-utils.ts \
        src/ui/schedule/components/month/summary-block.tsx \
        src/ui/schedule/components/month/month-block.tsx \
        src/ui/schedule/components/month/month-schedule.tsx \
        src/ui/schedule/skeleton/schedule.tsx
git commit -m "refactor: extract month helper functions to month-utils.ts"
```

---

## Task 2: Refactor week/event-segment.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/event-segment.tsx`

**Interfaces:**
- Produces: `EventSegment({ segment: DaySegment })` — renders inside DayColumn's timeline; no positional props

- [ ] **Step 1: Rewrite event-segment.tsx**

Replace the full file contents:

```tsx
// src/ui/schedule/components/week/event-segment.tsx
import { getThemeColor } from "@/common/colors";
import { truncateLabel } from "@/common/utils/string-utils";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
}

const TEXT_AVAILABLE_WIDTH = 140; // approx day column width minus left padding and label inset

export function EventSegment({ segment }: EventSegmentProps) {
  const topPercent = segment.startFraction * 100;
  const height = Math.max(12, (segment.endFraction - segment.startFraction) * 480);
  const themeColor = getThemeColor(segment.color);
  const showName = height >= 24;

  return (
    <div tw={`flex absolute left-[2px] right-[2px] top-[${topPercent}%] h-[${height}px] bg-[${segment.color}] rounded-[3px] overflow-hidden`}>
      {showName && (
        <span tw={`absolute left-[12px] top-[4px] text-[14px] font-semibold text-[${themeColor}] whitespace-nowrap`}>
          {truncateLabel(segment.label, TEXT_AVAILABLE_WIDTH, 14)}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors (WeekEvents still imports EventSegment with old props — mismatch will surface here; it's fine since WeekEvents will be deleted in Task 6)

Note: If ts:check reports errors about WeekEvents calling EventSegment with old props, that's expected — WeekEvents will be deleted in Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/week/event-segment.tsx
git commit -m "refactor: event-segment uses % top positioning, no positional props"
```

---

## Task 3: Refactor week/current-time-marker.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/current-time-marker.tsx`

**Interfaces:**
- Produces: `CurrentTimeMarker({ fraction: number })` — renders at `fraction * 100%` top inside a `h-[480px]` timeline container

- [ ] **Step 1: Rewrite current-time-marker.tsx**

```tsx
// src/ui/schedule/components/week/current-time-marker.tsx
interface CurrentTimeMarkerProps {
  fraction: number;
}

export function CurrentTimeMarker({ fraction }: CurrentTimeMarkerProps) {
  const topPercent = fraction * 100;

  return (
    <div tw={`flex absolute left-[4px] right-[4px] top-[${topPercent}%] h-[4px] bg-white opacity-[0.85] rounded-[2px]`} />
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: errors about old call sites using `todayIndex`/`markerY` — these are in `week-schedule.tsx` which will be fixed in Task 6. The component itself should be valid.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/week/current-time-marker.tsx
git commit -m "refactor: week current-time-marker takes fraction prop, renders inside DayColumn"
```

---

## Task 4: Refactor week/day-column.tsx

Absorbs the day-segment logic from WeekEvents. Becomes a self-contained flex-1 column with header, 24 hour-row dividers, events, and current-time marker.

**Files:**
- Modify: `src/ui/schedule/components/week/day-column.tsx`

**Interfaces:**
- Consumes: `EventSegment({ segment })` from `./event-segment`, `CurrentTimeMarker({ fraction })` from `./current-time-marker`
- Produces: `DayColumn({ day: Date, dayIndex: number, isToday: boolean, events: OnCallEvent[], nowFraction?: number })`

- [ ] **Step 1: Rewrite day-column.tsx**

```tsx
// src/ui/schedule/components/week/day-column.tsx
import { Colors } from "@/common/colors";
import { formatWeekday } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { getColor } from "@/common/colors";
import { formatUserName } from "@/domain/user";
import { EventSegment, type DaySegment } from "@/ui/schedule/components/week/event-segment";
import { CurrentTimeMarker } from "@/ui/schedule/components/week/current-time-marker";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  events: OnCallEvent[];
  nowFraction?: number;
}

function getDaySegments(events: OnCallEvent[], dayStart: Date): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.startedAt).getTime();
    const eventEnd = new Date(event.endedAt).getTime();
    const segStart = Math.max(eventStart, dayStartMs);
    const segEnd = Math.min(eventEnd, dayEndMs);
    if (segEnd <= segStart) return [];

    const userName = formatUserName(event.user);
    const color = getColor(userName);

    return [
      {
        startFraction: (segStart - dayStartMs) / DAY_MS,
        endFraction: (segEnd - dayStartMs) / DAY_MS,
        label: userName,
        color,
      },
    ];
  });
}

export function DayColumn({ day, dayIndex, isToday, events, nowFraction }: DayColumnProps) {
  const segments = getDaySegments(events, day);
  const weekdayOpacity = isToday ? 1 : 0.65;
  const dateOpacity = isToday ? 1 : 0.75;

  return (
    <div tw="flex flex-col flex-1 relative">
      {isToday && (
        <div tw={`flex absolute top-0 left-0 right-0 h-[44px] rounded-[6px] bg-[${Colors.DEEP_DARK}] opacity-50`} />
      )}
      <div tw="flex items-center justify-center h-[44px] gap-[4px]">
        <span tw={`text-[13px] font-semibold text-white opacity-[${weekdayOpacity}]`}>
          {`${formatWeekday(day)} `}
        </span>
        <span tw={`text-[16px] font-semibold text-white opacity-[${dateOpacity}]`}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
      <div tw={`flex relative h-[480px] ${dayIndex > 0 ? `border-l border-[${Colors.SLATE}]` : ""}`}>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={`hr${i}`} tw={`flex absolute left-0 right-0 top-[${i * 20}px] h-px bg-[${Colors.SLATE}]`} />
        ))}
        {segments.map((segment, i) => (
          <EventSegment key={`ev${i}`} segment={segment} />
        ))}
        {nowFraction !== undefined && <CurrentTimeMarker fraction={nowFraction} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: errors about week-schedule.tsx passing old DayColumn props — those will be fixed in Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/week/day-column.tsx
git commit -m "refactor: DayColumn is flex-1 column with timeline; absorbs event rendering"
```

---

## Task 5: Refactor week/hour-labels.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/hour-labels.tsx`

**Interfaces:**
- Produces: `HourLabels()` — no props; renders 24 × `h-[20px]` cells with a 44px top spacer to align with the day column timeline

- [ ] **Step 1: Rewrite hour-labels.tsx**

```tsx
// src/ui/schedule/components/week/hour-labels.tsx
import { Colors } from "@/common/colors";

export function HourLabels() {
  return (
    <div tw="flex flex-col w-[25px]">
      <div tw="flex h-[44px]" />
      {Array.from({ length: 24 }, (_, i) => (
        <div key={`hl${i}`} tw={`flex items-center justify-end w-[23px] h-[20px] text-[10px] text-[${Colors.DIM}] font-mono`}>
          {i}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: errors about old call site passing `gridTop` — will be fixed in Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/week/hour-labels.tsx
git commit -m "refactor: HourLabels stacks 24 cells; no calculated positions"
```

---

## Task 6: Refactor week/week-schedule.tsx and delete dead files

Wire up the new flex-row root. Delete HourGridLines and WeekEvents (both made redundant by the DayColumn refactor).

**Files:**
- Modify: `src/ui/schedule/components/week/week-schedule.tsx`
- Delete: `src/ui/schedule/components/week/hour-grid-lines.tsx`
- Delete: `src/ui/schedule/components/week/week-events.tsx`

**Interfaces:**
- Consumes: `DayColumn({ day, dayIndex, isToday, events, nowFraction? })`, `HourLabels()`, `OnCallPill`

- [ ] **Step 1: Rewrite week-schedule.tsx**

```tsx
// src/ui/schedule/components/week/week-schedule.tsx
import React from "react";
import { getCurrentWeekDays, isSameDay, TimeWindow } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { DayColumn } from "@/ui/schedule/components/week/day-column";
import { HourLabels } from "@/ui/schedule/components/week/hour-labels";
import { Colors } from "@/common/colors";
import { renderToSvg } from "@/components/satori-renderer";

interface WeekViewProps {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
}

function WeekViewRoot({ events, window, onCallUser }: WeekViewProps) {
  const today = new Date();
  const days = getCurrentWeekDays(window.start);
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  const bannerHeight = onCallUser ? ON_CALL_PILL_CIRC_R * 2 : 0;
  const totalHeight = bannerHeight + 524; // 44px header + 480px timeline

  const todayStartMs =
    todayIndex >= 0 ? new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() : 0;
  const nowFraction =
    todayIndex >= 0 ? (today.getTime() - todayStartMs) / (24 * 3600 * 1000) : 0;

  const bgColor = onCallUser ? "transparent" : Colors.DARK;

  return (
    <div tw={`flex flex-col w-[1160px] h-[${totalHeight}px] bg-[${bgColor}]`}>
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      <div tw="flex h-[524px]">
        <HourLabels />
        {days.map((day, dayIndex) => (
          <DayColumn
            key={dayIndex}
            day={day}
            dayIndex={dayIndex}
            isToday={isSameDay(day, today)}
            events={events}
            nowFraction={dayIndex === todayIndex ? nowFraction : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export async function buildWeekViewSvg(props: WeekViewProps): Promise<string> {
  const bannerHeight = props.onCallUser ? ON_CALL_PILL_CIRC_R * 2 : 0;
  const totalHeight = bannerHeight + 524;
  return renderToSvg(<WeekViewRoot {...props} />, 1160, totalHeight);
}
```

- [ ] **Step 2: Delete dead files**

```bash
rm src/ui/schedule/components/week/hour-grid-lines.tsx
rm src/ui/schedule/components/week/week-events.tsx
```

- [ ] **Step 3: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/week/week-schedule.tsx
git add -u src/ui/schedule/components/week/
git commit -m "refactor: week-schedule uses flex-row layout; delete HourGridLines and WeekEvents"
```

---

## Task 7: Delete week/constants.ts

**Files:**
- Delete: `src/ui/schedule/components/week/constants.ts`

- [ ] **Step 1: Delete constants file**

```bash
rm src/ui/schedule/components/week/constants.ts
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors (no remaining imports)

- [ ] **Step 3: Commit**

```bash
git add -u src/ui/schedule/components/week/
git commit -m "refactor: delete week/constants.ts"
```

---

## Task 8: Refactor month/span-bars.ts

**Files:**
- Modify: `src/ui/schedule/components/month/span-bars.ts`

- [ ] **Step 1: Replace MONTH.DAY_MS with inline value**

In `span-bars.ts`, change the import and replace all `MONTH.DAY_MS` occurrences:

```ts
// Remove this import line entirely:
// import { MONTH } from "@/ui/schedule/components/month/constants";

// Add this local constant near the top of the file (after other imports):
const DAY_MS = 24 * 3600 * 1000;
```

Then replace the three `MONTH.DAY_MS` occurrences with `DAY_MS`:
- `windowEnd = dayStarts[last] + MONTH.DAY_MS` → `windowEnd = dayStarts[last] + DAY_MS`
- `/ MONTH.DAY_MS` in `dayFraction` → `/ DAY_MS`
- `timestamp < start + MONTH.DAY_MS` in `findStartPosition` → `timestamp < start + DAY_MS`
- `timestamp <= start + MONTH.DAY_MS` in `findEndPosition` → `timestamp <= start + DAY_MS`

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/month/span-bars.ts
git commit -m "refactor: inline DAY_MS in span-bars.ts"
```

---

## Task 9: Refactor month/span-bar.tsx

Replace `MONTH.DAY_WIDTH` with percentage-based positioning. Keep lane-stacking values as local constants.

**Files:**
- Modify: `src/ui/schedule/components/month/span-bar.tsx`

- [ ] **Step 1: Rewrite span-bar.tsx**

```tsx
// src/ui/schedule/components/month/span-bar.tsx
import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { truncateLabel } from "@/common/utils/string-utils";
import { getThemeColor } from "@/common/colors";

interface SpanBarProps {
  bar: WeekSpanBar;
}

const H_GAP_FRACTION = 3 / 1160; // 3px gap as fraction of the 1160px row width
const ROW_TOP = 40;
const ROW_HEIGHT = 42;
const BAR_GAP = 4;

export function SpanBar({ bar }: SpanBarProps) {
  const startFrac = (bar.startDayIndex + bar.startFraction) / 7;
  const endFrac = (bar.endDayIndex + bar.endFraction) / 7;
  const barLeft = (startFrac + H_GAP_FRACTION) * 100;
  const barWidth = Math.max((endFrac - startFrac - 2 * H_GAP_FRACTION) * 100, 0.2);
  const barTop = ROW_TOP + bar.lane * (ROW_HEIGHT + BAR_GAP);
  const themeColor = getThemeColor(bar.color);
  const approxBarPx = barWidth * 11.6; // barWidth% of 1160px, for label truncation
  const textAvailWidth = approxBarPx - 22;
  const borderRadius = Math.min(6, Math.floor(approxBarPx / 3));
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, 16) : "";

  return (
    <div tw={`flex items-center absolute left-[${barLeft}%] top-[${barTop}px] w-[${barWidth}%] h-[${ROW_HEIGHT}px] bg-[${bar.color}] rounded-[${borderRadius}px] shadow-[0_2px_4px_rgba(11,12,21,0.3)] overflow-hidden`}>
      {label && (
        <span tw={`pl-[12px] text-[16px] font-semibold text-[${themeColor}] whitespace-nowrap`}>
          {label}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/month/span-bar.tsx
git commit -m "refactor: span-bar uses percentage left/width; local ROW_TOP/ROW_HEIGHT/BAR_GAP"
```

---

## Task 10: Refactor month/current-time-marker.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/current-time-marker.tsx`

- [ ] **Step 1: Rewrite current-time-marker.tsx**

```tsx
// src/ui/schedule/components/month/current-time-marker.tsx
interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

const DAY_HEADER_HEIGHT = 30;

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const leftPercent = ((index + fraction) / 7) * 100;

  return (
    <div tw={`flex absolute left-[${leftPercent}%] top-[${DAY_HEADER_HEIGHT}px] w-[4px] h-[${rowHeight - DAY_HEADER_HEIGHT}px] bg-white opacity-[0.85] rounded-[2px]`} />
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/month/current-time-marker.tsx
git commit -m "refactor: month current-time-marker uses percentage left positioning"
```

---

## Task 11: Refactor month/day-column.tsx and month/week-group.tsx

Day cells become `flex-1` children (no `left` calculation). WeekGroup removes `MONTH.WIDTH` references.

**Files:**
- Modify: `src/ui/schedule/components/month/day-column.tsx`
- Modify: `src/ui/schedule/components/month/week-group.tsx`

- [ ] **Step 1: Rewrite month/day-column.tsx**

```tsx
// src/ui/schedule/components/month/day-column.tsx
import { formatWeekday } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";

const WEEKEND_STRIPES_TW =
  "repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(45,55,76,0.5)_3px,rgba(45,55,76,0.5)_4px)";

const DAY_HEADER_HEIGHT = 30;

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;
  const weekendOpacity = inMonth ? 1 : 0.3;

  return (
    <div tw={`flex flex-1 relative h-[${rowHeight}px]`}>
      {columnBg !== "none" && (
        <div tw={`flex absolute inset-0 bg-[${columnBg}]`} />
      )}
      {isWeekend && (
        <div tw={`flex absolute inset-0 bg-[${WEEKEND_STRIPES_TW}] opacity-[${weekendOpacity}]`} />
      )}
      {inMonth && (
        <>
          <div tw={`flex absolute left-0 top-0 w-px h-[${rowHeight}px] bg-[${Colors.SLATE}]`} />
          <div tw={`flex absolute left-0 top-[${DAY_HEADER_HEIGHT}px] right-0 h-px bg-[${Colors.SLATE}]`} />
          <div tw={`flex items-center justify-end absolute left-0 top-[4px] w-[50%] pr-[3px] h-[${DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[13px] font-semibold text-[${Colors.DIM}]`}>
              {formatWeekday(day)}
            </span>
          </div>
          <div tw={`flex items-center absolute left-[50%] pl-[3px] top-[4px] h-[${DAY_HEADER_HEIGHT - 4}px]`}>
            <span tw={`text-[16px] font-semibold text-[${Colors.SUBTLE}]`}>
              {day.getDate()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite month/week-group.tsx**

```tsx
// src/ui/schedule/components/month/week-group.tsx
import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { isSameDay } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { DayColumn } from "@/ui/schedule/components/month/day-column";
import { SpanBar } from "@/ui/schedule/components/month/span-bar";
import { CurrentTimeMarker } from "@/ui/schedule/components/month/current-time-marker";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  weekIndex: number;
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  weekIndex,
  currentMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <div tw={`flex relative w-full h-[${rowHeight}px]`}>
      {weekIndex > 0 && (
        <div tw={`flex absolute top-0 left-0 right-0 h-px bg-[${Colors.SLATE}]`} />
      )}
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          index={index}
          currentMonth={currentMonth}
          columnBg={columnBg}
          rowHeight={rowHeight}
        />
      ))}
      {weekTimeline.map((bar, index) => (
        <SpanBar key={index} bar={bar} />
      ))}
      {showTodayMarker && todayIndex >= 0 && (
        <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/month/day-column.tsx \
        src/ui/schedule/components/month/week-group.tsx
git commit -m "refactor: month day-column is flex-1; week-group uses w-full"
```

---

## Task 12: Refactor month/month-block.tsx and month/summary-block.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/month-block.tsx`
- Modify: `src/ui/schedule/components/month/summary-block.tsx`

- [ ] **Step 1: Rewrite month-block.tsx**

```tsx
// src/ui/schedule/components/month/month-block.tsx
import { type WeekSpanBar } from "@/ui/schedule/components/month/span-bars";
import { formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
import { Colors } from "@/common/colors";
import { WeekGroup } from "@/ui/schedule/components/month/week-group";

interface MonthBlockProps {
  weeks: Date[][];
  blockHeight: number;
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  blockHeight,
  today,
  weekTimelines,
  currentMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonthLabel(currentMonth);

  return (
    <div tw={`flex flex-col relative w-[1160px] h-[${blockHeight}px] border border-[${Colors.SLATE}] overflow-hidden`}>
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

- [ ] **Step 2: Rewrite summary-block.tsx**

```tsx
// src/ui/schedule/components/month/summary-block.tsx
import { summaryBlockHeight, formatMonthLabel } from "@/ui/schedule/components/month/month-utils";
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
  const height = summaryBlockHeight(summary.length);

  return (
    <div tw={`flex w-[1160px] h-[${height}px] rounded-[10px] border border-[${Colors.SLATE}] bg-[${Colors.DARK}] overflow-hidden`}>
      <div tw={`flex items-center w-[200px] pl-[24px] border-r border-[${Colors.SLATE}]`}>
        <span tw={`text-[18px] font-bold text-[${Colors.FROST}]`}>{monthLabel}</span>
      </div>
      <div tw={`flex flex-col justify-center flex-1 pt-[14px] pb-[14px]`}>
        {summary.map(({ teamMember, email, hours, color }, index) => (
          <div key={index} tw={`flex items-center h-[36px] pl-[20px]`}>
            <div tw={`flex w-[12px] h-[12px] rounded-full bg-[${color}] mr-[10px]`} />
            <span tw={`flex-1 text-[17px] font-semibold text-[${Colors.SUBTLE}]`}>
              {`${teamMember} - ${email}`}
            </span>
            <span tw={`text-[15px] text-[${Colors.DIM}] pr-[24px]`}>
              {formatDaysHours(hours)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/month/month-block.tsx \
        src/ui/schedule/components/month/summary-block.tsx
git commit -m "refactor: month-block and summary-block inline dimensional constants"
```

---

## Task 13: Refactor month/month-schedule.tsx, week/week-row.tsx, and skeleton/schedule.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/month-schedule.tsx`
- Modify: `src/ui/schedule/components/week/week-row.tsx`
- Modify: `src/ui/schedule/skeleton/schedule.tsx`

- [ ] **Step 1: Rewrite month-schedule.tsx**

```tsx
// src/ui/schedule/components/month/month-schedule.tsx
import React, { Fragment } from "react";
import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { buildWeekSpanBars } from "@/ui/schedule/components/month/span-bars";
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/month-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month/summary-block";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";
import { renderToSvg } from "@/components/satori-renderer";

type Props = {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
};

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

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
    weekTimelines.map((timeline) => weekRowHeight(Math.max(1, ...timeline.map((bar) => bar.lane + 1)))),
  );

  const summaries = monthGroups.map(({ year, month }) => computeOnCallSummary({ year, month, events }));

  return { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries };
}

function computeTotalHeight(
  monthGroups: ReturnType<typeof buildMonthData>["monthGroups"],
  weekRowHeightsByMonth: ReturnType<typeof buildMonthData>["weekRowHeightsByMonth"],
  summaries: ReturnType<typeof buildMonthData>["summaries"],
  topBannerHeight: number,
): number {
  const calendarHeight = (monthIndex: number) =>
    44 + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  const monthTotalHeight = (monthIndex: number) =>
    calendarHeight(monthIndex) + 12 + summaryBlockHeight(summaries[monthIndex].length);

  return (
    topBannerHeight +
    monthGroups.reduce((acc, _, monthIndex) => acc + monthTotalHeight(monthIndex), 0) +
    (monthGroups.length - 1) * 40
  );
}

function CombinedScheduleRoot({ events, window, onCallUser }: Props) {
  const today = new Date();
  const showTodayMarker = !!onCallUser;
  const backgroundColor = onCallUser ? "transparent" : Colors.DARK;
  const columnBg = onCallUser ? Colors.DARK : "none";

  const { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries } = buildMonthData(events, window);

  const calendarHeight = (monthIndex: number) =>
    44 + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  return (
    <div tw={`flex flex-col w-[1160px] bg-[${backgroundColor}]`}>
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            blockHeight={calendarHeight(monthIndex)}
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
  const topBannerHeight = props.onCallUser ? ON_CALL_PILL_BANNER : 0;
  const { monthGroups, weekRowHeightsByMonth, summaries } = buildMonthData(props.events, props.window);
  const totalHeight = computeTotalHeight(monthGroups, weekRowHeightsByMonth, summaries, topBannerHeight);
  return renderToSvg(<CombinedScheduleRoot {...props} />, 1160, totalHeight);
}
```

- [ ] **Step 2: Rewrite week/week-row.tsx**

```tsx
// src/ui/schedule/components/week/week-row.tsx
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

const TOTAL_WIDTH = 1160;
const DAY_WIDTH = TOTAL_WIDTH / 7;
const DAY_HEADER_HEIGHT = 30;
const ROW_TOP = 40;
const ROW_HEIGHT = 42;
const H_GAP = 3;

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${rowHeight}px]`}>
      {weekIndex > 0 && (
        <div tw={`flex absolute top-0 left-0 w-[${TOTAL_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />
      )}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * DAY_WIDTH;
        return (
          <div key={dayIndex} tw="flex">
            <div tw={`flex absolute left-[${left}px] top-0 w-px h-[${rowHeight}px] bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left}px] top-[${DAY_HEADER_HEIGHT}px] w-[${DAY_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />
            <div tw={`flex absolute left-[${left + DAY_WIDTH / 2 - 20}px] top-[5px] w-[39px] h-[15px] bg-[${SKELETON_COLOR}] rounded-[2px]`} />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * DAY_WIDTH + H_GAP;
        const barWidth = (end - start) * DAY_WIDTH - 2 * H_GAP;
        return (
          <div key={index} tw={`flex absolute left-[${barLeft}px] top-[${ROW_TOP}px] w-[${barWidth}px] h-[${ROW_HEIGHT}px] rounded-[6px] bg-[${SKELETON_COLOR}]`} />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite skeleton/schedule.tsx**

```tsx
// src/ui/schedule/skeleton/schedule.tsx
import React from "react";
import { weekRowHeight, summaryBlockHeight } from "@/ui/schedule/components/month/month-utils";
import { ON_CALL_PILL_CIRC_R } from "@/ui/schedule/components/on-call-pill";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/components/satori-renderer";

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

const NUM_WEEKS = 5;
const NUM_SUMMARY = 3;
const BLOCK_HEADER_HEIGHT = 44;
const SUMMARY_GAP = 12;
const SUMMARY_MONTH_COL_WIDTH = 200;
const TOTAL_WIDTH = 1160;

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

function ScheduleSkeletonRoot() {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);

  return (
    <div tw={`flex flex-col w-[${TOTAL_WIDTH}px]`}>
      <div tw={`flex h-[${ON_CALL_PILL_BANNER}px]`} />
      <div tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${calendarHeight}px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw={`flex absolute left-[${TOTAL_WIDTH / 2 - 80}px] top-[13px] w-[160px] h-[18px] bg-[${SKELETON_COLOR}] rounded-[4px]`} />
        <div tw={`flex absolute top-[${BLOCK_HEADER_HEIGHT}px] left-0 w-[${TOTAL_WIDTH}px] h-px bg-[${SKELETON_COLOR}]`} />
        {Array.from({ length: NUM_WEEKS }, (_, weekIndex) => (
          <div key={weekIndex} tw={`flex absolute top-[${BLOCK_HEADER_HEIGHT + weekIndex * rowHeight}px] left-0`}>
            <WeekRow weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={rowHeight} />
          </div>
        ))}
      </div>
      <div tw={`flex h-[${SUMMARY_GAP}px]`} />
      <div tw={`flex relative w-[${TOTAL_WIDTH}px] h-[${summaryHeight}px] rounded-[10px] border border-[${SKELETON_COLOR}]`}>
        <div tw="flex absolute inset-0 rounded-[10px] bg-[rgba(40,53,78,0.2)]" />
        <div tw={`flex absolute left-[24px] top-[${summaryHeight / 2 - 5}px] w-[90px] h-[14px] bg-[${SKELETON_COLOR}] rounded-[3px]`} />
        <div tw={`flex absolute left-[${SUMMARY_MONTH_COL_WIDTH}px] top-[16px] w-px h-[${summaryHeight - 32}px] bg-[${SKELETON_COLOR}]`} />
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);
  const totalHeight = ON_CALL_PILL_BANNER + calendarHeight + SUMMARY_GAP + summaryHeight;
  return renderToSvg(<ScheduleSkeletonRoot />, TOTAL_WIDTH, totalHeight);
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/ui/schedule/components/month/month-schedule.tsx \
        src/ui/schedule/components/week/week-row.tsx \
        src/ui/schedule/skeleton/schedule.tsx
git commit -m "refactor: inline month/week constants in month-schedule, week-row, skeleton"
```

---

## Task 14: Delete month/constants.ts and final build check

**Files:**
- Delete: `src/ui/schedule/components/month/constants.ts`

- [ ] **Step 1: Delete constants file**

```bash
rm src/ui/schedule/components/month/constants.ts
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 3: Full build verification**

Run: `npm run build`
Expected: build succeeds with no errors

- [ ] **Step 4: Final commit**

```bash
git add -u src/ui/schedule/components/month/
git commit -m "refactor: delete month/constants.ts — layout now uses Tailwind and local inline values"
```
